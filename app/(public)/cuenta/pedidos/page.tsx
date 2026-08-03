'use client'

import { useEffect, useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { flags } from '@/lib/flags'
import { statusMeta, statusTint } from '@/lib/order-status'
import { paymentMeta, paymentMethodLabel } from '@/lib/payment-status'
import { formatARS } from '@/lib/format'

interface OrderItem {
  product_id: string
  quantity: number
  unit_price: string | null
  products: { name: string; image: string } | null
}

interface Order {
  id: string
  status: string
  payment_status: string
  payment_method: string | null
  total: string | null
  discount_pct: string | null
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Subtotal de línea formateado, o null si no hay precio cargado todavía. */
function lineSubtotal(item: OrderItem): string | null {
  if (item.unit_price === null || item.unit_price === '') return null
  const n = Number(item.unit_price)
  return Number.isFinite(n) ? formatARS(n * item.quantity) : null
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase
        .from('orders')
        .select('id, status, payment_status, payment_method, total, discount_pct, notes, created_at, order_items(product_id, quantity, unit_price, products(name, image))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders((data as unknown as Order[]) ?? [])
    }
    load()
  }, [router])

  // El historial es parte del canal de pedidos: si el canal no está habilitado en
  // este entorno, la ruta directamente no existe. Va después de los hooks para no
  // alterar su orden.
  if (!flags.pedidos) notFound()

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 style={h1Style}>Mis pedidos</h1>
          <Link href="/cuenta" style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}>
            Mi perfil →
          </Link>
        </div>

        {orders === null && (
          <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>Cargando...</p>
        )}

        {orders?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 20 }}>Todavía no hiciste ningún pedido.</p>
            <Link href="/productos" className="btn-primary">Ver productos</Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => {
              const logistic = statusMeta(order.status)
              const payment = paymentMeta(order.payment_status)
              const method = paymentMethodLabel(order.payment_method)
              const discount = order.discount_pct !== null && Number(order.discount_pct) > 0 ? Number(order.discount_pct) : null
              const isOpen = expanded.has(order.id)
              const panelId = `order-detail-${order.id}`

              return (
                <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {/* Header clickeable: dispara el expand/collapse */}
                  <button
                    type="button"
                    onClick={() => toggle(order.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    style={headerBtnStyle}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={chipStyle(logistic.color)}>{logistic.label}</span>
                      <span style={chipStyle(payment.color)}>{payment.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg-1)' }}>
                          {order.total !== null ? formatARS(order.total) : 'A confirmar'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{formatDate(order.created_at)}</span>
                      </div>
                      <span aria-hidden style={{ fontSize: 12, color: 'var(--fg-3)', transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                        ▾
                      </span>
                    </div>
                  </button>

                  {/* Detalle expandible */}
                  {isOpen && (
                    <div id={panelId} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {order.order_items.map((item, i) => {
                        const sub = lineSubtotal(item)
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {item.products?.image && (
                              <Image src={item.products.image} alt={item.products.name ?? ''} width={40} height={32} style={{ objectFit: 'contain', borderRadius: 4, background: 'var(--bg-surface)', flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: 13, color: 'var(--fg-1)' }}>
                                {item.products?.name ?? item.product_id}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                                {item.unit_price ? `${formatARS(item.unit_price)} c/u` : 'Precio a confirmar'} · ×{item.quantity}
                              </span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', flexShrink: 0 }}>
                              {sub ?? `×${item.quantity}`}
                            </span>
                          </div>
                        )
                      })}

                      {/* Resumen de pago */}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {method && (
                          <div style={summaryRow}>
                            <span style={{ color: 'var(--fg-3)' }}>Medio de pago</span>
                            <span style={{ color: 'var(--fg-2)', fontWeight: 600 }}>{method}</span>
                          </div>
                        )}
                        {discount !== null && (
                          <div style={summaryRow}>
                            <span style={{ color: 'var(--fg-3)' }}>Descuento</span>
                            <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>−{discount}%</span>
                          </div>
                        )}
                        <div style={summaryRow}>
                          <span style={{ color: 'var(--fg-2)', fontWeight: 700 }}>Total</span>
                          <span style={{ color: 'var(--fg-1)', fontWeight: 700 }}>
                            {order.total !== null ? formatARS(order.total) : 'A confirmar'}
                          </span>
                        </div>
                      </div>

                      {order.notes && (
                        <p style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic', marginTop: 4 }}>
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const chipStyle = (color: string): React.CSSProperties => ({
  fontSize: 11, fontWeight: 600, color, background: statusTint(color),
  padding: '2px 8px', borderRadius: 'var(--radius-full)',
})

const summaryRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: 12 }

const headerBtnStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 16px', background: 'var(--bg-surface)', gap: 8,
  border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit',
}

const pageStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'var(--bg-surface)', padding: '48px 16px' }
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: 600, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: 'var(--shadow-md)' }
const h1Style: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: 'var(--fg-1)' }
