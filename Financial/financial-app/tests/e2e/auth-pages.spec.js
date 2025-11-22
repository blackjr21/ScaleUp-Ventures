const { test, expect } = require('@playwright/test');

test.describe('Auth Pages - Features 5.5', () => {
  test('Register page works', async ({ page }) => {
    await page.goto('http://localhost:3000/register.html');
    await expect(page).toHaveTitle(/Register/);
    await expect(page.locator('#registerForm')).toBeVisible();
    await page.screenshot({ path: 'assets/screenshots/phase5-register.png', fullPage: true });
  });

  test('Login page works', async ({ page }) => {
    await page.goto('http://localhost:3000/login.html');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('#loginForm')).toBeVisible();
    await page.screenshot({ path: 'assets/screenshots/phase5-login.png', fullPage: true });
  });
});
