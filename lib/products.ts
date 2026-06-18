import { createPublicClient } from '@/lib/supabase/public'

/** Eje de display editable en el panel /empleados (#18). */
export type StockStatus = 'en_stock' | 'consultar' | 'proximamente'

/** Variante visual del badge del catálogo, derivada de stock_status + disponible. */
export type BadgeVariant = 'stock' | 'consult' | 'new' | 'out'

export interface Subcategory {
  id: string
  parentId: string
  label: string
  count: number
}

export interface Category {
  id: string
  label: string
  count: number
  subcategories: Subcategory[]
}

export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  categoryLabel: string
  subcategoryLabel: string
  image: string
  images?: string[]
  stockStatus: StockStatus
  /** físico − comprometido; null cuando el producto no rastrea stock. */
  disponible: number | null
  /** true si el catálogo debe mostrarlo como disponible para pedir. */
  inStock: boolean
  priceRetail?: string
  priceWholesale?: string
  description?: string
}

type ProductRow = {
  id: string
  name: string
  category_id: string
  subcategory_id: string
  image: string
  images: string[] | null
  stock_status: string
  disponible: number | null
  en_stock: boolean
  price_retail: string | null
  price_wholesale: string | null
  description: string | null
  category_label: string
  subcategory_label: string
}

type CategoryRow = {
  id: string
  label: string
  sort_order: number
  subcategories: Array<{ id: string; category_id: string; label: string; sort_order: number }>
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createPublicClient()
  // products_with_stock embebe los labels y calcula disponible/en_stock (físico −
  // comprometido). La vista es security_invoker, así que la RLS de products sigue
  // limitando a anon a los activos; el .eq('active', true) es defensa en profundidad.
  const { data, error } = await supabase
    .from('products_with_stock')
    .select<string, ProductRow>(`
      id, name, category_id, subcategory_id, image, images, stock_status,
      disponible, en_stock, price_retail, price_wholesale, description,
      category_label, subcategory_label
    `)
    .eq('active', true)
    .order('sort_order')

  if (error) throw error

  return (data ?? []).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category_id,
    subcategory: p.subcategory_id,
    categoryLabel: p.category_label,
    subcategoryLabel: p.subcategory_label,
    image: p.image,
    images: p.images ?? undefined,
    stockStatus: p.stock_status as StockStatus,
    disponible: p.disponible,
    inStock: p.en_stock,
    priceRetail: p.price_retail ?? undefined,
    priceWholesale: p.price_wholesale ?? undefined,
    description: p.description ?? undefined,
  }))
}

/**
 * Badge del catálogo: compone el display manual (stock_status) con el disponible
 * derivado. 'consultar'/'proximamente' mandan; 'en_stock' refleja la disponibilidad.
 */
export function catalogBadge(product: Pick<Product, 'stockStatus' | 'inStock'>): {
  variant: BadgeVariant
  label: string
} {
  if (product.stockStatus === 'consultar') return { variant: 'consult', label: 'Consultar' }
  if (product.stockStatus === 'proximamente') return { variant: 'new', label: 'Próximamente' }
  return product.inStock
    ? { variant: 'stock', label: 'En stock' }
    : { variant: 'out', label: 'Sin stock' }
}

async function getCategoryRows(): Promise<CategoryRow[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('categories')
    .select<string, CategoryRow>('id, label, sort_order, subcategories(id, category_id, label, sort_order)')
    .order('sort_order')

  if (error) throw error
  return data ?? []
}

/** Productos y categorías (con conteos) en una sola pasada, consultados en paralelo. */
export async function getCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  const [products, categoryRows] = await Promise.all([getProducts(), getCategoryRows()])

  const categories = categoryRows.map(cat => ({
    id: cat.id,
    label: cat.label,
    count: products.filter(p => p.category === cat.id).length,
    subcategories: cat.subcategories
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(sub => ({
        id: sub.id,
        parentId: cat.id,
        label: sub.label,
        count: products.filter(p => p.subcategory === sub.id).length,
      })),
  }))

  return { products, categories }
}
