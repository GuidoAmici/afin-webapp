'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { createClient } from '@/lib/supabase/client'

type Step = 'carrito' | 'perfil' | 'confirmado'
type TipoFacturacion = 'personal' | 'empresa'

interface Profile {
  nombre: string
  empresa: string | null
  telefono: string | null
  direccion: string | null
  localidad: string | null
  codigo_postal: string | null
  cuit: string | null
  dni: string | null
  tipo_facturacion: TipoFacturacion | null
}

function formatCuit(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

export default function CheckoutPage() {
  const { items, count, setQty, remove, clear } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<Step>('carrito')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileForm, setProfileForm] = useState({
    tipo: 'personal' as TipoFacturacion,
    telefono: '',
    direccion: '',
    localidad: '',
    codigo_postal: '',
    nombre_empresa: '',
    cuit: '',
    dni: '',
  })
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')
  const [wasUpdated, setWasUpdated] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles')
        .select('nombre,empresa,telefono,direccion,localidad,codigo_postal,cuit,dni,tipo_facturacion')
        .eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setProfile(data)
            setProfileForm({
              tipo: (data.tipo_facturacion ?? 'personal') as TipoFacturacion,
              telefono: data.telefono ?? '',
              direccion: data.direccion ?? '',
              localidad: data.localidad ?? '',
              codigo_postal: data.codigo_postal ?? '',
              nombre_empresa: data.empresa ?? '',
              cuit: data.cuit ?? '',
              dni: data.dni ?? '',
            })
          }
        })
    })
  }, [])

  const tipo = profileForm.tipo
  const profileTipo = (profile?.tipo_facturacion ?? 'personal') as TipoFacturacion
  const profileComplete = !!(
    profile?.telefono && profile?.direccion && profile?.localidad &&
    (profileTipo === 'empresa' ? (profile.empresa && profile.cuit) : profile.dni)
  )

  async function handleCheckout() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login?redirect=/checkout'); return }
    if (!profileComplete) { setStep('perfil'); return }
    await submitOrder()
  }

  async function saveProfileAndOrder() {
    if (!profileForm.telefono || !profileForm.direccion || !profileForm.localidad) {
      setError('Teléfono, dirección y localidad son obligatorios.')
      return
    }
    if (tipo === 'empresa' && (!profileForm.nombre_empresa || !profileForm.cuit)) {
      setError('Nombre de empresa y CUIT son obligatorios.')
      return
    }
    if (tipo === 'personal' && !profileForm.dni) {
      setError('El DNI es obligatorio.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login?redirect=/checkout'); return }

    await supabase.from('profiles').update({
      tipo_facturacion: tipo,
      telefono: profileForm.telefono,
      direccion: profileForm.direccion,
      localidad: profileForm.localidad,
      codigo_postal: profileForm.codigo_postal || null,
      empresa: tipo === 'empresa' ? profileForm.nombre_empresa : null,
      cuit: tipo === 'empresa' ? profileForm.cuit : null,
      dni: tipo === 'personal' ? profileForm.dni : null,
    }).eq('id', user.id)

    setProfile(prev => prev ? {
      ...prev,
      tipo_facturacion: tipo,
      telefono: profileForm.telefono,
      direccion: profileForm.direccion,
      localidad: profileForm.localidad,
      codigo_postal: profileForm.codigo_postal || null,
      empresa: tipo === 'empresa' ? profileForm.nombre_empresa : null,
      cuit: tipo === 'empresa' ? profileForm.cuit : null,
      dni: tipo === 'personal' ? profileForm.dni : null,
    } : null)
    await submitOrder()
  }

  async function submitOrder() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, notes }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error === 'perfil_incompleto' ? 'Completá tus datos de contacto.' : (data.error ?? 'Error al enviar el pedido.'))
      setLoading(false)
      return
    }
    setOrderId(data.orderId)
    setWasUpdated(!!data.wasUpdated)
    clear()
    setStep('confirmado')
    setLoading(false)
  }

  if (step === 'confirmado') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 8 }}>
              {wasUpdated ? '¡Pedido actualizado!' : '¡Pedido enviado!'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 24 }}>
              {wasUpdated
                ? 'Tu pedido pendiente fue actualizado con los nuevos productos.'
                : 'Andrés va a contactarte a la brevedad para confirmar disponibilidad, precio y método de envío.'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 32 }}>
              Número de pedido: <strong>{orderId.slice(0, 8).toUpperCase()}</strong>
            </p>
            <Link href="/productos" className="btn-primary">Seguir explorando</Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'perfil') {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, maxWidth: 480 }}>
          <h1 style={h1Style}>Completá tus datos</h1>
          <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24 }}>
            Necesitamos estos datos para coordinar el envío.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field
              label="Teléfono / WhatsApp *"
              value={profileForm.telefono}
              onChange={v => setProfileForm(p => ({ ...p, telefono: v }))}
              placeholder="+54 9 11 1234-5678"
              inputMode="tel"
            />
            <Field
              label="Dirección *"
              value={profileForm.direccion}
              onChange={v => setProfileForm(p => ({ ...p, direccion: v }))}
              placeholder="Calle 123, Piso 4"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                label="Localidad *"
                value={profileForm.localidad}
                onChange={v => setProfileForm(p => ({ ...p, localidad: v }))}
                placeholder="CABA"
              />
              <Field
                label="Código postal"
                value={profileForm.codigo_postal}
                onChange={v => setProfileForm(p => ({ ...p, codigo_postal: v }))}
                placeholder="1414"
                inputMode="numeric"
              />
            </div>

            <div>
              <label style={labelStyle}>Tipo de datos de facturación</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['personal', 'empresa'] as TipoFacturacion[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setProfileForm(p => ({ ...p, tipo: t }))}
                    style={{
                      flex: 1,
                      padding: '9px 0',
                      fontSize: 14,
                      fontWeight: 500,
                      border: `1px solid ${tipo === t ? 'var(--orange-600)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: tipo === t ? 'color-mix(in srgb, var(--orange-600) 10%, transparent)' : 'var(--bg-surface)',
                      color: tipo === t ? 'var(--orange-600)' : 'var(--fg-2)',
                      cursor: 'pointer',
                    }}
                  >
                    {t === 'personal' ? 'Personal' : 'Empresa'}
                  </button>
                ))}
              </div>
            </div>

            {tipo === 'personal' && (
              <Field
                label="DNI *"
                value={profileForm.dni}
                onChange={v => setProfileForm(p => ({ ...p, dni: v.replace(/\D/g, '').slice(0, 8) }))}
                placeholder="12345678"
                inputMode="numeric"
              />
            )}

            {tipo === 'empresa' && (
              <>
                <Field
                  label="Nombre de empresa *"
                  value={profileForm.nombre_empresa}
                  onChange={v => setProfileForm(p => ({ ...p, nombre_empresa: v }))}
                  placeholder="AFIN SRL"
                />
                <Field
                  label="CUIT *"
                  value={profileForm.cuit}
                  onChange={v => setProfileForm(p => ({ ...p, cuit: formatCuit(v) }))}
                  placeholder="20-12345678-9"
                  inputMode="numeric"
                />
              </>
            )}
          </div>

          {error && <p style={errorStyle}>{error}</p>}
          <button style={btnStyle(loading)} disabled={loading} onClick={saveProfileAndOrder}>
            {loading ? 'Enviando...' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={{ ...cardStyle, maxWidth: 600 }}>
        <h1 style={h1Style}>Tu pedido</h1>

        {count === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24 }}>El carrito está vacío.</p>
            <Link href="/productos" className="btn-primary">Ver productos</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {items.map(item => (
                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <Image src={item.image} alt={item.productName} width={56} height={48} style={{ objectFit: 'contain', borderRadius: 4, background: 'white' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-1)', marginBottom: 2 }}>{item.productName}</p>
                    {item.unitPrice && <p style={{ fontSize: 12, color: 'var(--fg-3)' }}>{item.unitPrice}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => setQty(item.productId, item.quantity - 1)} style={qtyBtn}>−</button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => {
                        const n = parseInt(e.target.value, 10)
                        if (!isNaN(n) && n > 0) setQty(item.productId, n)
                      }}
                      onBlur={e => {
                        const n = parseInt(e.target.value, 10)
                        if (isNaN(n) || n < 1) setQty(item.productId, 1)
                      }}
                      style={{ width: 48, textAlign: 'center', fontSize: 14, fontWeight: 600, padding: '4px 2px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--fg-1)', outline: 'none' }}
                    />
                    <button onClick={() => setQty(item.productId, item.quantity + 1)} style={qtyBtn}>+</button>
                    <button onClick={() => remove(item.productId)} style={{ ...qtyBtn, color: 'var(--error-500)', marginLeft: 4 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Notas para el pedido (opcional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Ej: necesito entrega urgente, consulta por descuento por volumen..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <button style={btnStyle(loading)} disabled={loading} onClick={handleCheckout}>
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', marginTop: 12 }}>
              Andrés te contactará para acordar precio, envío y forma de pago.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        style={inputStyle}
      />
    </div>
  )
}

const pageStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'var(--bg-surface)', padding: '48px 16px' }
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: 560, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: 'var(--shadow-md)' }
const h1Style: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 24 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--fg-1)', outline: 'none', boxSizing: 'border-box' }
const btnStyle = (disabled: boolean): React.CSSProperties => ({ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, background: disabled ? 'var(--neutral-300)' : 'var(--orange-600)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 8 })
const errorStyle: React.CSSProperties = { fontSize: 13, color: 'var(--error-700)', background: 'var(--error-100)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 12 }
const qtyBtn: React.CSSProperties = { width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }
