import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { statusMeta, statusTint } from '@/lib/order-status'
import { paymentMeta, paymentMethodLabel } from '@/lib/payment-status'
import { formatARS } from '@/lib/format'

interface OrderDetail {
  id: string
  status: string
  payment_status: string
  payment_method: string | null
  total: string | null
  discount_pct: string | null
  notes: string | null
  created_at: string
  user_id: string
  profiles: { nombre: string; empresa: string | null; telefono: string | null } | null
  order_items: { quantity: number; unit_price: string | null; products: { name: string } | null }[]
}

interface OrderEvent {
  id: string
  event_type: string
  from_status: string | null
  to_status: string | null
  actor_id: string | null
  actor_role: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

interface Payment {
  id: string
  amount: string
  payment_method: string | null
  payment_date: string | null
  notes: string | null
  created_at: string
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// La transición se registra como 'transition:status' | 'transition:payment_status'.
// Resolvemos la etiqueta del estado destino con el helper del eje correspondiente.
function eventLabel(ev: OrderEvent): { axis: string; from: string; to: string } {
  const isPayment = ev.event_type === 'transition:payment_status'
  const meta = isPayment ? paymentMeta : statusMeta
  return {
    axis: isPayment ? 'Pago' : 'Estado',
    from: ev.from_status ? meta(ev.from_status).label : '—',
    to: ev.to_status ? meta(ev.to_status).label : '—',
  }
}

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, status, payment_status, payment_method, total, discount_pct, notes, created_at, user_id,
      profiles ( nombre, empresa, telefono ),
      order_items ( quantity, unit_price, products ( name ) )
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const detail = order as unknown as OrderDetail

  const [{ data: eventsData }, { data: paymentsData }] = await Promise.all([
    supabase
      .from('order_events')
      .select('id, event_type, from_status, to_status, actor_id, actor_role, metadata, created_at')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('id, amount, payment_method, payment_date, notes, created_at')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
  ])

  const events = (eventsData as unknown as OrderEvent[]) ?? []
  const payments = (paymentsData as unknown as Payment[]) ?? []

  // order_events.actor_id apunta a auth.users (no a profiles), así que no se puede
  // embeber: resolvemos los nombres en una consulta aparte y armamos un mapa.
  const actorIds = [...new Set(events.map(e => e.actor_id).filter((x): x is string => !!x))]
  const actorNames = new Map<string, string>()
  if (actorIds.length) {
    const { data: actors } = await supabase
      .from('profiles')
      .select('id, nombre')
      .in('id', actorIds)
    for (const a of (actors as { id: string; nombre: string }[] | null) ?? []) {
      actorNames.set(a.id, a.nombre)
    }
  }

  function actorLabel(ev: OrderEvent): string {
    if (!ev.actor_id) return ev.actor_role === 'system' ? 'Sistema' : (ev.actor_role ?? 'Sistema')
    const name = actorNames.get(ev.actor_id)
    if (name) return ev.actor_role ? `${name} (${ev.actor_role})` : name
    return ev.actor_role ?? 'Usuario'
  }

  const logistic = statusMeta(detail.status)
  const payment = paymentMeta(detail.payment_status)
  const method = paymentMethodLabel(detail.payment_method)
  const discount = detail.discount_pct !== null && Number(detail.discount_pct) > 0 ? Number(detail.discount_pct) : null
  const profile = detail.profiles

  return (
    <div style={{ maxWidth: 760 }}>
      <Link href="/empleados/pedidos" style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}>
        ← Volver a pedidos
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 4px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg-1)' }}>
          Pedido #{detail.id.slice(0, 8).toUpperCase()}
        </h1>
        <span style={chipStyle(logistic.color)}>{logistic.label}</span>
        <span style={chipStyle(payment.color)}>{payment.label}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 24 }}>
        Creado el {formatDateTime(detail.created_at)}
      </p>

      {/* Cliente */}
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Cliente</h2>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>
          {profile?.nombre ?? 'Cliente'}{profile?.empresa ? ` — ${profile.empresa}` : ''}
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
          {profile?.telefono && (
            <a href={`https://wa.me/${profile.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--orange-600)', textDecoration: 'none' }}>
              {profile.telefono}
            </a>
          )}
        </div>
      </section>

      {/* Ítems + totales */}
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Detalle</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {detail.order_items.map((item, i) => {
            const unit = item.unit_price !== null && item.unit_price !== '' ? Number(item.unit_price) : null
            const sub = unit !== null && Number.isFinite(unit) ? unit * item.quantity : null
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 14, color: 'var(--fg-1)' }}>
                  {item.products?.name ?? 'Producto eliminado'}
                  <span style={{ color: 'var(--fg-3)' }}> · ×{item.quantity}</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-2)', flexShrink: 0 }}>
                  {sub !== null ? formatARS(sub) : `×${item.quantity}`}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {method && (
            <div style={summaryRow}><span style={{ color: 'var(--fg-3)' }}>Medio de pago</span><span style={{ color: 'var(--fg-2)', fontWeight: 600 }}>{method}</span></div>
          )}
          {discount !== null && (
            <div style={summaryRow}><span style={{ color: 'var(--fg-3)' }}>Descuento</span><span style={{ color: 'var(--success-700)', fontWeight: 600 }}>−{discount}%</span></div>
          )}
          <div style={summaryRow}>
            <span style={{ color: 'var(--fg-1)', fontWeight: 700, fontSize: 15 }}>Total</span>
            <span style={{ color: 'var(--fg-1)', fontWeight: 700, fontSize: 15 }}>{formatARS(detail.total)}</span>
          </div>
        </div>

        {detail.notes && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic', marginTop: 10 }}>
            &ldquo;{detail.notes}&rdquo;
          </p>
        )}
      </section>

      {/* Pagos registrados */}
      {payments.length > 0 && (
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Pagos registrados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {payments.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{formatARS(p.amount)}</span>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>
                    {paymentMethodLabel(p.payment_method) ?? '—'}
                  </span>
                  {p.notes && <span style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic', marginLeft: 8 }}>· {p.notes}</span>}
                </div>
                <span style={{ fontSize: 12, color: 'var(--fg-3)', flexShrink: 0 }}>
                  {formatDateTime(p.payment_date ?? p.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline de eventos */}
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Historial</h2>
        {!events.length ? (
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Sin eventos registrados todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {events.map((ev, i) => {
              const { axis, from, to } = eventLabel(ev)
              const note = ev.metadata && typeof ev.metadata === 'object'
                ? (ev.metadata['nota'] ?? ev.metadata['note'] ?? ev.metadata['motivo']) as string | undefined
                : undefined
              const isLast = i === events.length - 1
              return (
                <div key={ev.id} style={{ display: 'flex', gap: 12 }}>
                  {/* Riel del timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--orange-600)', marginTop: 5 }} />
                    {!isLast && <span style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 12 }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : 16 }}>
                    <p style={{ fontSize: 14, color: 'var(--fg-1)' }}>
                      <span style={{ color: 'var(--fg-3)' }}>{axis}:</span> {from} → <strong>{to}</strong>
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                      {actorLabel(ev)} · {formatDateTime(ev.created_at)}
                    </p>
                    {note && (
                      <p style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic', marginTop: 2 }}>
                        &ldquo;{note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

const chipStyle = (color: string): React.CSSProperties => ({
  fontSize: 12, fontWeight: 600, color, background: statusTint(color),
  padding: '3px 8px', borderRadius: 'var(--radius-full)',
})

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 16,
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase',
  letterSpacing: '0.04em', marginBottom: 12,
}

const summaryRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: 13 }
