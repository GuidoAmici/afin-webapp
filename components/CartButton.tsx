'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import CartModal from './CartModal'

export default function CartButton() {
  const { count } = useCart()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        aria-label={`Ver carrito (${count} producto${count !== 1 ? 's' : ''})`}
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, borderRadius: 'var(--radius-full)',
          color: 'var(--fg-2)', background: 'none', border: 'none', cursor: 'pointer',
        }}
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
