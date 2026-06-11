import { createClient } from '@/lib/supabase/server'

const STATUS_LABEL: Record<string, string> = {
  nuevo:           'Nuevo',
  contactado:      'Contactado',
  esperando_pago:  'Esperando pago',
  confirmado:      'Confirmado',
  en_preparacion:  'En preparación',
  despachado:      'Despachado',
  entregado:       'Entregado',
  cancelado:       'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  nuevo:           'var(--warning-500)',
  contactado:      'var(--orange-500)',
  esperando_pago:  'var(--orange-600)',
  confirmado:      'var(--success-500)',
  en_preparacion:  'var(--success-500)',
  despachado:      'var(--neutral-500)',
  entregado:       'var(--neutral-400)',
  cancelado:       'var(--error-500)',
}

export default async function PedidosPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, status, notes, created_at,
      profiles ( nombre, empresa, telefono ),
      order_items ( quantity, unit_price, products ( name ) )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg-1)' }}>Pedidos</h1>
        <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{orders?.length ?? 0} pedido{orders?.length !== 1 ? 's' : ''}</span>
      </div>

      {!orders?.length ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>Todavía no hay pedidos.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const profile = (order.profiles as unknown) as { nombre: string; empresa: string | null; telefono: string | null } | null
            const items = (order.order_items as unknown) as { quantity: number; unit_price: string | null; products: { name: string } | null }[]
            const fecha = new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

            return (
              <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', borderLeft: `4px solid ${STATUS_COLOR[order.status] ?? 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[order.status], background: `${STATUS_COLOR[order.status]}18`, padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                        {STATUS_LABEL[order.status]}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{fecha}</span>
                      <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'monospace' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 2 }}>
                      {profile?.nombre}{profile?.empresa ? ` — ${profile.empresa}` : ''}
                    </p>
                    {profile?.telefono && (
                      <a href={`https://wa.me/${profile.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--orange-600)', textDecoration: 'none' }}>
                        {profile.telefono}
                      </a>
                    )}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
