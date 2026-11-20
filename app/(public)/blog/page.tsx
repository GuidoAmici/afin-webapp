import type { Metadata } from 'next'
import NewsletterForm from '@/components/NewsletterForm'
import { newsletterFlag } from '@/flags'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Novedades e información del sector de envases y tapas plásticas. Blog de AFIN srl.',
}

export default async function BlogPage() {
  const newsletter = await newsletterFlag()
  return (
    <main id="main-content">
      <section className="blog-section">
        <div className="blog-empty">
          <h2>Blog</h2>
          <p>Próximamente — novedades e información del sector de envases y tapas plásticas.</p>
        </div>
      </section>

      {newsletter && (
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <p className="section-label">Novedades</p>
          <h2>Suscribite al newsletter</h2>
          <p>Recibí las primeras entradas del blog, novedades de productos y promociones de AFIN srl.</p>
          <NewsletterForm />
        </div>
      </section>
      )}
    </main>
  )
}
