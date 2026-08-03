import { NextResponse } from 'next/server'
import { verifyWebhookSignature, getPayment } from '@/lib/mercadopago'
import { createServiceClient } from '@/lib/supabase/service'

// Deliberadamente NO va detrás de `flags.checkoutMp`: si se apaga el checkout con
// pagos en vuelo, esos pagos igual tienen que poder confirmarse. La ruta ya está
// protegida por firma HMAC y es idempotente (ver ADR-0005).
//
// Webhook de Mercado Pago (público, server-only). Invariantes (ADR fase 2):
// 1) valida la firma x-signature; 2) NUNCA toma el monto del payload — lo consulta
// a la API de MP; 3) idempotente vía provider_payment_id único; 4) recién entonces
// transiciona payment_status → pagado vía transition_order_system (service_role).
export async function POST(request: Request) {
  const url = new URL(request.url)
  const dataId = url.searchParams.get('data.id')
  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? ''

  if (!verifyWebhookSignature({ xSignature, xRequestId, dataId, secret })) {
    return NextResponse.json({ error: 'firma inválida' }, { status: 401 })
  }

  let body: { type?: string; data?: { id?: string | number } } = {}
  try {
    body = await request.json()
  } catch {
    /* algunas notificaciones vienen solo por query string */
  }
  const type = body.type ?? url.searchParams.get('type')
  const paymentId = body.data?.id ?? dataId
  if (type !== 'payment' || !paymentId) {
    return NextResponse.json({ received: true }) // otros eventos: ack y salir
  }

  // Consultar el pago a la API de MP (fuente de verdad del monto y estado).
  const payment = await getPayment(String(paymentId))
  const orderId = payment.external_reference
  const amount = payment.transaction_amount
  const providerPaymentId = String(payment.id)
  if (!orderId) return NextResponse.json({ error: 'sin external_reference' }, { status: 400 })

  const supabase = createServiceClient()

  // Idempotencia: si ya registramos este provider_payment_id, no reprocesar.
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('provider_payment_id', providerPaymentId)
    .maybeSingle()
  if (existing) return NextResponse.json({ received: true, idempotent: true })

  if (payment.status !== 'approved') {
    return NextResponse.json({ received: true, status: payment.status })
  }

  // Verificar el monto contra el total del pedido (no contra el payload).
  const { data: order } = await supabase
    .from('orders')
    .select('id, total')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return NextResponse.json({ error: 'pedido no encontrado' }, { status: 404 })
  if (amount == null || Math.abs(Number(order.total) - Number(amount)) > 0.01) {
    return NextResponse.json({ error: 'el monto no coincide' }, { status: 400 })
  }

  // Registrar el pago. El UNIQUE en provider_payment_id cierra la carrera.
  const { error: payErr } = await supabase.from('payments').insert({
    order_id: orderId,
    provider_payment_id: providerPaymentId,
    amount,
    payment_method: 'mercadopago',
    payment_date: new Date().toISOString(),
  })
  if (payErr) return NextResponse.json({ received: true, idempotent: true })

  // Transicionar a pagado como actor sistema.
  const { error: txErr } = await supabase.rpc('transition_order_system', {
    p_order_id: orderId,
    p_axis: 'payment_status',
    p_to: 'pagado',
    p_actor_role: 'mercadopago',
    p_metadata: { provider_payment_id: providerPaymentId, amount },
  })
  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })

  return NextResponse.json({ received: true, paid: true })
}
