import { test, expect } from '@playwright/test';

const DASHBOARD_URL = 'file://' + process.cwd() + '/forecasts/dashboard-only.html';

test.describe('Phase 2: Dashboard-Only Page Tests', () => {

  // TEST 1: Page loads successfully
  test('dashboard-only.html - page loads without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  // TEST 2: Shared CSS is loaded
  test('dashboard - shared CSS is applied', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const bgPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );
    expect(bgPrimary).toBeTruthy();
  });

  // TEST 3: Theme toggle button exists and works
  test('dashboard - theme toggle exists and functions', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const themeToggle = page.locator('#themeToggle');
    await expect(themeToggle).toBeVisible();

    // Click to toggle theme
    await themeToggle.click();
    await page.waitForTimeout(100);

    const hasDarkTheme = await page.evaluate(() => document.body.classList.contains('dark-theme'));
    expect(hasDarkTheme).toBe(true);
  });

  // TEST 4: Header is visible
  test('dashboard - header displays correctly', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Cash Flow Dashboard');
  });

  // TEST 5: No scenario planner panel exists
  test('dashboard - scenario planner removed', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const controlPanel = page.locator('#controlPanel');
    await expect(controlPanel).toHaveCount(0);

    const showPanelBtn = page.locator('#showPanelBtn');
    await expect(showPanelBtn).toHaveCount(0);
  });

  // TEST 6: Chart canvas exists
  test('dashboard - chart canvas is present', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('#balanceChart');
    await expect(canvas).toBeVisible();
  });

  // TEST 7: Main content area exists
  test('dashboard - main content area is visible', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });

  // TEST 8: Shared modules are loaded
  test('dashboard - shared JavaScript modules loaded', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const modulesLoaded = await page.evaluate(() => {
      return {
        constants: typeof window.CONSTANTS !== 'undefined',
        dataLoader: typeof window.DataLoader !== 'undefined',
        themeManager: typeof window.themeManager !== 'undefined'
      };
    });

    expect(modulesLoaded.constants).toBe(true);
    expect(modulesLoaded.dataLoader).toBe(true);
    expect(modulesLoaded.themeManager).toBe(true);
  });

  // TEST 9: Title is correct
  test('dashboard - page title is correct', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle('Cash Flow Dashboard');
  });

  // TEST 10: Emergency banner element exists
  test('dashboard - emergency banner element exists', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const banner = page.locator('#emergencyBanner');
    await expect(banner).toHaveCount(1);
  });

});
