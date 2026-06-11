import type { Metadata } from 'next'
import NewsletterForm from '@/components/NewsletterForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Datos de contacto de AFIN srl. Fábrica de tapas y envases plásticos en Martínez, Buenos Aires.',
}

export default function ContactoPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Ponete en contacto</p>
          <h1>Contacto</h1>
          <p>Para consultas rápidas escribinos por WhatsApp. También podés enviarnos un email o visitarnos.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-details-inner">
          <div className="contact-details-grid">
            <div>
              <h2>Datos de la empresa</h2>
              <ul className="contact-info-list">
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  <a href="tel:+5491122521639">+54 9 11 2252-1639</a>
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  <a href="https://wa.me/5491122521639" target="_blank" rel="noopener noreferrer">
                    WhatsApp — +54 9 11 2252-1639
                  </a>
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <a href="mailto:info@afinsrl.com.ar">info@afinsrl.com.ar</a>
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>Martínez, San Isidro, Buenos Aires, Argentina</span>
                </li>
              </ul>
            </div>

            <div className="contact-map-wrap">
              <iframe
                src="https://www.google.com/maps?q=Martínez,+San+Isidro,+Buenos+Aires,+Argentina&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de AFIN srl en Martínez, Buenos Aires"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-inner">
          <p className="section-label">Novedades</p>
          <h2>Suscribite al newsletter</h2>
          <p>Recibí actualizaciones sobre productos nuevos, promociones y artículos del blog.</p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  )
}
