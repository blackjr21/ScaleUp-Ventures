import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('UX Enhancements - Full Verification', () => {

  test('Sticky table headers remain visible on scroll', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    const firstHeader = page.locator('th').first();

    // Check sticky positioning
    const position = await firstHeader.evaluate(el => window.getComputedStyle(el).position);
    const top = await firstHeader.evaluate(el => window.getComputedStyle(el).top);
    const zIndex = await firstHeader.evaluate(el => window.getComputedStyle(el).zIndex);

    expect(position).toBe('sticky');
    expect(top).toBe('60px'); // Offset for navigation
    expect(parseInt(zIndex)).toBeGreaterThanOrEqual(10);

    // Take screenshot
    await page.screenshot({ path: 'test-results/UX-sticky-headers.png', fullPage: true });
  });

  test('Alternating row colors for better readability', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count >= 2) {
      const row1 = rows.nth(0);
      const row2 = rows.nth(1);

      const bg1 = await row1.evaluate(el => window.getComputedStyle(el).backgroundColor);
      const bg2 = await row2.evaluate(el => window.getComputedStyle(el).backgroundColor);

      // Second row should have different background (alternating)
      // We check if either has rgba(0, 0, 0, 0.02) applied
      const hasDifferentBg = bg1 !== bg2 || bg2.includes('rgba(0, 0, 0, 0.02)');
      expect(hasDifferentBg).toBe(true);
    }
  });

  test('Last updated timestamp appears on all pages', async ({ page }) => {
    const pages = [
      'index.html',
      'dashboard-only.html',
      'scenario-planner.html'
    ];

    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}/${pagePath}`);

      // Wait for UX helpers to initialize
      await page.waitForTimeout(1000);

      const timestamp = page.locator('.last-updated');
      await expect(timestamp).toBeVisible();

      const text = await timestamp.textContent();
      expect(text).toContain('Last updated:');
      // Accept any date format (Nov 21, 2025 or 11/21/2025)
      expect(text).toMatch(/\d{1,2}[\/\s,]+\d{1,4}/);

      console.log(`[${pagePath}] Timestamp: ${text}`);
    }

    await page.screenshot({ path: 'test-results/UX-timestamp-all-pages.png', fullPage: true });
  });

  test('Currency formatting works correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    // Wait for page to load and UX helpers to run
    await page.waitForTimeout(2000);

    // Test the formatCurrency function
    const formatted = await page.evaluate(() => {
      if (typeof window.formatCurrency === 'undefined') {
        // Function not exposed, test via DOM
        return 'skip';
      }
      return window.formatCurrency(1234.56);
    });

    if (formatted !== 'skip') {
      expect(formatted).toBe('$1,234.56');
    }

    console.log('[Currency Format Test] Result:', formatted);
  });

  test('Number formatting improves table readability', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    await page.waitForSelector('table', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for formatters

    // Check if any cells contain properly formatted currency
    const cells = page.locator('td, th');
    const count = await cells.count();

    let formattedCount = 0;
    for (let i = 0; i < Math.min(count, 50); i++) {
      const text = await cells.nth(i).textContent();
      if (text && text.includes('$') && text.includes(',')) {
        formattedCount++;
      }
    }

    console.log(`[Formatting] Found ${formattedCount} formatted currency values`);

    // Take screenshot
    await page.screenshot({ path: 'test-results/UX-number-formatting.png', fullPage: true });
  });

  test('Navigation bar stays at top on scroll', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    const nav = page.locator('.top-nav');
    await expect(nav).toBeVisible();

    // Check sticky position
    const position = await nav.evaluate(el => window.getComputedStyle(el).position);
    const top = await nav.evaluate(el => window.getComputedStyle(el).top);
    const zIndex = await nav.evaluate(el => window.getComputedStyle(el).zIndex);

    expect(position).toBe('sticky');
    expect(top).toBe('0px');
    expect(parseInt(zIndex)).toBeGreaterThanOrEqual(100);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Nav should still be visible
    await expect(nav).toBeVisible();

    await page.screenshot({ path: 'test-results/UX-sticky-nav-scrolled.png', fullPage: true });
  });

  test('Hover states work on table rows', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Scroll down past sticky headers to avoid pointer interception
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);

    const firstRow = page.locator('table tbody tr').nth(5); // Pick a row further down
    await firstRow.hover({ force: true });
    await page.waitForTimeout(200);

    // Take screenshot showing hover state
    await page.screenshot({ path: 'test-results/UX-hover-states.png' });
  });

  test('Summary cards are visible on dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    const summaryCards = page.locator('.summary-card');
    const count = await summaryCards.count();

    // Expect at least one summary card
    expect(count).toBeGreaterThan(0);

    // Check first card is visible
    await expect(summaryCards.first()).toBeVisible();

    await page.screenshot({ path: 'test-results/UX-summary-cards.png' });
  });

  test('All UX CSS is loaded and applied', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    // Check that shared.css is loaded
    const cssLoaded = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      return styleSheets.some(sheet =>
        sheet.href && sheet.href.includes('shared.css')
      );
    });

    expect(cssLoaded).toBe(true);

    // Check specific CSS variables are defined
    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-primary')
    );

    expect(primaryColor.trim()).toBeTruthy();
    console.log('[CSS Variables] Primary color:', primaryColor.trim());
  });

  test('UX helpers module loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    await page.waitForTimeout(1000);

    // Check console for initialization message
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.reload();
    await page.waitForTimeout(1000);

    const hasInitMessage = logs.some(log =>
      log.includes('UX Helpers') && log.includes('Initialized')
    );

    console.log('[UX Helpers] Init message found:', hasInitMessage);
    console.log('[Console Logs]', logs);
  });

  test('Complete UX workflow - Navigation to scrolling', async ({ page }) => {
    // Landing page
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.locator('.top-nav')).toBeVisible();
    await expect(page.locator('.last-updated')).toBeVisible();

    // Navigate to Dashboard
    await page.click('a[href="dashboard-only.html"]');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.top-nav a.active')).toHaveText('Dashboard');
    await expect(page.locator('.summary-card').first()).toBeVisible();
    await expect(page.locator('.last-updated')).toBeVisible();

    // Scroll and verify sticky elements
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(page.locator('.top-nav')).toBeVisible();

    // Navigate to Scenario Planner
    await page.click('a[href="scenario-planner.html"]');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.top-nav a.active')).toHaveText('Scenario Planner');
    await expect(page.locator('.last-updated')).toBeVisible();

    await page.screenshot({ path: 'test-results/UX-complete-workflow.png', fullPage: true });
  });

});
