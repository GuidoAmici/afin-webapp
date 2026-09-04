import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { panelProductos, panelClientes } from '@/lib/flags'

export default async function EmpleadosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // El nav declara qué flag habilita cada sección; sin flag, siempre visible.
  // Antes linkeaba a /productos y /clientes, que no existen (#18) — 404 desde el nav.
  const NAV_SECTIONS = [
    { href: '/empleados/pedidos', label: 'Pedidos', enabled: true },
    { href: '/empleados/productos', label: 'Productos', enabled: await panelProductos() },
    { href: '/empleados/clientes', label: 'Clientes', enabled: await panelClientes() },
  ]

  if (!user) redirect('/auth/login?redirect=/empleados')

  // El panel es para staff: empleado y admin (ADR-008). La distinción
  // empleado/admin se enforza en RLS/transition_order, no en esta guarda.
  const role = user.app_metadata?.role
  if (role !== 'empleado' && role !== 'admin') redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
      <nav style={{
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/empleados" style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange-600)', textDecoration: 'none' }}>
            AFIN
          </Link>
          {NAV_SECTIONS.filter(s => s.enabled).map(({ href, label }) => (
            <Link key={href} href={href} style={navLink}>{label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{profile?.nombre}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{
              fontSize: 13, color: 'var(--fg-3)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
            }}>
              Salir
            </button>
          </form>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}

const navLink: React.CSSProperties = {
  fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none', fontWeight: 500,
}
