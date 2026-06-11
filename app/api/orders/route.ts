import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CartItem } from '@/lib/cart'

async function notifyCallMeBot(message: string) {
  const apiKey = process.env.CALLMEBOT_API_KEY
  const phone = process.env.CALLMEBOT_PHONE ?? '5491122521639'
  if (!apiKey) return

  const encoded = encodeURIComponent(message)
  await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`)
    .catch(() => {}) // fallo silencioso — el pedido ya está guardado
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { items, notes }: { items: CartItem[]; notes?: string } = await request.json()

  if (!items?.length) return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })

  // Verificar perfil completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, empresa, telefono, direccion, localidad')
    .eq('id', user.id)
    .single()

  if (!profile?.telefono || !profile?.direccion || !profile?.localidad) {
    return NextResponse.json({ error: 'perfil_incompleto' }, { status: 422 })
  }

  // Crear pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: user.id, notes: notes ?? null })
    .select('id')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 })
  }

  // Insertar items
  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice ?? null,
    }))
  )

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Error al guardar los productos' }, { status: 500 })
  }

  // Notificación WhatsApp a Andrés
  const resumen = items.map(i => `• ${i.quantity}x ${i.productName}`).join('\n')
  const clienteNombre = [profile.nombre, profile.empresa].filter(Boolean).join(' — ')
  await notifyCallMeBot(
    `🛒 Pedido nuevo\n${clienteNombre}\n${profile.telefono}\n\n${resumen}\n\nVer: afinsrl.com.ar/empleados/pedidos/${order.id}`
  )

  return NextResponse.json({ orderId: order.id })
}
