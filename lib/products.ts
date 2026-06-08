import { createClient } from '@/lib/supabase/server'

export type BadgeVariant = 'stock' | 'consult' | 'new'

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
  badge: BadgeVariant
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
  badge: string
  price_retail: string | null
  price_wholesale: string | null
  description: string | null
  category: { label: string }
  subcategory: { label: string }
}

type CategoryRow = {
  id: string
  label: string
  sort_order: number
  subcategories: Array<{ id: string; category_id: string; label: string; sort_order: number }>
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select<string, ProductRow>(`
      id, name, category_id, subcategory_id, image, images, badge, price_retail, price_wholesale, description,
      category:categories!category_id(label),
      subcategory:subcategories!subcategory_id(label)
    `)
    .eq('active', true)
    .order('sort_order')

  if (error) throw error

  return (data ?? []).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category_id,
    subcategory: p.subcategory_id,
    categoryLabel: p.category.label,
    subcategoryLabel: p.subcategory.label,
    image: p.image,
    images: p.images ?? undefined,
    badge: p.badge as BadgeVariant,
    priceRetail: p.price_retail ?? undefined,
    priceWholesale: p.price_wholesale ?? undefined,
    description: p.description ?? undefined,
  }))
}

export async function getCategories(products: Product[]): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select<string, CategoryRow>('id, label, sort_order, subcategories(id, category_id, label, sort_order)')
    .order('sort_order')

  if (error) throw error

  return (data ?? []).map(cat => ({
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
}
