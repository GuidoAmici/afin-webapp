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

export const CATEGORIES: Category[] = [
  {
    id: 'tapas',
    label: 'Tapas · Cierres',
    count: 0,
    subcategories: [
      { id: 'engrimpe-15', parentId: 'tapas', label: 'Engrimpe 15 mm', count: 0 },
      { id: 'engrimpe-20', parentId: 'tapas', label: 'Engrimpe 20 mm', count: 0 },
      { id: 'rosca-28',    parentId: 'tapas', label: 'Rosca 28',       count: 0 },
      { id: 'rosca-24',    parentId: 'tapas', label: 'Rosca 24/410',   count: 0 },
    ],
  },
  {
    id: 'dosificadores',
    label: 'Dosificadores',
    count: 0,
    subcategories: [
      { id: 'bomba-15', parentId: 'dosificadores', label: 'Bomba 15 mm', count: 0 },
      { id: 'bomba-20', parentId: 'dosificadores', label: 'Bomba 20 mm / Spray', count: 0 },
    ],
  },
  {
    id: 'frascos',
    label: 'Frascos completos',
    count: 0,
    subcategories: [
      { id: 'frascos-10-20', parentId: 'frascos', label: '10 – 20 ml', count: 0 },
      { id: 'frascos-30',    parentId: 'frascos', label: '30 ml',      count: 0 },
      { id: 'frascos-50-60', parentId: 'frascos', label: '50 – 60 ml', count: 0 },
      { id: 'frascos-100',   parentId: 'frascos', label: '100 ml+',    count: 0 },
    ],
  },
  {
    id: 'envases',
    label: 'Envases',
    count: 0,
    subcategories: [
      { id: 'vidrio',    parentId: 'envases', label: 'De vidrio',    count: 0 },
      { id: 'plastico',  parentId: 'envases', label: 'De plástico',  count: 0 },
    ],
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    count: 0,
    subcategories: [
      { id: 'medicion',  parentId: 'accesorios', label: 'Medición',           count: 0 },
      { id: 'rattan',    parentId: 'accesorios', label: 'Varillas de rattan', count: 0 },
      { id: 'engrimpar', parentId: 'accesorios', label: 'Para engrimpar',     count: 0 },
    ],
  },
]

const p = (image: string) => `/images/products/${image}`

