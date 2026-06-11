'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegistroPage() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', password: '', confirmar: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { nombre: form.nombre.trim(), empresa: form.empresa.trim() },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : 'Ocurrió un error al registrarte. Intentá de nuevo.')
      setLoading(false)
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 8 }}>
            Revisá tu email
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            Te enviamos un enlace de confirmación a <strong>{form.email}</strong>.
            Hacé clic en el enlace para activar tu cuenta.
          </p>
          <p style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 16 }}>
            ¿Ya confirmaste?{' '}
            <Link href="/auth/login" style={{ color: 'var(--orange-600)', fontWeight: 500 }}>
              Ingresá acá
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--fg-1)' }}>
        Creá tu cuenta
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 28 }}>
        ¿Ya tenés cuenta?{' '}
        <Link href="/auth/login" style={{ color: 'var(--orange-600)', fontWeight: 500 }}>
          Ingresá
        </Link>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input type="text" value={form.nombre} onChange={set('nombre')} required style={inputStyle} placeholder="Juan" />
          </div>
          <div>
            <label style={labelStyle}>Empresa</label>
            <input type="text" value={form.empresa} onChange={set('empresa')} style={inputStyle} placeholder="Tu empresa" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email *</label>
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" style={inputStyle} placeholder="tu@email.com" />
        </div>

        <div>
          <label style={labelStyle}>Contraseña *</label>
          <input type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" style={inputStyle} placeholder="Mínimo 8 caracteres" />
        </div>

        <div>
          <label style={labelStyle}>Confirmá la contraseña *</label>
          <input type="password" value={form.confirmar} onChange={set('confirmar')} required autoComplete="new-password" style={inputStyle} />
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

        <button type="submit" disabled={loading} style={buttonStyle(loading)}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', lineHeight: 1.5 }}>
          Al registrarte aceptás que AFIN srl procese tus datos para gestionar tus pedidos.
        </p>
      </form>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  padding: '36px 32px',
  boxShadow: 'var(--shadow-md)',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500,
  color: 'var(--fg-2)', marginBottom: 6,
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
