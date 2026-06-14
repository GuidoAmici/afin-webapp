'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { statusMeta, statusTint } from '@/lib/order-status'

interface OrderItem {
  product_id: string
  quantity: number
  unit_price: string | null
  products: { name: string; image: string } | null
}

interface Order {
  id: string
  status: string
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase
        .from('orders')
        .select('id, status, notes, created_at, order_items(product_id, quantity, unit_price, products(name, image))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders((data as unknown as Order[]) ?? [])
    }
    load()
  }, [router])

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 style={h1Style}>Mis pedidos</h1>
          <Link href="/cuenta" style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none' }}>
            Mi perfil →
          </Link>
        </div>

        {orders === null && (
          <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>Cargando...</p>
        )}

        {orders?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 20 }}>Todavía no hiciste ningún pedido.</p>
            <Link href="/productos" className="btn-primary">Ver productos</Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => {
              const { label, color } = statusMeta(order.status)
              return (
                <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {/* Header del pedido */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color, background: statusTint(color), padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {label}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  {/* Ítems */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {order.order_items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.products?.image && (
                          <Image src={item.products.image} alt={item.products.name ?? ''} width={40} height={32} style={{ objectFit: 'contain', borderRadius: 4, background: 'var(--bg-surface)', flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--fg-1)' }}>
                          {item.products?.name ?? item.product_id}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', flexShrink: 0 }}>
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.notes && (
                      <p style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic', marginTop: 4 }}>
                        &ldquo;{order.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'var(--bg-surface)', padding: '48px 16px' }
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: 600, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: 'var(--shadow-md)' }
const h1Style: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: 'var(--fg-1)' }
