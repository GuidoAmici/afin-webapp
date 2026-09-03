import { createClient } from '@/lib/supabase/server'
import { createCheckoutPreference } from '@/lib/mercadopago'
import { NextResponse } from 'next/server'
import { flags } from '@/lib/flags'
import { opsFlag } from '@/lib/settings'

// Inicia el checkout con Mercado Pago: fija el monto server-side (prepare_checkout),
// crea la preference de Checkout Pro y devuelve el init_point para redirigir.
export async function POST(request: Request) {
  // Apagar el flag corta la creación de preferences — no la confirmación de los
  // pagos ya iniciados, que sigue entrando por /api/webhooks/mp.
  if (!flags.checkoutMp) {
    return NextResponse.json({ error: 'no_disponible' }, { status: 404 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Kill switch operativo: lo mueve un admin desde `settings`, sin deploy. Va
  // después del getUser() porque la policy de lectura exige sesión. A diferencia
  // del flag de release, esto no es "la feature no existe" sino "los cobros están
  // pausados ahora" — de ahí el 503 y no un 404.
  if (!(await opsFlag('payments_enabled'))) {
    return NextResponse.json({ error: 'cobros_pausados' }, { status: 503 })
  }

  const { orderId } = (await request.json()) as { orderId?: string }
  if (!orderId) return NextResponse.json({ error: 'Falta orderId' }, { status: 400 })

  // El monto lo fija la base (snapshot de precios desde products); el cliente no lo envía.
  const { data: order, error } = await supabase.rpc('prepare_checkout', {
    p_order_id: orderId,
    p_payment_method: 'mercadopago',
  })
  if (error || !order) {
    console.error('checkout/mp prepare_checkout:', error?.message ?? 'sin orden')
    return NextResponse.json({ error: 'No se pudo iniciar el pago' }, { status: 400 })
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
    return NextResponse.json({ error: 'No se pudo iniciar el pago' }, { status: 502 })
  }
}