export const PRODUCTS: Product[] = [
  // ── TAPAS · ENGRIMPE 15 mm ────────────────────────────────────────────────
  {
    id: 'tapa-tubo',
    name: 'Tapa Tubo',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-tubo.jpg'),
    images: [p('tuboplateada.png'), p('tapa-tubo.jpg')],
    badge: 'stock',
    description: 'Tapa tubo para válvula de engrimpe 15 mm. Disponible en varios colores.',
  },
  {
    id: 'tapa-prisma',
    name: 'Tapa Prisma',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('prisma-50-varios.jpg'),
    badge: 'stock',
    description: 'Tapa Prisma para engrimpe 15 mm. Disponible en varios colores.',
  },
  {
    id: 'tapa-vantax-15',
    name: 'Tapa Vantax',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-vantax.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-mirita',
    name: 'Tapa Mirita',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-mirita-rojo.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-bolita',
    name: 'Tapa Bolita',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-bolita-cubre-bombba.jpg'),
    badge: 'stock',
    description: 'Tapa bolita cubre bomba para engrimpe 15 mm.',
  },
  {
    id: 'tapa-flor',
    name: 'Tapa Flor',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-flor.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-hoja',
    name: 'Tapa Hoja',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-hoja.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-margarita-15',
    name: 'Tapa Margarita',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-margarita-15.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-napoleon',
    name: 'Tapa Napoleón',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-napoleon.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-rusia',
    name: 'Tapa Rusia',
    category: 'tapas', subcategory: 'engrimpe-15',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 15 mm',
    image: p('tapa-rusia.jpg'),
    badge: 'stock',
  },

  // ── TAPAS · ENGRIMPE 20 mm ────────────────────────────────────────────────
  {
    id: 'tapa-formosa',
    name: 'Tapa Formosa',
    category: 'tapas', subcategory: 'engrimpe-20',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 20 mm',
    image: p('Tapa-Formosa.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-gaspy',
    name: 'Tapa Gaspy',
    category: 'tapas', subcategory: 'engrimpe-20',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 20 mm',
    image: p('tapa-gaspy.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-luli',
    name: 'Tapa Luli',
    category: 'tapas', subcategory: 'engrimpe-20',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 20 mm',
    image: p('tapa-luli.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-denise-50',
    name: 'Tapa Denise 50',
    category: 'tapas', subcategory: 'engrimpe-20',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 20 mm',
    image: p('tapa-denise-50.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-denise-30',
    name: 'Tapa Denise 30',
    category: 'tapas', subcategory: 'engrimpe-20',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 20 mm',
    image: p('tapa-denise-30.jpg'),
    badge: 'stock',
  },
  {
    id: 'tapa-argenta',
    name: 'Tapa Argenta 100',
    category: 'tapas', subcategory: 'engrimpe-20',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Engrimpe 20 mm',
    image: p('tapa-Argenta-100.jpg'),
    badge: 'stock',
  },

  // ── TAPAS · ROSCA 28 ──────────────────────────────────────────────────────
  {
    id: 'tapa-precinto',
    name: 'Tapa Precinto Blanca',
    category: 'tapas', subcategory: 'rosca-28',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Rosca 28',
    image: p('tapa-precinto-blanca.jpg'),
    badge: 'stock',
  },

  // ── TAPAS · ROSCA 24/410 ──────────────────────────────────────────────────
  {
    id: 'tapa-difusor',
    name: 'Tapa Difusor',
    category: 'tapas', subcategory: 'rosca-24',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Rosca 24/410',
    image: p('tapa-difusor.jpg'),
    badge: 'stock',
    description: 'Tapa para difusor de varillas. Medida de rosca: 24/410.',
  },
  {
    id: 'tapa-difusor-ciega',
    name: 'Tapa Difusor Ciega',
    category: 'tapas', subcategory: 'rosca-24',
    categoryLabel: 'Tapas · Cierres', subcategoryLabel: 'Rosca 24/410',
    image: p('tapa-difusor-ciega.jpg'),
    badge: 'stock',
    description: 'Tapa ciega para difusor de varillas. Medida de rosca: 24/410.',
  },

  // ── DOSIFICADORES · BOMBA 15 mm ───────────────────────────────────────────
  {
    id: 'bomba-15-plata',
    name: 'Bomba 15 mm (Plateada)',
    category: 'dosificadores', subcategory: 'bomba-15',
    categoryLabel: 'Dosificadores', subcategoryLabel: 'Bomba 15 mm',
    image: p('Bomba-15-Plata-plata-.jpg'),
    images: [p('Bomba-15-Plata-plata-.jpg'), p('Bomba-15-oro-oro-.jpg')],
    badge: 'stock',
  },
  {
    id: 'bomba-15-oro',
    name: 'Bomba 15 mm (Oro)',
    category: 'dosificadores', subcategory: 'bomba-15',
    categoryLabel: 'Dosificadores', subcategoryLabel: 'Bomba 15 mm',
    image: p('Bomba-15-oro-oro-.jpg'),
    badge: 'stock',
  },

  // ── DOSIFICADORES · BOMBA 20 mm / SPRAY ───────────────────────────────────
  {
    id: 'bomba-20-plata',
    name: 'Bomba 20 mm (Plateada)',
    category: 'dosificadores', subcategory: 'bomba-20',
    categoryLabel: 'Dosificadores', subcategoryLabel: 'Bomba 20 mm / Spray',
    image: p('Bomba-20-plata-plata-.jpg'),
    badge: 'stock',
  },
  {
    id: 'bomba-spray-sin',
    name: 'Bomba Spray 24 s/tapa',
    category: 'dosificadores', subcategory: 'bomba-20',
    categoryLabel: 'Dosificadores', subcategoryLabel: 'Bomba 20 mm / Spray',
    image: p('bomba-spray-24-sin.jpg'),
    badge: 'stock',
  },
  {
    id: 'bomba-spray-con',
    name: 'Bomba Spray 24 c/tapa',
    category: 'dosificadores', subcategory: 'bomba-20',
    categoryLabel: 'Dosificadores', subcategoryLabel: 'Bomba 20 mm / Spray',
    image: p('bomba-spray-24-tapa.jpg'),
    badge: 'stock',
  },
  {
    id: 'mini-gatillo',
    name: 'Mini Gatillo 24',
    category: 'dosificadores', subcategory: 'bomba-20',
    categoryLabel: 'Dosificadores', subcategoryLabel: 'Bomba 20 mm / Spray',
    image: p('mini-gatillo-24.jpg'),
    badge: 'stock',
  },

  // ── FRASCOS · 10 – 20 ml ─────────────────────────────────────────────────
  {
    id: 'frasco-sampling',
    name: 'Sampling 12 ml',
    category: 'frascos', subcategory: 'frascos-10-20',
    categoryLabel: 'Frascos completos', subcategoryLabel: '10 – 20 ml',
    image: p('SAMPLIG-12ML-1.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-margarita-15',
    name: 'Frasco Margarita 15 ml',
    category: 'frascos', subcategory: 'frascos-10-20',
    categoryLabel: 'Frascos completos', subcategoryLabel: '10 – 20 ml',
    image: p('frasco-margarita-15.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-perfumero-20',
    name: 'Perfumero 20 ml',
    category: 'frascos', subcategory: 'frascos-10-20',
    categoryLabel: 'Frascos completos', subcategoryLabel: '10 – 20 ml',
    image: p('Perfumero-20ml-rosca-C.png'),
    badge: 'stock',
    description: 'Perfumero 20 ml. Rosca tipo C.',
  },
  {
    id: 'frasco-rollon',
    name: 'Roll-on',
    category: 'frascos', subcategory: 'frascos-10-20',
    categoryLabel: 'Frascos completos', subcategoryLabel: '10 – 20 ml',
    image: p('roll-on.jpg'),
    badge: 'stock',
  },

  // ── FRASCOS · 30 ml ───────────────────────────────────────────────────────
  {
    id: 'frasco-argenta-30',
    name: 'Argenta 30 ml',
    category: 'frascos', subcategory: 'frascos-30',
    categoryLabel: 'Frascos completos', subcategoryLabel: '30 ml',
    image: p('argenta-30.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-organic-30',
    name: 'Organic 30 ml',
    category: 'frascos', subcategory: 'frascos-30',
    categoryLabel: 'Frascos completos', subcategoryLabel: '30 ml',
    image: p('organic-30.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-violeta-30',
    name: 'Violeta 30 ml',
    category: 'frascos', subcategory: 'frascos-30',
    categoryLabel: 'Frascos completos', subcategoryLabel: '30 ml',
    image: p('Violeta-30ml-boca-20.jpg'),
    badge: 'stock',
    description: 'Frasco Violeta 30 ml, boca 20 mm.',
  },
  {
    id: 'frasco-vantax-30',
    name: 'Vantax 30 ml',
    category: 'frascos', subcategory: 'frascos-30',
    categoryLabel: 'Frascos completos', subcategoryLabel: '30 ml',
    image: p('vantax-30.jpg'),
    badge: 'stock',
  },

  // ── FRASCOS · 50 – 60 ml ─────────────────────────────────────────────────
  {
    id: 'frasco-aromas-50',
    name: 'Aromas 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('Aromas-50ml-boca-15-.jpg'),
    badge: 'stock',
    description: 'Frasco Aromas 50 ml, boca 15 mm.',
  },
  {
    id: 'frasco-clarisa-50',
    name: 'Clarisa 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('Clarisa-50ml-boca-15-1.jpg'),
    badge: 'stock',
    description: 'Frasco Clarisa 50 ml, boca 15 mm.',
  },
  {
    id: 'frasco-julieta-50',
    name: 'Julieta 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('Julieta-50ml-boca-15.jpg'),
    badge: 'stock',
    description: 'Frasco Julieta 50 ml, boca 15 mm.',
  },
  {
    id: 'frasco-violeta-50',
    name: 'Violeta 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('Violeta-50ml-boca-20-1.jpg'),
    badge: 'stock',
    description: 'Frasco Violeta 50 ml, boca 20 mm.',
  },
  {
    id: 'frasco-copa',
    name: 'Copa',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('copa.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-justin-50',
    name: 'Justin 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('justin-50.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-lady',
    name: 'Lady',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('lady.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-manzanita-50',
    name: 'Manzanita 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('manzanita-50.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-paris-50',
    name: 'Paris 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('paris-50.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-rio',
    name: 'Río',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('rio.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-vantax-50',
    name: 'Vantax 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('vantax-50.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-vial-50',
    name: 'Vial 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('vial-50-2.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-wada-50',
    name: 'Pote Wada 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('POTE-WADA-50ML.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-ecuatone-60',
    name: 'Ecuatone 60 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('Ecuatone-60ml-rosca-18-.jpg'),
    badge: 'stock',
    description: 'Frasco Ecuatone 60 ml. Rosca 18 mm.',
  },

  // ── FRASCOS · 100 ml + ────────────────────────────────────────────────────
  {
    id: 'frasco-argenta-100',
    name: 'Argenta 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('argenta-100.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-diana-100',
    name: 'Diana 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('DIANA-100ML-boca-20-1.jpg'),
    badge: 'stock',
    description: 'Frasco Diana 100 ml, boca 20 mm.',
  },
  {
    id: 'frasco-imprisse-100',
    name: 'Imprisse 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('imprisse-100.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-just-100',
    name: 'Just 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('just-100.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-level-100',
    name: 'Level 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('LEVEL-100-A.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-transparente-100',
    name: 'Transparente 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('transparente.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-time-125',
    name: 'Time 125 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('Time-125.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-argenta-50',
    name: 'Argenta 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('argenta-50.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-paris-100',
    name: 'Paris 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('paris-100.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-aerosol-50',
    name: 'Aerosol 50 ml',
    category: 'frascos', subcategory: 'frascos-50-60',
    categoryLabel: 'Frascos completos', subcategoryLabel: '50 – 60 ml',
    image: p('aerosol-50.jpg'),
    badge: 'stock',
  },
  {
    id: 'frasco-aerosol-100',
    name: 'Aerosol 100 ml',
    category: 'frascos', subcategory: 'frascos-100',
    categoryLabel: 'Frascos completos', subcategoryLabel: '100 ml+',
    image: p('aerosol-100.jpg'),
    badge: 'stock',
  },

  // ── ENVASES · VIDRIO ──────────────────────────────────────────────────────
  {
    id: 'vidrio-clio',
    name: 'Clio (vidrio)',
    category: 'envases', subcategory: 'vidrio',
    categoryLabel: 'Envases', subcategoryLabel: 'De vidrio',
    image: p('clio.jpg'),
    badge: 'consult',
  },
  {
    id: 'vidrio-generico',
    name: 'Envase de vidrio',
    category: 'envases', subcategory: 'vidrio',
    categoryLabel: 'Envases', subcategoryLabel: 'De vidrio',
    image: p('vidrio.jpg'),
    badge: 'consult',
    description: 'Amplia variedad de envases de vidrio. Consultá por modelos disponibles.',
  },

  // ── ACCESORIOS ────────────────────────────────────────────────────────────
  {
    id: 'medidor',
    name: 'Medidor / Vaso',
    category: 'accesorios', subcategory: 'medicion',
    categoryLabel: 'Accesorios', subcategoryLabel: 'Medición',
    image: p('vaso-medidor-remedio.jpg'),
    badge: 'consult',
    description: 'Vaso medidor tipo medicinal.',
  },
  {
    id: 'varillas-rattan',
    name: 'Varillas de Rattan',
    category: 'accesorios', subcategory: 'rattan',
    categoryLabel: 'Accesorios', subcategoryLabel: 'Varillas de rattan',
    image: p('accesorios-rattan.jpg'),
    badge: 'consult',
    description: 'Varillas de rattan para difusores de aromas.',
  },
  {
    id: 'elementos-engrimpar',
    name: 'Elementos para Engrimpar',
    category: 'accesorios', subcategory: 'engrimpar',
    categoryLabel: 'Accesorios', subcategoryLabel: 'Para engrimpar',
    image: p('accesorios-engrimpar.png'),
    badge: 'consult',
    description: 'Herramientas y accesorios para el proceso de engrimpe.',
  },
]

// Compute counts from PRODUCTS
for (const cat of CATEGORIES) {
  const catProducts = PRODUCTS.filter(p => p.category === cat.id)
  cat.count = catProducts.length
  for (const sub of cat.subcategories) {
    sub.count = PRODUCTS.filter(p => p.subcategory === sub.id).length
  }
}

export const TOTAL_PRODUCTS = PRODUCTS.length

export const ALL_SUBCATEGORIES: Subcategory[] = CATEGORIES.flatMap(c => c.subcategories)
