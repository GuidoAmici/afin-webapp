'use client'

import { useState } from 'react'
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

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const closeMobile = () => {
    setMobileOpen(false)
    document.body.style.overflow = ''
  }

  const openMobile = () => {
    setMobileOpen(true)
    document.body.style.overflow = 'hidden'
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="header-logo">
            <Image src="/images/logo.png" alt="Afin SRL" width={120} height={44} priority />
          </Link>

          <nav className="header-nav" aria-label="Navegación principal">
            {NAV_LINKS.map(({ href, label }) => (
              <div className="nav-item" key={href}>
                <Link href={href} className={`nav-link${isActive(href) ? ' active' : ''}`}>
                  {label}
                </Link>
              </div>
            ))}

            <div className="nav-item">
              <Link href="/productos" className={`nav-link${pathname.startsWith('/productos') ? ' active' : ''}`}>
                Productos
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </Link>
              <div className="dropdown-menu" role="menu">
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
              className="mobile-toggle"
              onClick={openMobile}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
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
        <nav className="mobile-menu-panel">
          <button className="mobile-menu-close" onClick={closeMobile} aria-label="Cerrar menú">
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
