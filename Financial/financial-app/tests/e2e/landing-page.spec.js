const { test, expect } = require('@playwright/test');

test.describe('Landing Page - Feature 5.1', () => {
  let authToken;
  let userId;

  test.beforeAll(async ({ request }) => {
    // Create test user and get auth token
    const registerResponse = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        username: 'landingtest',
        email: 'landing@test.com',
        password: 'TestPass123!'
      }
    });

    const registerData = await registerResponse.json();
    authToken = registerData.token;
    userId = registerData.user.id;

    // Add some test transactions to generate meaningful overview metrics
    await request.post('http://localhost:3000/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'Test Salary',
        amount: 5000,
        type: 'INFLOW',
        frequency: 'BIWEEKLY',
        anchorDate: '2025-11-22',
        isActive: true
      }
    });

    await request.post('http://localhost:3000/api/transactions', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'Test Rent',
        amount: 1500,
        type: 'OUTFLOW',
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        isActive: true
      }
    });
  });

  test('Landing page displays overview metrics', async ({ page }) => {
    // Set auth token in localStorage
    await page.goto('http://localhost:3000');
    await page.evaluate((token) => {
      localStorage.setItem('jwt_token', token);
    }, authToken);

    // Navigate to landing page
    await page.goto('http://localhost:3000');

    // Verify page title
    await expect(page).toHaveTitle(/Financial App/);

    // Verify hero section
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-section h1')).toContainText('Financial');

    // Verify overview metrics cards are visible
    await expect(page.locator('.overview-metrics')).toBeVisible();

    // Verify current balance card exists (may be loading initially)
    await expect(page.locator('.metric-card.current-balance')).toBeVisible();

    // Verify scenarios count card
    await expect(page.locator('.metric-card.scenarios-count')).toBeVisible();

    // Verify total debt card
    await expect(page.locator('.metric-card.total-debt')).toBeVisible();

    // Verify next bill card
    await expect(page.locator('.metric-card.next-bill')).toBeVisible();

    // Verify quick actions section
    await expect(page.locator('.quick-actions')).toBeVisible();
    await expect(page.locator('a[href="dashboard.html"]')).toBeVisible();
    await expect(page.locator('a[href="scenario-planner.html"]')).toBeVisible();
    await expect(page.locator('a[href="debt-payoff.html"]')).toBeVisible();

    // Verify theme toggle button exists
    await expect(page.locator('#themeToggle')).toBeVisible();

    // Screenshot
    await page.screenshot({
      path: 'assets/screenshots/phase5-landing-page.png',
      fullPage: true
    });
  });

  test('Landing page redirects to login if no token', async ({ page }) => {
    // Clear any existing token
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.removeItem('jwt_token');
    });

    // Try to access landing page
    await page.goto('http://localhost:3000');

    // Should redirect to login page
    await expect(page).toHaveURL(/login\.html/);
  });

  test('Quick action buttons navigate correctly', async ({ page }) => {
    // Set auth token
    await page.goto('http://localhost:3000');
    await page.evaluate((token) => {
      localStorage.setItem('jwt_token', token);
    }, authToken);

    await page.goto('http://localhost:3000');

    // Test dashboard link
    const dashboardLink = page.locator('a[href="dashboard.html"]');
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute('href', 'dashboard.html');

    // Test scenario planner link
    const scenarioLink = page.locator('a[href="scenario-planner.html"]');
    await expect(scenarioLink).toBeVisible();
    await expect(scenarioLink).toHaveAttribute('href', 'scenario-planner.html');

    // Test debt payoff link
    const debtLink = page.locator('a[href="debt-payoff.html"]');
    await expect(debtLink).toBeVisible();
    await expect(debtLink).toHaveAttribute('href', 'debt-payoff.html');
  });

  test.afterAll(async ({ request }) => {
    // Cleanup: Delete test user
    // Note: This would require a DELETE /api/users/:id endpoint
    // For now, we'll leave the test user in the database
  });
});
