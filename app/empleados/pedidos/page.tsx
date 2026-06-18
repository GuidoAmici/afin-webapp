import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { statusMeta, statusTint } from '@/lib/order-status'
import { paymentMeta, paymentMethodLabel } from '@/lib/payment-status'
import { formatARS } from '@/lib/format'

// Filtros de la cola operativa. `pago_revision` es la cola de transferencias
// informadas pendientes de corroborar (cruza el eje de pago); el resto filtra
// por estado logístico. `todos` no aplica filtro.
const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'pago_revision', label: 'Pago en revisión' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'en_preparacion', label: 'En preparación' },
  { key: 'listo', label: 'Listos' },
  { key: 'despachado', label: 'Despachados' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

interface OrderRow {
  id: string
  status: string
  payment_status: string
  payment_method: string | null
  total: string | null
  notes: string | null
  created_at: string
  profiles: { nombre: string; empresa: string | null; telefono: string | null } | null
  order_items: { quantity: number; products: { name: string } | null }[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>
}) {
  const { f } = await searchParams
  const filter: FilterKey = FILTERS.some(x => x.key === f) ? (f as FilterKey) : 'todos'

  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      id, status, payment_status, payment_method, total, notes, created_at,
      profiles ( nombre, empresa, telefono ),
      order_items ( quantity, products ( name ) )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filter === 'pago_revision') query = query.eq('payment_status', 'en_revision')
  else if (filter !== 'todos') query = query.eq('status', filter)

  const [{ data: orders }, { count: revisionCount }] = await Promise.all([
    query,
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'en_revision'),
  ])

  const rows = (orders as unknown as OrderRow[]) ?? []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg-1)' }}>Pedidos</h1>
        <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>
          {rows.length} pedido{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtros — la cola de corroboración lleva su propio contador. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {FILTERS.map(({ key, label }) => {
          const active = key === filter
          const showCount = key === 'pago_revision' && (revisionCount ?? 0) > 0
          return (
            <Link
              key={key}
              href={key === 'todos' ? '/empleados/pedidos' : `/empleados/pedidos?f=${key}`}
              style={{
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                color: active ? 'var(--bg-card)' : 'var(--fg-2)',
                background: active ? 'var(--orange-600)' : 'var(--bg-card)',
              }}
            >
              {label}
              {showCount && (
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 700,
                  color: active ? 'var(--bg-card)' : 'var(--warning-700)',
                }}>
                  {revisionCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {!rows.length ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>
            {filter === 'todos' ? 'Todavía no hay pedidos.' : 'No hay pedidos en este estado.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(order => {
            const profile = order.profiles
            const items = order.order_items ?? []
            const logistic = statusMeta(order.status)
            const payment = paymentMeta(order.payment_status)
            const method = paymentMethodLabel(order.payment_method)

            return (
              <Link
                key={order.id}
                href={`/empleados/pedidos/${order.id}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '20px 24px',
                  borderLeft: `4px solid ${logistic.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={chipStyle(logistic.color)}>{logistic.label}</span>
                      <span style={chipStyle(payment.color)}>{payment.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{formatDate(order.created_at)}</span>
                      <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'monospace' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 2 }}>
                      {profile?.nombre ?? 'Cliente'}{profile?.empresa ? ` — ${profile.empresa}` : ''}
                    </p>
                    {method && (
                      <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{method}</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>
                      {formatARS(order.total)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {items.map((item, i) => (
                    <span key={i} style={{ fontSize: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', color: 'var(--fg-2)' }}>
                      {item.quantity}× {item.products?.name ?? 'Producto eliminado'}
                    </span>
                  ))}
                </div>

                {order.notes && (
                  <p style={{ marginTop: 10, fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic' }}>
                    &ldquo;{order.notes}&rdquo;
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

const chipStyle = (color: string): React.CSSProperties => ({
  fontSize: 12, fontWeight: 600, color, background: statusTint(color),
  padding: '3px 8px', borderRadius: 'var(--radius-full)',
})
