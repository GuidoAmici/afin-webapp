import { test, expect } from '@playwright/test'

test('/empleados redirige a login si no hay sesión', async ({ page }) => {
  await page.goto('/empleados')
  expect(new URL(page.url()).pathname).toBe('/auth/login')
})

// TODO: requieren usuarios de prueba con app_metadata.role configurado.
test('usuario con role=admin accede a /empleados sin redirección', async () => {
  test.skip(true, 'Pending test fixtures')
})
test('usuario con role=cliente es redirigido a / desde /empleados', async () => {
  test.skip(true, 'Pending test fixtures')
})
