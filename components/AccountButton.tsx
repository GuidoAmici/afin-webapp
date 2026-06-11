'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoginModal from './LoginModal'

export default function AccountButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user)
    })
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
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', padding: '7px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              Mi cuenta
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.15s', transform: dropdownOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.15))', minWidth: 168, zIndex: 9000, overflow: 'hidden' }}
              >
                <Link href="/cuenta/pedidos" role="menuitem" onClick={() => setDropdownOpen(false)} style={linkItemStyle}>
                  <OrdersIcon /> Mis pedidos
                </Link>
                <Link href="/cuenta" role="menuitem" onClick={() => setDropdownOpen(false)} style={linkItemStyle}>
                  <UserIcon /> Mi perfil
                </Link>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <button role="menuitem" onClick={handleSignOut} style={{ ...linkItemStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-600, #dc2626)' }}>
                  <SignOutIcon /> Cerrar sesión
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
          onSuccess={() => {
            setModalOpen(false)
            setLoggedIn(true)
          }}
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

function OrdersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
