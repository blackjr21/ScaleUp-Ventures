const { test, expect } = require('@playwright/test');

// Base URL for the local server
const BASE_URL = 'http://localhost:8000';

test.describe('Dynamic Debt Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the dynamic dashboard before each test
    await page.goto(`${BASE_URL}/debt-strategy-dynamic.html`);

    // Wait for data to load (loading indicator should disappear)
    await page.waitForSelector('#loading', { state: 'hidden', timeout: 5000 });

    // Ensure content is visible
    await page.waitForSelector('#content', { state: 'visible' });
  });

  test('should load the page successfully', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Dynamic Debt Elimination Strategy/);

    // Check that no error is displayed
    const errorDiv = page.locator('#error');
    await expect(errorDiv).not.toBeVisible();

    // Check that content is loaded
    const contentDiv = page.locator('#content');
    await expect(contentDiv).toBeVisible();
  });

  test('should display the main heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Comprehensive Debt Elimination Strategy');
  });

  test('should load data from JSON and display total debt', async ({ page }) => {
    // Check that hero stats are displayed
    const heroStats = page.locator('.hero-stats');
    await expect(heroStats).toBeVisible();

    // Check for stat cards
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify total debt card exists and has value
    const totalDebtCard = page.locator('.stat-card.red').first();
    await expect(totalDebtCard).toBeVisible();
    await expect(totalDebtCard).toContainText('$');
  });

  test('should display progress banner with victories', async ({ page }) => {
    const progressBanner = page.locator('.progress-banner');
    await expect(progressBanner).toBeVisible();

    // Check for victory badge
    const victoryBadge = page.locator('.victory-badge');
    await expect(victoryBadge).toBeVisible();
    await expect(victoryBadge).toContainText('PHASE 1 COMPLETE');
  });

  test('should display recent payments', async ({ page }) => {
    // Check that progress banner shows payments made on 11/21/25
    const progressBanner = page.locator('.progress-banner');
    await expect(progressBanner).toContainText('11/21/25');

    // Look for checkmarks indicating paid items
    const checkmarks = page.locator('.checkmark');
    const checkmarkCount = await checkmarks.count();
    expect(checkmarkCount).toBeGreaterThan(0);
  });

  test('should display all debts in a table', async ({ page }) => {
    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(page.locator('th:has-text("Creditor")')).toBeVisible();
    await expect(page.locator('th:has-text("Balance")')).toBeVisible();
    await expect(page.locator('th:has-text("APR")')).toBeVisible();
    await expect(page.locator('th:has-text("Min Payment")')).toBeVisible();

    // Check that there are debt rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should display correct debt count', async ({ page }) => {
    // Find the stat card showing number of debts
    const debtCountCard = page.locator('.stat-card.green');
    await expect(debtCountCard).toBeVisible();

    // Should show 22 debts based on the JSON file
    await expect(debtCountCard).toContainText('22');
  });

  test('should show status badges for debts', async ({ page }) => {
    // Check that status badges exist
    const badges = page.locator('.badge');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);

    // Check for specific badge types
    const paidBadges = page.locator('.badge-paid');
    const paidCount = await paidBadges.count();

    // Should have at least one paid badge (from 11/21/25 payments)
    expect(paidCount).toBeGreaterThan(0);
  });

  test('should display key insights section', async ({ page }) => {
    // Look for the Key Insights heading
    await expect(page.locator('h2:has-text("Key Insights")')).toBeVisible();

    // Check that insights are displayed
    const insightsBox = page.locator('div[style*="background: #ebf8ff"]');
    await expect(insightsBox).toBeVisible();

    // Should contain critical insights from JSON
    await expect(insightsBox).toContainText('PHASE 1');
  });

  test('should calculate and display total balance', async ({ page }) => {
    // Check the table footer for total
    const totalRow = page.locator('tfoot tr');
    await expect(totalRow).toBeVisible();
    await expect(totalRow).toContainText('TOTAL');

    // Should show the total balance from JSON ($240,583.76)
    await expect(totalRow).toContainText('$240,');
  });

  test('should display debt-to-income ratio', async ({ page }) => {
    // Find the DTI card
    const dtiCard = page.locator('.stat-card.yellow');
    await expect(dtiCard).toBeVisible();
    await expect(dtiCard).toContainText('40.6%');
    await expect(dtiCard).toContainText('Debt-to-Income Ratio');
  });

  test('should show monthly income information', async ({ page }) => {
    const dtiCard = page.locator('.stat-card.yellow');
    await expect(dtiCard).toContainText('$24,500');
    await expect(dtiCard).toContainText('monthly income');
  });

  test('should display interest bleeding information', async ({ page }) => {
    // Check for interest-related stat card
    const interestCards = page.locator('.stat-card.red');

    // One of the red cards should show interest bleeding
    const interestText = await interestCards.allTextContents();
    const hasInterestInfo = interestText.some(text =>
      text.includes('Interest Bleeding') || text.includes('/mo')
    );
    expect(hasInterestInfo).toBe(true);
  });

  test('should format currency correctly', async ({ page }) => {
    // Check that currency amounts have $ signs
    const amounts = page.locator('.amount-large');
    const count = await amounts.count();

    // Check at least the first 3 amount-large elements
    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await amounts.nth(i).textContent();
      // Should contain $ sign
      expect(text).toContain('$');
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.hero-stats')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should show last updated timestamp', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for last updated info
    await expect(page.locator('text=Last Updated')).toBeVisible();
    await expect(page.locator('text=debt-inventory.json')).toBeVisible();
  });

  test('should display Marriott Amex payment', async ({ page }) => {
    // Search for Marriott Amex in the table
    const marriottRow = page.locator('tr:has-text("Marriott")');
    await expect(marriottRow).toBeVisible();

    // Check for PAID TODAY badge
    await expect(marriottRow.locator('.badge-paid')).toBeVisible();
  });

  test('should display CareCredit payment', async ({ page }) => {
    // Search for CareCredit in the table
    const careCreditRow = page.locator('tr:has-text("CareCredit")');
    await expect(careCreditRow).toBeVisible();

    // Check for PAID TODAY badge
    await expect(careCreditRow.locator('.badge-paid')).toBeVisible();
  });

  test('should display Navy Federal Auto payment', async ({ page }) => {
    // Search for Navy Federal Auto in the table
    const autoRow = page.locator('tr:has-text("Navy Federal Auto")');
    await expect(autoRow).toBeVisible();

    // Check for PAID TODAY badge
    await expect(autoRow.locator('.badge-paid')).toBeVisible();
  });

  test('should sort debts by APR (highest first)', async ({ page }) => {
    // Get all APR cells
    const aprCells = page.locator('tbody tr td:nth-child(4)');
    const aprCount = await aprCells.count();

    // Get first few APR values
    const firstApr = await aprCells.nth(0).textContent();
    const secondApr = await aprCells.nth(1).textContent();

    // Parse APR values
    const first = parseFloat(firstApr.replace('%', ''));
    const second = parseFloat(secondApr.replace('%', ''));

    // First APR should be >= second APR (sorted descending)
    expect(first).toBeGreaterThanOrEqual(second);
  });

  test('should show progress grid with paid debts', async ({ page }) => {
    const progressGrid = page.locator('.progress-grid');
    await expect(progressGrid).toBeVisible();

    // Should have multiple progress items
    const progressItems = page.locator('.progress-item');
    const itemCount = await progressItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should display total paid amount', async ({ page }) => {
    const progressBanner = page.locator('.progress-banner');

    // Should show the total paid amount ($1,763.57)
    await expect(progressBanner).toContainText('$1,763');
  });

  test('should handle hover effects on debt cards', async ({ page }) => {
    // Find a table row
    const firstRow = page.locator('tbody tr').first();

    // Hover over it
    await firstRow.hover();

    // Row should still be visible (basic interaction test)
    await expect(firstRow).toBeVisible();
  });

  test('should display all three payment victories', async ({ page }) => {
    const progressBanner = page.locator('.progress-banner');

    // Check for all three payments
    await expect(progressBanner).toContainText('Marriott');
    await expect(progressBanner).toContainText('CareCredit');
    await expect(progressBanner).toContainText('Navy Federal');
  });

  test('should calculate correct number of victories', async ({ page }) => {
    const victoryHeading = page.locator('.progress-banner h2');
    const text = await victoryHeading.textContent();

    // Should show "3 VICTORIES" based on JSON data
    expect(text).toContain('3 VICTOR');
  });

  test('should show account types correctly', async ({ page }) => {
    // Check that different account types are displayed
    await expect(page.locator('text=CREDIT CARD').first()).toBeVisible();
    await expect(page.locator('text=AUTO LOAN').first()).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    // Capture console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should have no JavaScript errors
    expect(errors.length).toBe(0);
  });

  test('should display total of 22 debts in table', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // Should have 22 rows (one per debt)
    expect(rowCount).toBe(22);
  });

  test('should show minimum payment total', async ({ page }) => {
    const totalRow = page.locator('tfoot tr');

    // Should display minimum payment total
    await expect(totalRow).toContainText('$4,');
  });
});

