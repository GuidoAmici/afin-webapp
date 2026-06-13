import { test, expect } from '@playwright/test'

test('/empleados redirige a login si no hay sesión', async ({ page }) => {
  await page.goto('/empleados')
  expect(new URL(page.url()).pathname).toBe('/auth/login')
})

// TODO: tests de roles requieren usuarios de prueba con app_metadata.role configurado.
test.todo('usuario con role=admin accede a /empleados sin redirección')
test.todo('usuario con role=cliente es redirigido a / desde /empleados')
