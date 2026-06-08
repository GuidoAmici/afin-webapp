import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/products'
import FeaturedProducts from '@/components/FeaturedProducts'

export const metadata: Metadata = {
  title: { absolute: 'AFIN srl — Fábrica de tapas y envases plásticos' },
}

const FEATURED_IDS = ['tapa-tubo', 'bomba-15-plata', 'frasco-violeta-50', 'frasco-argenta-30']

const CLIENTS = [
  { initial: 'L', name: 'Lidherma',            desc: 'Cosmética & Dermatología' },
  { initial: 'T', name: 'Top Crop',             desc: 'Agroquímicos' },
  { initial: 'M', name: 'Myselec SRL',          desc: 'Industria eléctrica' },
  { initial: 'M', name: 'Monique Cosméticos',   desc: 'Perfumería & Cosméticos' },
  { initial: 'G', name: 'Gigot',                desc: 'Indumentaria & Lifestyle' },
  { initial: 'A', name: 'Autopartes Paulucci',  desc: 'Autopartes & Repuestos' },
]

const WHY_US = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange-700)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    title: 'Calidad garantizada',
    desc: 'Materiales de primera calidad. Cada producto pasa por control de calidad estricto.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange-700)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    title: 'Entrega puntual',
    desc: 'Cumplimos con los plazos acordados. Trabajamos con stocks disponibles.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange-700)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    title: 'Atención personalizada',
    desc: 'Asesoramiento directo. Te ayudamos a elegir el producto correcto para tu necesidad.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange-700)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    title: 'Fabricación nacional',
    desc: 'Producción 100% argentina. Apoyamos la industria local.',
  },
]

export default async function HomePage() {
  const products = await getProducts()
  const featured = products.filter(p => FEATURED_IDS.includes(p.id))

  return (
    <main id="main-content">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">Fabricación Argentina</div>
            <h1>Tapas y Envases<br /><span>Plásticos</span></h1>
            <p>Fabricamos tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería. Calidad nacional, atención personalizada.</p>
            <div className="hero-cta">
              <Link href="/productos" className="btn-hero-primary">
                Ver productos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
              <Link href="/contacto" className="btn-hero-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Consultar
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-product-frame">
              <Image
                src="/images/hero-productos.jpg"
                alt="Frascos y tapas plásticas fabricados por AFIN srl"
                width={600}
                height={280}
                className="hero-product-img"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-products">
        <div className="container">
          <div className="featured-header">
            <div>
              <p className="section-label">Nuestros Productos</p>
              <h2>Catálogo completo</h2>
            </div>
            <Link href="/productos" className="btn-primary">
              Ver todos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
          <FeaturedProducts products={featured} />
        </div>
      </section>

      {/* CLIENTS MARQUEE */}
      <section className="clients-section" aria-label="Empresas que confían en AFIN srl">
        <div className="clients-header">
          <p className="section-label">Confían en nosotros</p>
          <h2>Empresas que eligen AFIN srl</h2>
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-fade-left" aria-hidden="true" />
          <div className="marquee-fade-right" aria-hidden="true" />
          <div className="marquee-track" aria-hidden="true">
            {[...CLIENTS, ...CLIENTS].map((client, i) => (
              <div key={i} className="client-card">
                <div className="client-card-logo">{client.initial}</div>
                <div>
                  <p className="client-card-name">{client.name}</p>
                  <p className="client-card-desc">{client.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why-us">
        <div className="container">
          <h2>¿Por qué elegir AFIN srl?</h2>
          <div className="why-grid">
            {WHY_US.map(({ icon, title, desc }) => (
              <div key={title} className="why-card">
                <div className="why-card-icon" aria-hidden="true">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT TEASER */}
      <section className="contact-section">
        <div className="contact-inner">
          <p className="section-label">Contacto</p>
          <h2>Consultanos</h2>
          <p>Completá el formulario y te respondemos a la brevedad. También podés escribirnos por WhatsApp.</p>
          <div style={{ marginTop: 32 }}>
            <Link href="/contacto" className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              Ir al formulario →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
