export type BadgeVariant = 'stock' | 'consult' | 'new'

export interface Product {
  id: string
  name: string
  category: string
  categoryLabel: string
  image: string
  images?: string[]
  badge: BadgeVariant
  priceRetail?: string
  priceWholesale?: string
  description?: string
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
  { id: 'tapas-valvulas-15mm', name: 'Tapas Válvulas Engrimpe 15mm', category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-valvulas-15mm.jpg',     badge: 'stock',   priceRetail: '$950',   priceWholesale: '$720',   description: 'Tapa válvula de engrimpe 15mm. Ideal para frascos cosméticos y de perfumería de cuello estrecho.' },
  { id: 'tapas-valvulas-20mm', name: 'Tapas Válvulas Engrimpe 20mm', category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-valvulas-20mm.jpg',     badge: 'stock',   priceRetail: '$1.050', priceWholesale: '$800',   description: 'Tapa válvula de engrimpe 20mm. Compatible con envases de mayor diámetro.' },
  { id: 'tapas-rosca',         name: 'Tapas a Rosca',                category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-rosca.jpg',             badge: 'stock',   priceRetail: '$850',   priceWholesale: '$640'   },
  { id: 'tapas-rosca-24-410',  name: 'Tapa Rosca 24/410',           category: 'tapas',        categoryLabel: 'Tapas · Cierres', image: '/images/products/tapas-rosca-24-410.jpg',      badge: 'stock',   priceRetail: '$920',   priceWholesale: '$700'   },
  { id: 'bombas-vaporizadoras', name: 'Bombas Vaporizadoras',        category: 'dispensers',   categoryLabel: 'Dispensers',      image: '/images/products/dispensers-bombas.jpg',       badge: 'stock',   priceRetail: '$2.400', priceWholesale: '$1.800' },
  { id: 'medidor-medicinal',   name: 'Medidor tipo Medicinal',       category: 'dosificacion', categoryLabel: 'Dosificación',    image: '/images/products/dosificacion-medidor.jpg',    badge: 'consult' },
  { id: 'envases-plasticos',   name: 'Envases Plásticos',           category: 'envases',      categoryLabel: 'Envases',         image: '/images/products/envases-plasticos.jpg',       badge: 'stock',   priceRetail: '$1.800', priceWholesale: '$1.350' },
  { id: 'frascos-10-20ml',     name: 'Frascos Completos 10–20ml',   category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-10-20ml.jpg',         badge: 'stock',   priceRetail: '$2.100', priceWholesale: '$1.600' },
  { id: 'frascos-30ml',        name: 'Frascos Completos 30ml',      category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-30ml.jpg',            badge: 'stock',   priceRetail: '$2.600', priceWholesale: '$2.000' },
  { id: 'frascos-50-60ml',     name: 'Frascos Completos 50–60ml',   category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-50-60ml.jpg',         badge: 'stock',   priceRetail: '$3.200', priceWholesale: '$2.500' },
  { id: 'frascos-100ml',       name: 'Frascos Completos 100ml',     category: 'frascos',      categoryLabel: 'Frascos',         image: '/images/products/frascos-100ml.jpg',           badge: 'stock',   priceRetail: '$4.100', priceWholesale: '$3.200' },
  { id: 'varillas-rattan',     name: 'Varillas de Rattan',          category: 'accesorios',   categoryLabel: 'Accesorios',      image: '/images/products/accesorios-rattan.jpg',       badge: 'consult' },
  { id: 'elementos-engrimpar', name: 'Elementos para Engrimpar',    category: 'accesorios',   categoryLabel: 'Accesorios',      image: '/images/products/accesorios-engrimpar.png',    badge: 'consult' },
]
