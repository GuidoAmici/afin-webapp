'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(urlError === 'link_invalido' ? 'El enlace expiró o es inválido.' : '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 400,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '36px 32px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--fg-1)' }}>
        Ingresá a tu cuenta
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 28 }}>
        ¿No tenés cuenta?{' '}
        <Link href="/auth/registro" style={{ color: 'var(--orange-600)', fontWeight: 500 }}>
          Registrate
        </Link>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{
            fontSize: 13, color: 'var(--error-700)',
            background: 'var(--error-100)', borderRadius: 'var(--radius-md)',
            padding: '10px 12px', margin: 0,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle(loading)}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-surface)',
  color: 'var(--fg-1)',
  outline: 'none',
  boxSizing: 'border-box',
}

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '11px',
  fontSize: 14,
  fontWeight: 600,
  background: disabled ? 'var(--neutral-300)' : 'var(--orange-600)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background var(--dur-fast) var(--ease)',
})
