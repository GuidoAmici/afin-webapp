import { test, expect } from '@playwright/test'

test('POST /api/orders rechaza solicitudes no autenticadas', async ({ request }) => {
  const res = await request.post('/api/orders', {
    data: {
      items: [{ productId: 'test-id', productName: 'Test', image: '', quantity: 1, unitPrice: '0.01' }],
    },
  })
  expect(res.status()).toBe(401)
})

// TODO: test de inyección completo requiere usuario de prueba con perfil completo + producto conocido.
