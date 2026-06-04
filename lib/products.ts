export type BadgeVariant = 'stock' | 'consult' | 'new'

export interface Product {
  id: string
  name: string
  category: string
  categoryLabel: string
  image: string
  badge: BadgeVariant
}

export const CATEGORIES = [
  { id: 'todos',        label: 'Todos los productos', count: 13 },
  { id: 'tapas',        label: 'Tapas · Cierres',     count: 4  },
  { id: 'frascos',      label: 'Frascos',              count: 4  },
  { id: 'envases',      label: 'Envases',              count: 1  },
  { id: 'dosificacion', label: 'Dosificación',         count: 1  },
  { id: 'dispensers',   label: 'Dispensers',           count: 1  },
  { id: 'accesorios',   label: 'Accesorios',           count: 2  },
] as const

export const PRODUCTS: Product[] = [
  { id: 'tapas-valvulas-15mm', name: 'Tapas Válvulas Engrimpe 15mm', category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-valvulas-15mm.jpg',     badge: 'stock'   },
  { id: 'tapas-valvulas-20mm', name: 'Tapas Válvulas Engrimpe 20mm', category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-valvulas-20mm.jpg',     badge: 'stock'   },
  { id: 'tapas-rosca',         name: 'Tapas a Rosca',                category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-rosca.jpg',             badge: 'stock'   },
  { id: 'tapas-rosca-24-410',  name: 'Tapa Rosca 24/410',           category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-rosca-24-410.jpg',      badge: 'stock'   },
  { id: 'bombas-vaporizadoras', name: 'Bombas Vaporizadoras',        category: 'dispensers',   categoryLabel: 'Dispensers',      image: '/images/products/dispensers-bombas.jpg',       badge: 'stock'   },
  { id: 'medidor-medicinal',   name: 'Medidor tipo Medicinal',       category: 'dosificacion', categoryLabel: 'Dosificación',    image: '/images/products/dosificacion-medidor.jpg',    badge: 'consult' },
  { id: 'envases-plasticos',   name: 'Envases Plásticos',           category: 'envases',      categoryLabel: 'Envases',         image: '/images/products/envases-plasticos.jpg',       badge: 'stock'   },
  { id: 'frascos-10-20ml',     name: 'Frascos Completos 10–20ml',   category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-10-20ml.jpg',         badge: 'stock'   },
  { id: 'frascos-30ml',        name: 'Frascos Completos 30ml',      category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-30ml.jpg',            badge: 'stock'   },
  { id: 'frascos-50-60ml',     name: 'Frascos Completos 50–60ml',   category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-50-60ml.jpg',         badge: 'stock'   },
  { id: 'frascos-100ml',       name: 'Frascos Completos 100ml',     category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-100ml.jpg',           badge: 'stock'   },
  { id: 'varillas-rattan',     name: 'Varillas de Rattan',          category: 'accesorios',   categoryLabel: 'Accesorios',      image: '/images/products/accesorios-rattan.jpg',       badge: 'consult' },
  { id: 'elementos-engrimpar', name: 'Elementos para Engrimpar',    category: 'accesorios',   categoryLabel: 'Accesorios',      image: '/images/products/accesorios-engrimpar.png',    badge: 'consult' },
]
