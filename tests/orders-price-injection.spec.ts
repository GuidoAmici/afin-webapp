import { test, expect } from '@playwright/test'

test('POST /api/orders rechaza solicitudes no autenticadas', async ({ request }) => {
  const res = await request.post('/api/orders', {
    data: {
      items: [{ productId: 'test-id', productName: 'Test', image: '', quantity: 1, unitPrice: '0.01' }],
    },
  })
  expect(res.status()).toBe(401)
})

// Full injection test requires a test user with a complete profile + a known product.
// Until test-user fixtures are set up, this documents the intent.
test.todo('unitPrice inyectado en el body no se persiste — el precio viene del catálogo server-side')
