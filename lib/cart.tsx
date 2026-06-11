'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  productId: string
  productName: string
  image: string
  quantity: number
  unitPrice?: string
}

interface CartContextValue {
  items: CartItem[]
  count: number
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'afin_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function add(item: Omit<CartItem, 'quantity'>, qty = 1) {
    const amount = Math.max(1, qty)
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + amount } : i
        )
      }
      return [...prev, { ...item, quantity: amount }]
    })
  }

  function remove(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  function setQty(productId: string, qty: number) {
    if (qty <= 0) { remove(productId); return }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i))
  }

  function clear() { setItems([]) }

  return (
    <CartContext.Provider value={{ items, count: items.reduce((s, i) => s + i.quantity, 0), add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
