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
  await page.getByLabel('Filtrar por categoría').getByRole('button', { name: /frascos completos/i }).click()
  await page.getByLabel('Filtrar por categoría').getByRole('button', { name: /10.*20 ml/i }).click()
  await expect(page.getByText('4 productos encontrados')).toBeVisible()
})

test('página de contacto muestra datos de la empresa y formulario de newsletter', async ({ page }) => {
  await page.goto('/contacto')
  const main = page.locator('#main-content')
  await expect(main.getByLabel('Tu correo electrónico')).toBeVisible()
  await expect(main.getByRole('button', { name: /suscribirme/i })).toBeVisible()
})

test('carrito vacío muestra botón "Ver productos" en mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: /ver carrito/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Carrito' })
  await expect(dialog.getByRole('link', { name: /ver productos/i })).toBeVisible()
})
