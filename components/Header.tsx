'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/quienes-somos', label: 'Quiénes Somos' },
  { href: '/blog', label: 'Blog' },
]

const DROPDOWN_ITEMS = [
  { href: '/productos#tapas',        label: 'Tapas · Cierres' },
  { href: '/productos#frascos',      label: 'Frascos' },
  { href: '/productos#envases',      label: 'Envases Plásticos' },
  { href: '/productos#dosificacion', label: 'Dosificación' },
  { href: '/productos#dispensers',   label: 'Dispensers' },
  { href: '/productos#accesorios',   label: 'Accesorios' },
]

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()

  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLElement>(null)

  const isActive = (href: string) => pathname === href

  const closeMobile = () => {
    setMobileOpen(false)
    document.body.style.overflow = ''
    mobileTriggerRef.current?.focus()
  }

  const openMobile = () => {
    setMobileOpen(true)
    document.body.style.overflow = 'hidden'
  }

  useEffect(() => {
    if (!mobileOpen) return
    mobileCloseRef.current?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        document.body.style.overflow = ''
        mobileTriggerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const panel = mobileMenuRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen])

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      setDropdownOpen(true)
      const firstItem = document.querySelector<HTMLElement>('.dropdown-item')
      firstItem?.focus()
    }
    if (e.key === 'Escape') {
      setDropdownOpen(false)
    }
  }

  const handleDropdownBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropdownOpen(false)
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="header-logo">
            <Image src="/images/logo.png" alt="AFIN srl" width={120} height={44} priority />
          </Link>

          <nav className="header-nav" aria-label="Navegación principal">
            {NAV_LINKS.map(({ href, label }) => (
              <div className="nav-item" key={href}>
                <Link href={href} className={`nav-link${isActive(href) ? ' active' : ''}`}>
                  {label}
                </Link>
              </div>
            ))}

            <div
              className={`nav-item${dropdownOpen ? ' dropdown-open' : ''}`}
              onBlur={handleDropdownBlur}
            >
              <Link
                href="/productos"
                className={`nav-link${pathname.startsWith('/productos') ? ' active' : ''}`}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-controls="productos-menu"
                onKeyDown={handleDropdownKeyDown}
              >
                Productos
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </Link>
              <div className="dropdown-menu" role="menu" id="productos-menu">
                {DROPDOWN_ITEMS.map(({ href, label }) => (
                  <Link key={href} href={href} className="dropdown-item" role="menuitem">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="header-actions">
            <ThemeToggle />
            <Link href="/contacto" className="btn-primary">Contacto</Link>
            <button
              ref={mobileTriggerRef}
              className="mobile-toggle"
              onClick={openMobile}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu-panel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menú">
        <div className="mobile-menu-overlay" onClick={closeMobile} />
        <nav ref={mobileMenuRef} id="mobile-menu-panel" className="mobile-menu-panel">
          <button ref={mobileCloseRef} className="mobile-menu-close" onClick={closeMobile} aria-label="Cerrar menú">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {[...NAV_LINKS, { href: '/productos', label: 'Productos' }, { href: '/contacto', label: 'Contacto' }].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`mobile-nav-link${isActive(href) || (href === '/productos' && pathname.startsWith('/productos')) ? ' active' : ''}`}
              onClick={closeMobile}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
