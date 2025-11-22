const { test, expect } = require('@playwright/test');

test.describe('Other Pages - Features 5.3, 5.4', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    const registerResponse = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        username: 'otherpagestest',
        email: 'otherpages@test.com',
        password: 'TestPass123!'
      }
    });
    const registerData = await registerResponse.json();
    authToken = registerData.token;
  });

  test('Scenario planner page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate((token) => localStorage.setItem('jwt_token', token), authToken);
    await page.goto('http://localhost:3000/scenario-planner.html');
    await expect(page).toHaveTitle(/Scenario/);
    await page.screenshot({ path: 'assets/screenshots/phase5-scenario-planner.png', fullPage: true });
  });

  test('Debt payoff page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate((token) => localStorage.setItem('jwt_token', token), authToken);
    await page.goto('http://localhost:3000/debt-payoff.html');
    await expect(page).toHaveTitle(/Debt/);
    await page.screenshot({ path: 'assets/screenshots/phase5-debt-payoff.png', fullPage: true });
  });
});
