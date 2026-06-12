'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart, type CartItem } from '@/lib/cart'
import { createClient } from '@/lib/supabase/client'
import { formatCuit } from '@/lib/format'
import { useModalBehavior } from '@/lib/useModalBehavior'
import { FieldInput, ErrorMsg, ChoiceToggle } from './ui/form'
import LoginModal from './LoginModal'

type Vista = 'carrito' | 'perfil' | 'confirmado'
type TipoFacturacion = 'personal' | 'empresa'

type PendingOrderItem = {
  product_id: string
  quantity: number
  unit_price: string | null
  products: { name: string; image: string } | null
}
type PendingOrder = { id: string; notes: string | null; order_items: PendingOrderItem[] }

interface ProfileData {
  tipo_facturacion: TipoFacturacion | null
  telefono: string | null
  direccion: string | null
  localidad: string | null
  codigo_postal: string | null
  empresa: string | null
  cuit: string | null
  dni: string | null
}

interface ProfileForm {
  tipo: TipoFacturacion
  telefono: string
  direccion: string
  localidad: string
  codigo_postal: string
  nombre_empresa: string
  cuit: string
  dni: string
}

interface Props { onClose: () => void }

export default function CartModal({ onClose }: Props) {
  const { items, count, setQty, remove, clear } = useCart()
  const [vista, setVista] = useState<Vista>('carrito')
  const [loginOpen, setLoginOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')
  const [wasUpdated, setWasUpdated] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null | 'loading'>('loading')
  const [form, setForm] = useState<ProfileForm>({
    tipo: 'personal', telefono: '', direccion: '', localidad: '',
    codigo_postal: '', nombre_empresa: '', cuit: '', dni: '',
  })
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useModalBehavior(cardRef, onClose, { active: !loginOpen })

  useEffect(() => {
    loadPendingOrder()
  }, [])

  async function loadPendingOrder(): Promise<PendingOrder | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPendingOrder(null); return null }
    const { data } = await supabase
      .from('orders')
      .select('id, notes, order_items(product_id, quantity, unit_price, products(name, image))')
      .eq('user_id', user.id)
      .eq('status', 'nuevo')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const order = (data as PendingOrder | null) ?? null
    setPendingOrder(order)
    if (order?.notes) setNotes(order.notes)
    return order
  }

  function buildMergedItems(overrideOrder?: PendingOrder | null): CartItem[] {
    const effectiveOrder = overrideOrder !== undefined
      ? overrideOrder
      : (pendingOrder && pendingOrder !== 'loading' ? pendingOrder : null)

    const base: CartItem[] = effectiveOrder
      ? effectiveOrder.order_items.map(i => ({
          productId: i.product_id,
          productName: i.products?.name ?? i.product_id,
          image: i.products?.image ?? '',
          quantity: i.quantity,
          unitPrice: i.unit_price ?? undefined,
        }))
      : []

    const merged = [...base]
    for (const cartItem of items) {
      const found = merged.find(i => i.productId === cartItem.productId)
      if (found) found.quantity += cartItem.quantity
      else merged.push({ ...cartItem })
    }
    return merged
  }

  async function loadProfile(): Promise<ProfileData | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('profiles')
      .select('nombre,empresa,telefono,direccion,localidad,codigo_postal,cuit,dni,tipo_facturacion')
      .eq('id', user.id).single()
    if (data) {
      setForm({
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
    return data as ProfileData | null
  }

  function isProfileComplete(prof: ProfileData | null): boolean {
    if (!prof) return false
    const tipo = (prof.tipo_facturacion ?? 'personal') as TipoFacturacion
    return !!(prof.telefono && prof.direccion && prof.localidad &&
      (tipo === 'empresa' ? (prof.empresa && prof.cuit) : prof.dni))
  }

  async function handleConfirmar() {
    if (count === 0) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoginOpen(true); return }
    const prof = await loadProfile()
    if (!isProfileComplete(prof)) { setVista('perfil'); return }
    await submitOrder(buildMergedItems())
  }

  async function handleGuardarYConfirmar() {
    const tipo = form.tipo
    if (!form.telefono || !form.direccion || !form.localidad) {
      setError('Teléfono, dirección y localidad son obligatorios.'); return
    }
    if (tipo === 'empresa' && (!form.nombre_empresa || !form.cuit)) {
      setError('Nombre de empresa y CUIT son obligatorios.'); return
    }
    if (tipo === 'personal' && !form.dni) {
      setError('El DNI es obligatorio.'); return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoginOpen(true); setLoading(false); return }
    const { error: updateError } = await supabase.from('profiles').update({
      tipo_facturacion: tipo,
      telefono: form.telefono,
      direccion: form.direccion,
      localidad: form.localidad,
      codigo_postal: form.codigo_postal || null,
      empresa: tipo === 'empresa' ? form.nombre_empresa : null,
      cuit: tipo === 'empresa' ? form.cuit : null,
      dni: tipo === 'personal' ? form.dni : null,
    }).eq('id', user.id)
    if (updateError) {
      setError('No pudimos guardar tus datos. Probá de nuevo.')
      setLoading(false)
      return
    }
    await submitOrder(buildMergedItems())
  }

  async function submitOrder(mergedItems: CartItem[]) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: mergedItems, notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error === 'perfil_incompleto' ? 'Completá tus datos de contacto.' : (data.error ?? 'Error al enviar el pedido.'))
        if (data.error === 'perfil_incompleto') setVista('perfil')
        return
      }
      setOrderId(data.orderId)
      setWasUpdated(!!data.wasUpdated)
      clear()
      setVista('confirmado')
    } catch {
      setError('No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const hasPending = pendingOrder !== 'loading' && pendingOrder !== null ? pendingOrder : null
  const tipo = form.tipo

  return (
    <>
      <div
        ref={overlayRef}
        onClick={e => { if (e.target === overlayRef.current) onClose() }}
        className="modal-overlay"
        role="dialog" aria-modal="true" aria-label="Carrito"
      >
        <div ref={cardRef} className="modal-card modal-card--md">
          <button onClick={onClose} aria-label="Cerrar" className="modal-close-x">✕</button>

          {/* ── Vista carrito ── */}
          {vista === 'carrito' && (
            <>
              {/* Cargando */}
              {pendingOrder === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 14 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--orange-600)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'cart-spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Obteniendo datos...</p>
                  <style>{`@keyframes cart-spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Pedido pendiente */}
              {pendingOrder !== 'loading' && hasPending && (
                <div style={{ marginBottom: count > 0 ? 20 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>Pedido pendiente</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--warning-700)', background: 'var(--warning-100)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      #{hasPending.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                    {hasPending.order_items.length === 0 && (
                      <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Sin ítems.</p>
                    )}
                    {hasPending.order_items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.products?.image && (
                          <Image src={item.products.image} alt={item.products.name ?? ''} width={36} height={30} style={{ objectFit: 'contain', borderRadius: 3, background: 'white', flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.products?.name ?? item.product_id}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', flexShrink: 0 }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {hasPending.notes && (
                    <p style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic', marginTop: 5, paddingLeft: 2 }}>
                      &ldquo;{hasPending.notes}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Divisor */}
              {pendingOrder !== 'loading' && hasPending && count > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', marginBottom: 20 }} />
              )}

              {/* Ítems del carrito */}
              {pendingOrder !== 'loading' && count > 0 ? (
                <>
                  {hasPending && (
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 10 }}>Agregar al pedido</p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {items.map(item => (
                      <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                        <Image src={item.image} alt={item.productName} width={44} height={36} style={{ objectFit: 'contain', borderRadius: 4, background: 'white', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-1)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</p>
                          {item.unitPrice && <p style={{ fontSize: 11, color: 'var(--fg-3)' }}>{item.unitPrice}</p>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <button className="qty-btn" onClick={() => setQty(item.productId, item.quantity - 1)} aria-label="Restar">−</button>
                          <input
                            type="number" min={1} value={item.quantity}
                            aria-label="Cantidad"
                            onChange={e => { const n = parseInt(e.target.value, 10); if (!isNaN(n) && n > 0) setQty(item.productId, n) }}
                            onBlur={e => { if (isNaN(parseInt(e.target.value, 10)) || parseInt(e.target.value, 10) < 1) setQty(item.productId, 1) }}
                            style={{ width: 42, textAlign: 'center', fontSize: 13, fontWeight: 600, padding: '3px 2px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--fg-1)', outline: 'none' }}
                          />
                          <button className="qty-btn" onClick={() => setQty(item.productId, item.quantity + 1)} aria-label="Sumar">+</button>
                          <button className="qty-btn" onClick={() => remove(item.productId)} aria-label="Quitar del carrito" style={{ color: 'var(--error-500)', marginLeft: 2 }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label">
                      Notas {hasPending ? '(reemplaza las anteriores)' : '(opcional)'}
                      <textarea
                        className="form-input"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Ej: entrega urgente, consulta por volumen..."
                        style={{ resize: 'vertical', marginTop: 5 }}
                      />
                    </label>
                  </div>

                  {error && <ErrorMsg>{error}</ErrorMsg>}
                  <button
                    className="btn-block"
                    style={{ marginTop: error ? 12 : 0 }}
                    disabled={loading}
                    onClick={handleConfirmar}
                  >
                    {loading ? 'Procesando...' : (hasPending ? 'Agregar al pedido' : 'Enviar pedido')}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', marginTop: 8 }}>
                    Andrés te contactará para acordar precio, envío y pago.
                  </p>
                </>
              ) : pendingOrder !== 'loading' && !hasPending ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 20 }}>El carrito está vacío.</p>
                  <Link href="/productos" onClick={onClose} className="btn-primary">Ver productos</Link>
                </div>
              ) : null}
            </>
          )}

          {/* ── Vista perfil ── */}
          {vista === 'perfil' && (
            <>
              <button
                onClick={() => setVista('carrito')}
                className="btn-text"
                style={{ color: 'var(--fg-3)', fontWeight: 400, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                ← Volver
              </button>
              <h2 className="modal-title" style={{ marginBottom: 20 }}>Completá tus datos</h2>
              <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 20 }}>Necesitamos estos datos para coordinar el envío.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <FieldInput label="Teléfono / WhatsApp *" value={form.telefono} onChange={v => setForm(p => ({ ...p, telefono: v }))} placeholder="+54 9 11 1234-5678" inputMode="tel" />
                <FieldInput label="Dirección *" value={form.direccion} onChange={v => setForm(p => ({ ...p, direccion: v }))} placeholder="Calle 123, Piso 4" />
                <div className="form-grid-2">
                  <FieldInput label="Localidad *" value={form.localidad} onChange={v => setForm(p => ({ ...p, localidad: v }))} placeholder="CABA" />
                  <FieldInput label="Código postal" value={form.codigo_postal} onChange={v => setForm(p => ({ ...p, codigo_postal: v }))} placeholder="1414" inputMode="numeric" />
                </div>
                <div>
                  <span className="form-label" style={{ marginBottom: 5 }}>Tipo de facturación</span>
                  <ChoiceToggle
                    options={[{ value: 'personal', label: 'Personal' }, { value: 'empresa', label: 'Empresa' }]}
                    value={tipo}
                    onChange={t => setForm(p => ({ ...p, tipo: t }))}
                  />
                </div>
                {tipo === 'personal' && (
                  <FieldInput label="DNI *" value={form.dni} onChange={v => setForm(p => ({ ...p, dni: v.replace(/\D/g, '').slice(0, 8) }))} placeholder="12345678" inputMode="numeric" />
                )}
                {tipo === 'empresa' && (
                  <>
                    <FieldInput label="Nombre de empresa *" value={form.nombre_empresa} onChange={v => setForm(p => ({ ...p, nombre_empresa: v }))} placeholder="AFIN SRL" />
                    <FieldInput label="CUIT *" value={form.cuit} onChange={v => setForm(p => ({ ...p, cuit: formatCuit(v) }))} placeholder="20-12345678-9" inputMode="numeric" />
                  </>
                )}
              </div>
              {error && <div style={{ marginTop: 14 }}><ErrorMsg>{error}</ErrorMsg></div>}
              <button className="btn-block" style={{ marginTop: 18 }} disabled={loading} onClick={handleGuardarYConfirmar}>
                {loading ? 'Enviando...' : 'Confirmar pedido'}
              </button>
            </>
          )}

          {/* ── Vista confirmado ── */}
          {vista === 'confirmado' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
              <h2 className="modal-title" style={{ marginBottom: 8 }}>
                {wasUpdated ? '¡Pedido actualizado!' : '¡Pedido enviado!'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 20 }}>
                {wasUpdated
                  ? 'Los nuevos ítems fueron agregados al pedido pendiente.'
                  : 'Andrés te contactará a la brevedad para confirmar disponibilidad, precio y envío.'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 24 }}>
                Pedido: <strong>{orderId.slice(0, 8).toUpperCase()}</strong>
              </p>
              <button onClick={onClose} className="btn-primary">Seguir explorando</button>
            </div>
          )}
        </div>
      </div>

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={async () => {
            setLoginOpen(false)
            const loadedOrder = await loadPendingOrder()
            const prof = await loadProfile()
            if (!isProfileComplete(prof)) { setVista('perfil'); return }
            await submitOrder(buildMergedItems(loadedOrder))
          }}
        />
      )}
    </>
  )
}
