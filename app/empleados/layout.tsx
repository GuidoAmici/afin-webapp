import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EmpleadosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/empleados')

  if (user.app_metadata?.role !== 'empleado') redirect('/')

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
          <Link href="/empleados/pedidos" style={navLink}>Pedidos</Link>
          <Link href="/empleados/productos" style={navLink}>Productos</Link>
          <Link href="/empleados/clientes" style={navLink}>Clientes</Link>
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
