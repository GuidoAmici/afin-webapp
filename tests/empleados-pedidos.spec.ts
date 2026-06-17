import { test, expect } from '@playwright/test'

// La cola de corroboración y la diferencia de acciones por rol requieren usuarios
// de prueba con app_metadata.role (empleado/admin) y pedidos sembrados. Igual que
// proxy-guard.spec.ts, quedan pendientes de fixtures; la lógica de gating por rol
// ya está cubierta determinísticamente en lib/order-transitions.test.ts, y la
// autorización real en pgTAP sobre transition_order.

test('cola "Pago en revisión" lista los pedidos en_revision a corroborar', async () => {
  test.skip(true, 'Pending test fixtures (usuario staff + pedidos en_revision)')
})

test('un empleado ve solo transiciones protocolares; un admin ve además forzar', async () => {
  test.skip(true, 'Pending test fixtures (usuarios empleado y admin)')
})

test('un empleado no puede forzar una transición aunque manipule el frontend', async () => {
  test.skip(true, 'Pending test fixtures — verificado por transition_order (pgTAP)')
})

test('redirección de no-autenticado se mantiene en el detalle del pedido', async ({ page }) => {
  await page.goto('/empleados/pedidos/00000000-0000-0000-0000-000000000000')
  expect(new URL(page.url()).pathname).toBe('/auth/login')
})
