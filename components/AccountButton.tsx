'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoginModal from './LoginModal'
import { OrdersIcon, UserIcon, SignOutIcon } from './icons'

export default function AccountButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    function applyUser(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown>; email?: string | null } | null) {
      if (!user) { setLoggedIn(false); setAvatarUrl(null); setInitials(''); setRole(null); return }
      setLoggedIn(true)
      const meta = user.user_metadata ?? {}
      setAvatarUrl((meta.avatar_url as string) ?? null)
      const fullName = (meta.full_name as string) ?? (meta.name as string) ?? user.email ?? ''
      setInitials(
        fullName.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')
      )
      setRole((user.app_metadata?.role as string) ?? null)
    }

    supabase.auth.getUser().then(({ data: { user } }) => applyUser(user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [dropdownOpen])

  async function handleSignOut() {
    setDropdownOpen(false)
    await createClient().auth.signOut()
    setLoggedIn(false)
    router.push('/')
    router.refresh()
  }

  if (loggedIn === null) return null

  return (
    <>
      <div ref={containerRef} style={{ position: 'relative' }}>
        {loggedIn ? (
          <>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              aria-label="Mi cuenta"
              style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', background: 'color-mix(in srgb, var(--orange-600) 12%, transparent)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--orange-400)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Mi cuenta"
                  width={36}
                  height={36}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setAvatarUrl(null)}
                />
              ) : initials ? (
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-600)', lineHeight: 1, userSelect: 'none' }}>{initials}</span>
              ) : (
                <UserIcon size={18} style={{ color: 'var(--orange-600)' }} />
              )}
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.15))', minWidth: 168, zIndex: 9000, overflow: 'hidden' }}
              >
                {role === 'empleado' && (
                  <>
                    <Link href="/empleados" role="menuitem" onClick={() => setDropdownOpen(false)} style={{ ...linkItemStyle, color: 'var(--orange-600)', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                      Panel interno
                    </Link>
                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  </>
                )}
                <Link href="/cuenta/pedidos" role="menuitem" onClick={() => setDropdownOpen(false)} style={linkItemStyle}>
                  <OrdersIcon size={14} style={{ flexShrink: 0 }} /> Mis pedidos
                </Link>
                <Link href="/cuenta" role="menuitem" onClick={() => setDropdownOpen(false)} style={linkItemStyle}>
                  <UserIcon size={14} style={{ flexShrink: 0 }} /> Mi perfil
                </Link>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <button role="menuitem" onClick={handleSignOut} style={{ ...linkItemStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-500)' }}>
                  <SignOutIcon size={14} style={{ flexShrink: 0 }} /> Cerrar sesión
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange-600)', padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--orange-600)', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Ingresar
          </button>
        )}
      </div>

      {modalOpen && (
        <LoginModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

const linkItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '10px 14px', fontSize: 13, fontWeight: 500,
  color: 'var(--fg-1)', textDecoration: 'none',
}
