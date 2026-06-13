import { test, expect } from '@playwright/test'

test('/empleados redirige a login si no hay sesión', async ({ page }) => {
  await page.goto('/empleados')
  expect(new URL(page.url()).pathname).toBe('/auth/login')
})

// Los siguientes tests requieren usuarios de prueba con roles en app_metadata.
test.todo('usuario con role=admin accede a /empleados sin redirección')
test.todo('usuario con role=cliente es redirigido a / desde /empleados')
