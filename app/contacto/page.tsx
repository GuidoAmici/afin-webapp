import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá a Afin SRL para consultas, presupuestos y pedidos. Respondemos a la brevedad.',
}

export default function ContactoPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Ponete en contacto</p>
          <h1>Contacto</h1>
          <p>Respondemos consultas y pedidos de presupuesto en el próximo día hábil.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-inner">
          <p className="section-label">Consultanos</p>
          <h2>Envianos tu consulta</h2>
          <p>Completá el formulario y te respondemos a la brevedad. También podés escribirnos por WhatsApp.</p>
          <ContactForm />
        </div>
      </section>
    </main>
  )
}
