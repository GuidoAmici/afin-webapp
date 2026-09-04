import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CartItem } from '@/lib/cart'
import { pedidos } from '@/lib/pedidos-flag'
import { checkoutMp } from '@/lib/flags'

/** Fila de `order_items` tal como se relee para poder restaurarla intacta. */
type PreviousItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: string | null
  created_at: string
}

/**
 * Aviso de WhatsApp por pedido nuevo.
 *
 * Destinatario y API key salen del entorno y van de a pares: en CallMeBot la key
 * está atada al número, así que mezclarlos no notifica a nadie. Se configuran por
 * entorno en Vercel — staging y producción avisan a teléfonos distintos.
 *
 * Sin teléfono no se envía: antes había un número hardcodeado como fallback, que
 * es la peor variante posible — un entorno mal configurado le mandaba pedidos de
 * prueba a un teléfono real.
 */
async function notifyCallMeBot(message: string) {
  const apiKey = process.env.CALLMEBOT_API_KEY
  const phone = process.env.CALLMEBOT_PHONE
  if (!apiKey || !phone) return

  // El teléfono se encodea igual que el resto: sin esto, un CALLMEBOT_PHONE con
  // '+' adelante se convierte en espacio en la query string y no llega nada.
  const url = new URL('https://api.callmebot.com/whatsapp.php')
  url.searchParams.set('phone', phone)
  url.searchParams.set('text', message)
  url.searchParams.set('apikey', apiKey)

  await fetch(url).catch(() => {}) // fallo silencioso — el pedido ya está guardado
}

export async function POST(request: Request) {
  // La puerta real del flag: ocultar el carrito no alcanza, el endpoint tiene que
  // no existir cuando el canal de pedidos está apagado en este entorno.
  if (!pedidos) {
    return NextResponse.json({ error: 'no_disponible' }, { status: 404 })
  }

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
    .select('id, notes')
    .eq('user_id', user.id)
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let orderId: string
  let wasUpdated = false
  // PENDIENTE: cuando se aplique la migración `replace_order_items`, este bloque
  // (snapshot + delete + insert + restauración) se reemplaza por una sola llamada
  // `supabase.rpc('replace_order_items', { p_order_id, p_items, p_notes })`. Hasta
  // entonces el reemplazo no es atómico y esto es lo que evita perder los ítems.
  //
  // Snapshot para poder deshacer: reemplazar los ítems es un delete + insert que
  // no es atómico desde el cliente, así que si el insert falla hay que devolver el
  // pedido a como estaba. Sin esto, un insert fallido dejaba el pedido vivo y
  // vacío, con los ítems del cliente ya borrados y sin forma de recuperarlos.
  let previousItems: PreviousItem[] = []
  const previousNotes = existingOrder?.notes ?? null

  if (existingOrder) {
    orderId = existingOrder.id
    wasUpdated = true

    const { data: snapshot, error: snapshotError } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, quantity, unit_price, created_at')
      .eq('order_id', orderId)

    if (snapshotError) {
      return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 })
    }
    previousItems = snapshot ?? []

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
    if (wasUpdated) {
      // Devolver el pedido a su estado previo: ítems y notas. Best-effort — si la
      // restauración también falla no queda nada por hacer desde acá, y por eso el
      // arreglo de fondo es `replace_order_items`, que hace todo en una transacción.
      if (previousItems.length) await supabase.from('order_items').insert(previousItems)
      await supabase.from('orders').update({ notes: previousNotes }).eq('id', orderId)
    } else {
      await supabase.from('orders').delete().eq('id', orderId)
    }
    return NextResponse.json({ error: 'Error al guardar los productos' }, { status: 500 })
  }

  // Notificación WhatsApp a Andrés
  const resumen = items.map(i => `• ${i.quantity}x ${i.productName}`).join('\n')
  const clienteNombre = [profile.nombre, profile.empresa].filter(Boolean).join(' — ')
  const emoji = wasUpdated ? '🔄' : '🛒'
  const accion = wasUpdated ? 'Pedido actualizado' : 'Pedido nuevo'
  // El link tiene que apuntar al entorno que generó el pedido: hardcodear el
  // dominio hacía que un pedido de staging mandara a producción, a un id inexistente.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
  await notifyCallMeBot(
    `${emoji} ${accion}\n${clienteNombre}\n${profile.telefono}\n\n${resumen}\n\nVer: ${origin}/empleados/pedidos/${orderId}`
  )

  // CartModal necesita este flag recién en la vista "confirmado" (para mostrar o
  // no el botón de pago) — va en la misma respuesta para no pagar un round-trip
  // extra. checkoutMp vive en lib/flags.ts (SDK): a diferencia de `pedidos`, acá
  // no cuesta ISR porque este endpoint ya era dinámico.
  return NextResponse.json({ orderId, wasUpdated, checkoutMp: await checkoutMp() })
}
