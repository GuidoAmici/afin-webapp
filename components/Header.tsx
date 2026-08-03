'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import CartButton from './CartButton'
import AccountButton from './AccountButton'
import { ChevronDownIcon, CloseIcon, MenuIcon } from './icons'
import { useModalBehavior } from '@/lib/useModalBehavior'
import { flags } from '@/lib/flags'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/quienes-somos', label: 'Quiénes Somos' },
  { href: '/blog', label: 'Blog' },
]

// Los ids deben coincidir con public.categories (ver seed de Supabase).
const DROPDOWN_ITEMS = [
  { href: '/productos?cat=tapas',         label: 'Tapas · Cierres' },
  { href: '/productos?cat=dosificadores', label: 'Dosificadores' },
  { href: '/productos?cat=frascos',       label: 'Frascos completos' },
  { href: '/productos?cat=envases',       label: 'Envases' },
  { href: '/productos?cat=accesorios',    label: 'Accesorios' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()

  const mobileMenuRef = useRef<HTMLElement>(null)

  const isActive = (href: string) => pathname === href
  const closeMobile = () => setMobileOpen(false)

  useModalBehavior(mobileMenuRef, closeMobile, { active: mobileOpen })

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
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu-panel"
          >
            <MenuIcon size={20} />
          </button>

          <Link href="/" className="header-logo" aria-label="afin srl — Inicio">
            <Logo />
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
                <ChevronDownIcon />
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
            <AccountButton />
            {flags.pedidos && <CartButton />}
            <Link href="/contacto" className="btn-primary">Contacto</Link>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menú">
        <div className="mobile-menu-overlay" onClick={closeMobile} />
        <nav ref={mobileMenuRef} id="mobile-menu-panel" className="mobile-menu-panel">
          <button className="mobile-menu-close" onClick={closeMobile} aria-label="Cerrar menú">
            <CloseIcon size={18} />
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
