import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { statusMeta, statusTint } from '@/lib/order-status'
import { paymentMeta } from '@/lib/payment-status'
import { formatARS } from '@/lib/format'
import { elapsedLabel, elapsedDays } from '@/lib/elapsed'

// Los pendientes van del más viejo al más nuevo: en una cola de trabajo, el que
// espera hace más es el que hay que atender primero. La cola de /empleados/pedidos
// ordena al revés a propósito — ahí se busca "qué entró recién".
interface PendingOrder {
  id: string
  status: string
  payment_status: string
  total: string | null
  notes: string | null
  created_at: string
  profiles: { nombre: string; empresa: string | null; telefono: string | null } | null
  order_items: { quantity: number; unit_price: string | null; products: { name: string } | null }[]
}

/** Una espera de más de dos días en un pedido pendiente ya es una señal. */
const DIAS_PARA_ALERTA = 2

export default async function EmpleadosPage() {
  const supabase = await createClient()

  const [{ data: pendientes }, { count: pedidosHoy }] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        id, status, payment_status, total, notes, created_at,
        profiles ( nombre, empresa, telefono ),
        order_items ( quantity, unit_price, products ( name ) )
      `)
      .eq('status', 'pendiente')
      .order('created_at', { ascending: true })
      .limit(50),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  const rows = (pendientes as unknown as PendingOrder[]) ?? []
  const demorados = rows.filter(o => elapsedDays(o.created_at) >= DIAS_PARA_ALERTA).length

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>
        Panel de operaciones
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 32 }}>
        {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Pedidos pendientes" value={rows.length} accent={rows.length ? 'var(--warning-500)' : undefined} />
        <StatCard label="Pedidos hoy" value={pedidosHoy ?? 0} />
        <StatCard
          label={`Esperando +${DIAS_PARA_ALERTA} días`}
          value={demorados}
          accent={demorados ? 'var(--error-500)' : undefined}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>
          Pedidos pendientes
        </h2>
        <Link href="/empleados/pedidos" style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}>
          Ver todos los pedidos →
        </Link>
      </div>

      {!rows.length ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>No hay pedidos pendientes. Todo al día.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(order => (
            <PendingOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Fila desplegable. Usa <details> nativo en vez de estado de React: el panel sigue
 * siendo un server component, sin JS de cliente ni hidratación para abrir un acordeón.
 */
function PendingOrderCard({ order }: { order: PendingOrder }) {
  const logistic = statusMeta(order.status)
  const payment = paymentMeta(order.payment_status)
  const profile = order.profiles
  const items = order.order_items ?? []
  const unidades = items.reduce((sum, i) => sum + i.quantity, 0)
  const demorado = elapsedDays(order.created_at) >= DIAS_PARA_ALERTA

  return (
    <details
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        borderLeft: `4px solid ${demorado ? 'var(--error-500)' : logistic.color}`,
      }}
    >
      <summary style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={chipStyle(logistic.color)}>{logistic.label}</span>
            <span style={chipStyle(payment.color)}>{payment.label}</span>
            <span style={{ fontSize: 12, color: demorado ? 'var(--error-500)' : 'var(--fg-3)', fontWeight: demorado ? 600 : 400 }}>
              {elapsedLabel(order.created_at)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'monospace' }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>
            {profile?.nombre ?? 'Cliente'}{profile?.empresa ? ` — ${profile.empresa}` : ''}
          </p>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
            {items.length} producto{items.length !== 1 ? 's' : ''} · {unidades} unidad{unidades !== 1 ? 'es' : ''}
          </span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-1)', flexShrink: 0 }}>
          {order.total !== null ? formatARS(order.total) : 'A confirmar'}
        </span>
      </summary>

      <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '12px 0' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--fg-1)' }}>
                {item.quantity}× {item.products?.name ?? 'Producto eliminado'}
              </span>
              <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}>
                {item.unit_price ? `${formatARS(item.unit_price)} c/u` : 'precio a confirmar'}
              </span>
            </div>
          ))}
        </div>

        {order.notes && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic', marginBottom: 12 }}>
            &ldquo;{order.notes}&rdquo;
          </p>
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`/empleados/pedidos/${order.id}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange-600)', textDecoration: 'none' }}>
            Abrir pedido →
          </Link>
          {profile?.telefono && (
            <a
              href={`https://wa.me/${profile.telefono.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}
            >
              WhatsApp al cliente
            </a>
          )}
        </div>
      </div>
    </details>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
      borderLeft: accent ? `4px solid ${accent}` : '1px solid var(--border)',
    }}>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: accent ?? 'var(--fg-1)' }}>{value}</p>
    </div>
  )
}

const chipStyle = (color: string): React.CSSProperties => ({
  fontSize: 12, fontWeight: 600, color, background: statusTint(color),
  padding: '3px 8px', borderRadius: 'var(--radius-full)',
})
