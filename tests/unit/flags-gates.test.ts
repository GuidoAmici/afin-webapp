import { afterEach, describe, expect, test, vi } from 'vitest'

// `flag()` de flags/next necesita el contexto de un request (headers/cookies para
// los overrides), que Vitest no tiene. Acá se mockea `@/flags` con los flags en
// apagado, que es el estado de producción; la decisión por entorno la cubre
// `flags.test.ts` con la función real.
vi.mock('@/flags', () => ({
  pedidosFlag: vi.fn(async () => false),
  checkoutMpFlag: vi.fn(async () => false),
}))

import { POST as postOrders } from '@/app/api/orders/route'
import { POST as postCheckoutMp } from '@/app/api/checkout/mp/route'

afterEach(() => vi.unstubAllEnvs())

describe('puertas de servidor con el flag apagado', () => {
  test('POST /api/orders con pedidos apagado responde 404', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const res = await postOrders(new Request('http://x/api/orders', { method: 'POST', body: '{}' }))
    expect(res.status).toBe(404)
  })

  test('POST /api/checkout/mp con checkout-mp apagado responde 404', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const res = await postCheckoutMp(new Request('http://x/api/checkout/mp', { method: 'POST', body: '{}' }))
    expect(res.status).toBe(404)
  })
})
