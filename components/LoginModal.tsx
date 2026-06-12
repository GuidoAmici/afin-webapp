'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useModalBehavior } from '@/lib/useModalBehavior'
import { FieldInput, ErrorMsg, SubmitBtn } from './ui/form'

type Vista = 'login' | 'registro' | 'confirmacion'

interface Props {
  onClose: () => void
  onSuccess: () => void
  vistaInicial?: Vista
}

export default function LoginModal({ onClose, onSuccess, vistaInicial = 'login' }: Props) {
  const [vista, setVista] = useState<Vista>(vistaInicial)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useModalBehavior(cardRef, onClose, { initialFocus: firstInputRef })

  // Re-enfocar cuando cambia la vista
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }, [vista])

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Cuenta"
    >
      <div ref={cardRef} className="modal-card modal-card--sm">
        <button onClick={onClose} aria-label="Cerrar" className="modal-close-x">✕</button>

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
      <h2 className="modal-title" style={{ marginBottom: 6 }}>Iniciar sesión</h2>
      <p style={subtitleStyle}>Ingresá para ver tu cuenta y hacer pedidos.</p>
      <form onSubmit={handleSubmit} style={formStyle}>
        <FieldInput inputRef={inputRef} label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" autoComplete="email" />
        <FieldInput label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <SubmitBtn loading={loading}>Ingresar</SubmitBtn>
      </form>
      <p style={footerStyle}>
        ¿No tenés cuenta?{' '}
        <button type="button" className="btn-text" onClick={onRegistro}>Registrate</button>
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
      <h2 className="modal-title" style={{ marginBottom: 6 }}>Crear cuenta</h2>
      <p style={subtitleStyle}>Completá tus datos para registrarte.</p>
      <form onSubmit={handleSubmit} style={formStyle}>
        <FieldInput inputRef={inputRef} label="Nombre *" value={nombre} onChange={setNombre} placeholder="Tu nombre" autoComplete="name" required />
        <FieldInput label="Empresa (opcional)" value={empresa} onChange={setEmpresa} placeholder="Nombre de tu empresa" autoComplete="organization" />
        <FieldInput label="Email *" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" autoComplete="email" required />
        <FieldInput label="Contraseña *" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" autoComplete="new-password" required />
        <FieldInput label="Confirmar contraseña *" type="password" value={confirm} onChange={setConfirm} placeholder="Repetí la contraseña" autoComplete="new-password" required />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <SubmitBtn loading={loading}>Registrarse</SubmitBtn>
      </form>
      <p style={footerStyle}>
        ¿Ya tenés cuenta?{' '}
        <button type="button" className="btn-text" onClick={onLogin}>Iniciá sesión</button>
      </p>
    </>
  )
}

// ─── Vista Confirmación ───────────────────────────────────────────────────────

function ConfirmacionVista({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>📧</div>
      <h2 className="modal-title" style={{ marginBottom: 8 }}>Revisá tu email</h2>
      <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 28 }}>
        Te enviamos un enlace de confirmación. Hacé click en él para activar tu cuenta.
      </p>
      <button onClick={onClose} className="btn-text" style={{ fontSize: 14 }}>
        Cerrar
      </button>
    </div>
  )
}

const subtitleStyle: React.CSSProperties = { fontSize: 14, color: 'var(--fg-3)', marginBottom: 24 }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14 }
const footerStyle: React.CSSProperties = { fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', marginTop: 20 }
