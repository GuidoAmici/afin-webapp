import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProductFilter from '@/components/ProductFilter'
import { getCatalog } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Catálogo completo de tapas, cierres, frascos, envases y accesorios plásticos de AFIN srl.',
}

// Catálogo cacheado con ISR: se regenera como mucho cada 5 minutos.
export const revalidate = 300

export default async function ProductosPage() {
  const { products, categories } = await getCatalog()

  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Catálogo</p>
          <h1>Nuestros Productos</h1>
          <p>{products.length} productos para la industria cosmética, farmacéutica y de perfumería.</p>
        </div>
      </section>

      <section className="products-page">
        <Suspense>
          <ProductFilter categories={categories} products={products} />
        </Suspense>
      </section>
    </main>
  )
}
