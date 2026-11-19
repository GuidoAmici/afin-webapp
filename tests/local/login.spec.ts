import { test, expect, type Page } from '@playwright/test'

// Corre contra el stack local con los usuarios de supabase/seed.sql.
const CLAVE = '123'

async function ingresar(page: Page, email: string) {
  await page.goto('/auth/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[autocomplete="current-password"]').fill(CLAVE)
  await page.locator('button[type="submit"]').click()
}

test('empleado entra por /auth/login y llega a /empleados', async ({ page }) => {
  await ingresar(page, 'empleado@test.com')
  await expect(page).not.toHaveURL(/\/auth\/login/)
  await page.goto('/empleados')
  await expect(page).toHaveURL(/\/empleados/)
})

test('cliente no entra a /empleados: termina en /', async ({ page }) => {
  await ingresar(page, 'cliente@test.com')
  await expect(page).not.toHaveURL(/\/auth\/login/)
  await page.goto('/empleados')
  await expect(page).toHaveURL(/\/$/)
})
