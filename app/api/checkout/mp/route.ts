import { createClient } from '@/lib/supabase/server'
import { createCheckoutPreference } from '@/lib/mercadopago'
import { NextResponse } from 'next/server'

// Inicia el checkout con Mercado Pago: fija el monto server-side (prepare_checkout),
// crea la preference de Checkout Pro y devuelve el init_point para redirigir.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { orderId } = (await request.json()) as { orderId?: string }
  if (!orderId) return NextResponse.json({ error: 'Falta orderId' }, { status: 400 })

  // El monto lo fija la base (snapshot de precios desde products); el cliente no lo envía.
  const { data: order, error } = await supabase.rpc('prepare_checkout', {
    p_order_id: orderId,
    p_payment_method: 'mercadopago',
  })
  if (error || !order) {
    return NextResponse.json(
      { error: error?.message ?? 'No se pudo preparar el checkout' },
      { status: 400 },
    )
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('quantity, unit_price, products(name)')
    .eq('order_id', orderId)

  const prefItems = (items ?? []).map((it) => {
    const prod = it.products as unknown as { name: string } | { name: string }[] | null
    const name = Array.isArray(prod) ? prod[0]?.name : prod?.name
    return {
      title: name ?? 'Producto',
      quantity: it.quantity,
      unitPrice: Number(it.unit_price),
    }
  })

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
  try {
    const pref = await createCheckoutPreference({
      orderId,
      items: prefItems,
      backUrls: {
        success: `${origin}/cuenta/pedidos?pago=ok`,
        failure: `${origin}/cuenta/pedidos?pago=error`,
        pending: `${origin}/cuenta/pedidos?pago=pendiente`,
      },
      notificationUrl: `${origin}/api/webhooks/mp`,
    })
    return NextResponse.json({ initPoint: pref.initPoint })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error desconocido'
    console.error('checkout/mp:', msg)
    return NextResponse.json({ error: `No se pudo iniciar el pago: ${msg}` }, { status: 502 })
  }
}
