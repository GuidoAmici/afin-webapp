'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import CartModal from './CartModal'

export default function CartButton() {
  const { count, ready } = useCart()
  const [modalOpen, setModalOpen] = useState(false)

  const buttonStyle: React.CSSProperties = {
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 38, height: 38, borderRadius: 'var(--radius-full)',
    color: 'var(--fg-2)', background: 'none', border: 'none', cursor: ready ? 'pointer' : 'default',
  }

  if (!ready) {
    return (
      <div style={buttonStyle} aria-label="Cargando carrito" aria-busy="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span style={{
          position: 'absolute', top: 2, right: 2,
          width: 10, height: 10, borderRadius: '50%',
          border: '1.5px solid var(--orange-300)',
          borderTopColor: 'var(--orange-600)',
          animation: 'cart-spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes cart-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        aria-label={`Ver carrito (${count} producto${count !== 1 ? 's' : ''})`}
        style={buttonStyle}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: 'var(--orange-600)', color: 'white',
            fontSize: 10, fontWeight: 700, lineHeight: 1,
            minWidth: 16, height: 16, borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
          }}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {modalOpen && <CartModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
