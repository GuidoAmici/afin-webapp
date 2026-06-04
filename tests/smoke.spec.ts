import { test, expect } from '@playwright/test'

const pages = [
  { path: '/',               title: /afin/i },
  { path: '/quienes-somos', title: /afin/i },
  { path: '/productos',      title: /afin/i },
  { path: '/blog',           title: /afin/i },
  { path: '/contacto',       title: /afin/i },
]

for (const { path, title } of pages) {
  test(`${path} carga correctamente`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(title)
  })
}

test('navegación principal es visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()
  await expect(page.locator('footer')).toBeVisible()
})

test('filtro de productos funciona', async ({ page }) => {
  await page.goto('/productos')
  await page.getByLabel('Filtrar por categoría').getByRole('button', { name: /frascos/i }).click()
  await expect(page.getByText('4 productos encontrados')).toBeVisible()
})

test('formulario de contacto muestra éxito', async ({ page }) => {
  await page.goto('/contacto')
  await page.fill('#nombre', 'Test')
  await page.fill('#email', 'test@test.com')
  await page.fill('#mensaje', 'Consulta de prueba')
  await page.click('button[type="submit"]')
  await expect(page.getByText('¡Consulta enviada!')).toBeVisible()
})
