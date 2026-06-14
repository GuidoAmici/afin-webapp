import { createClient } from '@/lib/supabase/server'

export default async function EmpleadosPage() {
  const supabase = await createClient()

  const [{ count: pedidosNuevos }, { count: pedidosHoy }] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>
        Panel de operaciones
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 32 }}>
        {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Pedidos pendientes" value={pedidosNuevos ?? 0} accent={pedidosNuevos ? 'var(--warning-500)' : undefined} />
        <StatCard label="Pedidos hoy" value={pedidosHoy ?? 0} />
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px',
      }}>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>
          Sistema de pedidos en construcción — próximamente acá verás los pedidos del día.
        </p>
      </div>
    </div>
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
