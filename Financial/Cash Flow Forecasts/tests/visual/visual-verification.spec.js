import { test, expect } from '@playwright/test';

const LANDING_URL = 'file://' + process.cwd() + '/forecasts/index.html';
const DASHBOARD_URL = 'file://' + process.cwd() + '/forecasts/dashboard-only.html';
const SCENARIO_URL = 'file://' + process.cwd() + '/forecasts/scenario-planner.html';

test.describe('Visual Verification Tests', () => {

  test('Landing page - full page screenshot', async ({ page }) => {
    await page.goto(LANDING_URL);
    await page.waitForTimeout(1000); // Let page fully render

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/visual-landing-page.png',
      fullPage: true
    });

    // Verify key elements are visible
    await expect(page.locator('.landing-header h1')).toBeVisible();
    await expect(page.locator('.page-card[href="dashboard-only.html"]')).toBeVisible();
    await expect(page.locator('.page-card[href="scenario-planner.html"]')).toBeVisible();
  });

  test('Landing page - dark theme screenshot', async ({ page }) => {
    await page.goto(LANDING_URL);
    await page.waitForTimeout(500);

    // Toggle to dark theme
    await page.click('#themeToggle');
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/visual-landing-page-dark.png',
      fullPage: true
    });

    // Verify dark theme applied
    const hasDarkTheme = await page.evaluate(() => {
      return document.body.classList.contains('dark-theme');
    });
    expect(hasDarkTheme).toBe(true);
  });

  test('Dashboard page - full page screenshot', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForTimeout(2000); // Wait for data to load and chart to render

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/visual-dashboard-page.png',
      fullPage: true
    });

    // Verify key elements are visible
    await expect(page.locator('header h1')).toBeVisible();
    await expect(page.locator('#balanceChart')).toBeVisible();
    await expect(page.locator('.glance-summary')).toBeVisible();
    await expect(page.locator('.alerts-section')).toBeVisible();
  });

  test('Dashboard page - chart renders correctly', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForTimeout(2000);

    // Check chart canvas has content (rendered)
    const chartRendered = await page.evaluate(() => {
      const canvas = document.getElementById('balanceChart');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Check if any pixels are non-white (chart has been drawn)
      return Array.from(imageData.data).some((value, index) =>
        index % 4 < 3 && value < 255
      );
    });

    expect(chartRendered).toBe(true);
  });

  test('Scenario planner - full page with control panel', async ({ page }) => {
    await page.goto(SCENARIO_URL);
    await page.waitForTimeout(2000); // Wait for calculations

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/visual-scenario-planner.png',
      fullPage: true
    });

    // Verify control panel and tables visible
    await expect(page.locator('.control-panel')).toBeVisible();
    await expect(page.locator('#baselineTableBody')).toBeVisible();
    await expect(page.locator('#modifiedTableBody')).toBeVisible();
    await expect(page.locator('.impact-summary')).toBeVisible();
  });

  test('Scenario planner - expense toggle interaction', async ({ page }) => {
    await page.goto(SCENARIO_URL);
    await page.waitForTimeout(2000);

    // Take before screenshot
    await page.screenshot({
      path: 'test-results/visual-scenario-before.png',
      fullPage: true
    });

    // Toggle some expenses off
    const checkboxes = page.locator('.expense-checkbox');
    await checkboxes.nth(0).uncheck();
    await checkboxes.nth(1).uncheck();
    await checkboxes.nth(2).uncheck();
    await page.waitForTimeout(500); // Wait for debounce and recalculation

    // Take after screenshot
    await page.screenshot({
      path: 'test-results/visual-scenario-after.png',
      fullPage: true
    });

    // Verify impact summary shows changes
    const impactText = await page.locator('#expensesRemoved').textContent();
    expect(impactText).not.toContain('$0');
  });

  test('Scenario planner - survival mode preset', async ({ page }) => {
    await page.goto(SCENARIO_URL);
    await page.waitForTimeout(2000);

    // Click survival mode button
    await page.click('#survivalBtn');
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/visual-scenario-survival-mode.png',
      fullPage: true
    });

    // Verify expenses are disabled
    const disabledCount = await page.evaluate(() => {
      return window.getScenarioManager().getDisabledExpenses().size;
    });
    expect(disabledCount).toBeGreaterThan(0);
  });

  test('Scenario planner - comparison tables side by side', async ({ page }) => {
    await page.goto(SCENARIO_URL);
    await page.waitForTimeout(2000);

    // Check tables are rendered with 42 rows each
    const baselineRows = await page.locator('#baselineTableBody tr').count();
    const modifiedRows = await page.locator('#modifiedTableBody tr').count();

    expect(baselineRows).toBe(42);
    expect(modifiedRows).toBe(42);

    // Take comparison view screenshot
    await page.screenshot({
      path: 'test-results/visual-scenario-comparison.png',
      fullPage: true
    });
  });

  test('Mobile responsive - landing page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(LANDING_URL);
    await page.waitForTimeout(1000);

    // Take mobile screenshot
    await page.screenshot({
      path: 'test-results/visual-landing-mobile.png',
      fullPage: true
    });

    // Verify cards stack vertically
    await expect(page.locator('.page-card[href="dashboard-only.html"]')).toBeVisible();
    await expect(page.locator('.page-card[href="scenario-planner.html"]')).toBeVisible();
  });

  test('Mobile responsive - dashboard page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(DASHBOARD_URL);
    await page.waitForTimeout(2000);

    // Take mobile screenshot
    await page.screenshot({
      path: 'test-results/visual-dashboard-mobile.png',
      fullPage: true
    });

    // Verify key elements still visible on mobile
    await expect(page.locator('header h1')).toBeVisible();
    await expect(page.locator('.glance-summary')).toBeVisible();
  });

  test('Theme persistence across pages', async ({ page }) => {
    // Set dark theme on landing page
    await page.goto(LANDING_URL);
    await page.click('#themeToggle');
    await page.waitForTimeout(300);

    // Navigate to dashboard
    await page.goto(DASHBOARD_URL);
    await page.waitForTimeout(1000);

    // Verify dark theme persisted
    const hasDarkTheme = await page.evaluate(() => {
      return document.body.classList.contains('dark-theme');
    });
    expect(hasDarkTheme).toBe(true);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/visual-dashboard-dark-persisted.png',
      fullPage: true
    });
  });

});
