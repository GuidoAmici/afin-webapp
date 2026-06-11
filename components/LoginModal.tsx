'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Vista = 'login' | 'registro' | 'confirmacion'

interface Props {
  onClose: () => void
  onSuccess: () => void
  vistaInicial?: Vista
}

export default function LoginModal({ onClose, onSuccess, vistaInicial = 'login' }: Props) {
  const [vista, setVista] = useState<Vista>(vistaInicial)
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Re-enfocar cuando cambia la vista
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }, [vista])

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      role="dialog"
      aria-modal="true"
    >
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: 'var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.3))', position: 'relative' }}>
        <button onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--fg-3)' }}>✕</button>

        {vista === 'login' && (
          <LoginVista inputRef={firstInputRef} onSuccess={onSuccess} onRegistro={() => setVista('registro')} />
        )}
        {vista === 'registro' && (
          <RegistroVista inputRef={firstInputRef} onConfirmacion={() => setVista('confirmacion')} onLogin={() => setVista('login')} />
        )}
        {vista === 'confirmacion' && (
          <ConfirmacionVista onClose={onClose} />
        )}
      </div>
    </div>
  )
}

// ─── Vista Login ─────────────────────────────────────────────────────────────

function LoginVista({ inputRef, onSuccess, onRegistro }: {
  inputRef: React.RefObject<HTMLInputElement | null>
  onSuccess: () => void
  onRegistro: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await createClient().auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError('Email o contraseña incorrectos.'); return }
    onSuccess()
  }

  return (
    <>
      <h2 style={titleStyle}>Iniciar sesión</h2>
      <p style={subtitleStyle}>Ingresá para ver tu cuenta y hacer pedidos.</p>
      <form onSubmit={handleSubmit} style={formStyle}>
        <Field inputRef={inputRef} label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" autoComplete="email" />
        <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <SubmitBtn loading={loading}>Ingresar</SubmitBtn>
      </form>
      <p style={footerStyle}>
        ¿No tenés cuenta?{' '}
        <TextBtn onClick={onRegistro}>Registrate</TextBtn>
      </p>
    </>
  )
}

// ─── Vista Registro ───────────────────────────────────────────────────────────

function RegistroVista({ inputRef, onConfirmacion, onLogin }: {
  inputRef: React.RefObject<HTMLInputElement | null>
  onConfirmacion: () => void
  onLogin: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await createClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { nombre, empresa: empresa || undefined },
      },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    onConfirmacion()
  }

  return (
    <>
      <h2 style={titleStyle}>Crear cuenta</h2>
      <p style={subtitleStyle}>Completá tus datos para registrarte.</p>
      <form onSubmit={handleSubmit} style={formStyle}>
        <Field inputRef={inputRef} label="Nombre *" type="text" value={nombre} onChange={setNombre} placeholder="Tu nombre" autoComplete="name" required />
        <Field label="Empresa (opcional)" type="text" value={empresa} onChange={setEmpresa} placeholder="Nombre de tu empresa" autoComplete="organization" />
        <Field label="Email *" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" autoComplete="email" required />
        <Field label="Contraseña *" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" autoComplete="new-password" required />
        <Field label="Confirmar contraseña *" type="password" value={confirm} onChange={setConfirm} placeholder="Repetí la contraseña" autoComplete="new-password" required />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <SubmitBtn loading={loading}>Registrarse</SubmitBtn>
      </form>
      <p style={footerStyle}>
        ¿Ya tenés cuenta?{' '}
        <TextBtn onClick={onLogin}>Iniciá sesión</TextBtn>
      </p>
    </>
  )
}

// ─── Vista Confirmación ───────────────────────────────────────────────────────

function ConfirmacionVista({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>📧</div>
      <h2 style={{ ...titleStyle, marginBottom: 8 }}>Revisá tu email</h2>
      <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 28 }}>
        Te enviamos un enlace de confirmación. Hacé click en él para activar tu cuenta.
      </p>
      <button onClick={onClose} style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange-600)', background: 'none', border: 'none', cursor: 'pointer' }}>
        Cerrar
      </button>
    </div>
  )
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function Field({ inputRef, label, type, value, onChange, placeholder, autoComplete, required }: {
  inputRef?: React.RefObject<HTMLInputElement | null>
  label: string; type: string; value: string; onChange: (v: string) => void
  placeholder?: string; autoComplete?: string; required?: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          style={{ ...inputStyle, paddingRight: isPassword ? 40 : undefined }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 2, display: 'flex', alignItems: 'center' }}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
    </div>
  )
}

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: 4, fontSize: 14, fontWeight: 600, background: loading ? 'var(--neutral-300)' : 'var(--orange-600)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer' }}>
      {loading ? 'Cargando...' : children}
    </button>
  )
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: 'var(--error-700)', background: 'var(--error-100)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>{children}</p>
}

function TextBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'var(--orange-600)', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>{children}</button>
}

const titleStyle: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 6 }
const subtitleStyle: React.CSSProperties = { fontSize: 14, color: 'var(--fg-3)', marginBottom: 24 }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14 }
const footerStyle: React.CSSProperties = { fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', marginTop: 20 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--fg-1)', outline: 'none', boxSizing: 'border-box' }
