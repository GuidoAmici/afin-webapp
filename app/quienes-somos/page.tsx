import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiénes Somos',
  description: 'Afin SRL es una empresa argentina dedicada a la fabricación de tapas, cierres y envases plásticos con más de 20 años de experiencia.',
}

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

export default function QuienesSomosPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>La empresa</p>
          <h1>Quiénes Somos</h1>
          <p>Más de 20 años fabricando tapas y envases plásticos en Argentina.</p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-inner">
          <div className="about-content">
            <p className="section-label">Quiénes Somos</p>
            <h2>Fábrica de tapas y envases</h2>
            <p>Afin SRL es una empresa argentina dedicada a la fabricación de tapas, cierres y envases plásticos. Atendemos a la industria cosmética, farmacéutica y de perfumería con productos de calidad y plazos cumplidos.</p>
            <p>Nuestro equipo de trabajo, nuestra maquinaria actualizada y nuestra experiencia en el sector nos permiten ofrecer soluciones a medida para cada cliente.</p>
            <div className="about-stats">
              <div><div className="stat-number">20+</div><div className="stat-label">Años de experiencia</div></div>
              <div><div className="stat-number">100%</div><div className="stat-label">Fabricación argentina</div></div>
              <div><div className="stat-number">13+</div><div className="stat-label">Líneas de producto</div></div>
            </div>
          </div>
          <div className="about-visual" aria-hidden="true">
            <div style={{ textAlign: 'center', padding: 20 }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.3, marginBottom: 12 }}>
                <rect x="20" y="8" width="40" height="16" rx="6" fill="var(--orange-400)" />
                <rect x="12" y="24" width="56" height="48" rx="10" fill="var(--orange-400)" />
              </svg>
              <p style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic' }}>Imagen de la fábrica</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why-us">
        <div className="container">
          <h2>¿Por qué elegir Afin SRL?</h2>
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
    </main>
  )
}
