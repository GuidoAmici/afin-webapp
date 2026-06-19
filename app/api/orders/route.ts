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
    .select('nombre, empresa, telefono, direccion, localidad, cuit, dni, tipo_facturacion')
    .eq('id', user.id)
    .single()

  const tipo = (profile?.tipo_facturacion ?? 'personal') as 'personal' | 'empresa'
  const contactoOk = profile?.telefono && profile?.direccion && profile?.localidad
  const factOk = tipo === 'empresa' ? (profile?.empresa && profile?.cuit) : profile?.dni
  if (!contactoOk || !factOk) {
    return NextResponse.json({ error: 'perfil_incompleto' }, { status: 422 })
  }

  // Buscar pedido pendiente existente (status = 'pendiente', ver ADR-005 / fase2)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let orderId: string
  let wasUpdated = false

  if (existingOrder) {
    orderId = existingOrder.id
    wasUpdated = true

    // Reemplazar ítems del pedido existente
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)

    if (deleteError) {
      return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 })
    }

    await supabase
      .from('orders')
      .update({ notes: notes ?? null })
      .eq('id', orderId)
  } else {
    // Crear pedido nuevo
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: user.id, notes: notes ?? null })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('[orders] insert orders falló:', orderError)
      return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 })
    }
    orderId = order.id
  }

  // Resolve prices server-side — never trust client-supplied unitPrice
  const productIds = items.map(i => i.productId)
  const { data: prices } = await supabase
    .from('products')
    .select('id, price_retail, price_wholesale')
    .in('id', productIds)
  const priceMap = new Map(
    (prices ?? []).map(p => [p.id, p.price_retail ?? p.price_wholesale ?? null])
  )

  // Insertar ítems
  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: priceMap.get(item.productId) ?? null,
    }))
  )

  if (itemsError) {
    if (!wasUpdated) await supabase.from('orders').delete().eq('id', orderId)
    return NextResponse.json({ error: 'Error al guardar los productos' }, { status: 500 })
  }

  // Notificación WhatsApp a Andrés
  const resumen = items.map(i => `• ${i.quantity}x ${i.productName}`).join('\n')
  const clienteNombre = [profile.nombre, profile.empresa].filter(Boolean).join(' — ')
  const emoji = wasUpdated ? '🔄' : '🛒'
  const accion = wasUpdated ? 'Pedido actualizado' : 'Pedido nuevo'
  await notifyCallMeBot(
    `${emoji} ${accion}\n${clienteNombre}\n${profile.telefono}\n\n${resumen}\n\nVer: afinsrl.com.ar/empleados/pedidos/${orderId}`
  )

  return NextResponse.json({ orderId, wasUpdated })
}
