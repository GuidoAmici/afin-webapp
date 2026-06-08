import type { Metadata } from 'next'
import ProductFilter from '@/components/ProductFilter'
import { getProducts, getCategories } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Catálogo completo de tapas, cierres, frascos, envases y accesorios plásticos de Afin SRL.',
}

export default async function ProductosPage() {
  const products = await getProducts()
  const categories = await getCategories(products)

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
        <ProductFilter categories={categories} products={products} />
      </section>
    </main>
  )
}
