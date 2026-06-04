import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', title: /afin/i },
  { path: '/quienes-somos.html', title: /afin/i },
  { path: '/productos.html', title: /afin/i },
  { path: '/blog.html', title: /afin/i },
  { path: '/contacto.html', title: /afin/i },
];

for (const { path, title } of pages) {
  test(`${path} carga correctamente`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(title);
  });
}

test('navegación principal funciona', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav, header')).toBeVisible();
});
