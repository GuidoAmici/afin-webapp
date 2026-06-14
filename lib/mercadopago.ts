import crypto from 'node:crypto'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

export function getMpConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado')
  return new MercadoPagoConfig({ accessToken })
}

/**
 * Valida la firma `x-signature` de un webhook de Mercado Pago (HMAC-SHA256).
 *
 * Manifest (spec MP): `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 * — `data.id` en minúsculas si es alfanumérico; los segmentos sin valor se omiten.
 * La comparación es en tiempo constante. Pura: no toca red ni env.
 */
export function verifyWebhookSignature(params: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
  secret: string
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params
  if (!xSignature || !secret) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const idx = p.indexOf('=')
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()]
    }),
  ) as { ts?: string; v1?: string }

  const { ts, v1 } = parts
  if (!ts || !v1) return false

  let manifest = ''
  if (dataId) manifest += `id:${dataId.toLowerCase()};`
  if (xRequestId) manifest += `request-id:${xRequestId};`
  manifest += `ts:${ts};`

  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  // timingSafeEqual exige buffers de igual longitud
  let a: Buffer
  let b: Buffer
  try {
    a = Buffer.from(computed, 'hex')
    b = Buffer.from(v1, 'hex')
  } catch {
    return false
  }
  if (a.length === 0 || a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

/**
 * Crea una preference de Checkout Pro. El monto sale del snapshot server-side;
 * `external_reference = orderId` ata el pago al pedido para el webhook.
 */
export async function createCheckoutPreference(input: {
  orderId: string
  items: { title: string; quantity: number; unitPrice: number }[]
  backUrls: { success: string; failure: string; pending: string }
  notificationUrl: string
}) {
  const preference = new Preference(getMpConfig())
  const res = await preference.create({
    body: {
      items: input.items.map((it, i) => ({
        id: `${input.orderId}-${i}`,
        title: it.title,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        currency_id: 'ARS',
      })),
      external_reference: input.orderId,
      back_urls: input.backUrls,
      auto_return: 'approved',
      notification_url: input.notificationUrl,
    },
  })
  return { id: res.id, initPoint: res.init_point }
}

/** Consulta un pago a la API de MP. El monto SIEMPRE se lee de acá, nunca del webhook. */
export async function getPayment(paymentId: string) {
  const payment = new Payment(getMpConfig())
  return payment.get({ id: paymentId })
}
