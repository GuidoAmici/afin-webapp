import { test, expect } from '@playwright/test'

test('/empleados redirige a login si no hay sesión', async ({ page }) => {
  await page.goto('/empleados')
  expect(new URL(page.url()).pathname).toBe('/auth/login')
})

// TODO: tests de roles requieren usuarios de prueba con app_metadata.role configurado.
