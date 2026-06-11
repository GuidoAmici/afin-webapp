'use client'

import { useState } from 'react'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const result = await subscribeToNewsletter(email)
    setStatus(result.success ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <p className="newsletter-success" role="status">
        ¡Suscripto! Vas a recibir novedades de AFIN srl.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="newsletter-form" noValidate>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        disabled={status === 'loading'}
        className="newsletter-input"
        aria-label="Tu correo electrónico"
      />
      <button type="submit" disabled={status === 'loading'} className="btn-primary">
        {status === 'loading' ? 'Suscribiendo…' : 'Suscribirme'}
      </button>
      {status === 'error' && (
        <p className="newsletter-error" role="alert">
          Algo salió mal. Intentá de nuevo.
        </p>
      )}
    </form>
  )
}
