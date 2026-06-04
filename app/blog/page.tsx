import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Novedades e información del sector de envases y tapas plásticas. Blog de Afin SRL.',
}

export default function BlogPage() {
  return (
    <main id="main-content">
      <section className="blog-section">
        <div className="blog-empty">
          <h2>Blog</h2>
          <p>Próximamente — novedades e información del sector de envases y tapas plásticas.</p>
        </div>
      </section>
    </main>
  )
}