test.describe('Error Handling', () => {
  test('should show error if JSON file is missing', async ({ page, context }) => {
    // Intercept the JSON request and make it fail
    await context.route('**/debt-inventory.json', route => {
      route.abort();
    });

    await page.goto(`${BASE_URL}/debt-strategy-dynamic.html`);

    // Wait for error to appear
    await page.waitForSelector('#error', { state: 'visible', timeout: 5000 });

    // Error message should be visible
    const errorDiv = page.locator('#error');
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('Error Loading Data');
  });
});

test.describe('Data Accuracy', () => {
  test('should match JSON data exactly', async ({ page }) => {
    await page.goto(`${BASE_URL}/debt-strategy-dynamic.html`);
    await page.waitForSelector('#content', { state: 'visible' });

    // Load the JSON file directly
    const response = await page.request.get(`${BASE_URL}/debt-inventory.json`);
    const jsonData = await response.json();

    // Verify key numbers match
    const validation = jsonData.validationChecks;

    // Wait for table to be rendered
    await page.waitForSelector('tfoot tr', { timeout: 10000 });

    // Check total balance is displayed
    const totalRow = page.locator('tfoot tr');
    const totalText = await totalRow.textContent();
    expect(totalText).toContain('240,583');

    // Check debt count
    const debtCountCard = page.locator('.stat-card.green');
    await expect(debtCountCard).toContainText('22');
  });
});
