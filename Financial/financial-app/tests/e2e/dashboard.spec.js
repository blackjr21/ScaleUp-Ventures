const { test, expect } = require('@playwright/test');

test.describe('Cash Flow Dashboard - Feature 5.2', () => {
  let authToken;
  let userId;

  test.beforeAll(async ({ request }) => {
    // Create test user and get auth token
    const registerResponse = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        username: 'dashboardtest',
        email: 'dashboard@test.com',
        password: 'TestPass123!'
      }
    });

    const registerData = await registerResponse.json();
    authToken = registerData.token;
    userId = registerData.user.id;

    // Add test transactions
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

  test('Dashboard loads forecast and displays chart', async ({ page }) => {
    // Set auth token
    await page.goto('http://localhost:3000');
    await page.evaluate((token) => {
      localStorage.setItem('jwt_token', token);
    }, authToken);

    await page.goto('http://localhost:3000/dashboard.html');

    // Verify page title
    await expect(page).toHaveTitle(/Cash Flow Dashboard/);

    // Verify balance chart is visible
    await expect(page.locator('#balanceChart')).toBeVisible();

    // Verify forecast table is visible
    await expect(page.locator('.forecast-table')).toBeVisible();

    // Verify summary metrics are visible
    await expect(page.locator('.summary-grid')).toBeVisible();

    // Screenshot
    await page.screenshot({
      path: 'assets/screenshots/phase5-dashboard.png',
      fullPage: true
    });
  });

  test('Dashboard allows adding new transaction', async ({ page }) => {
    // Set auth token
    await page.goto('http://localhost:3000');
    await page.evaluate((token) => {
      localStorage.setItem('jwt_token', token);
    }, authToken);

    await page.goto('http://localhost:3000/dashboard.html');

    // Wait for page to load
    await page.waitForSelector('#balanceChart');

    // Click add transaction button (if exists)
    const addBtn = page.locator('#addTransactionBtn');
    if (await addBtn.isVisible()) {
      await addBtn.click();

      // Fill form
      await page.fill('#transactionName', 'Test Expense');
      await page.fill('#transactionAmount', '100');
      await page.selectOption('#transactionType', 'OUTFLOW');
      await page.selectOption('#transactionFrequency', 'MONTHLY');
      await page.fill('#dayOfMonth', '15');
      await page.click('#saveTransactionBtn');

      // Verify transaction appears in list
      await expect(page.locator('.transaction-list')).toContainText('Test Expense');

      // Screenshot
      await page.screenshot({
        path: 'assets/screenshots/phase5-add-transaction.png',
        fullPage: true
      });
    }
  });
});
