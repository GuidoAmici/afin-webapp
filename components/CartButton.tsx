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
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
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
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
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
