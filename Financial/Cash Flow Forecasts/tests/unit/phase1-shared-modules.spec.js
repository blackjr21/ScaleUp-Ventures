import { test, expect } from '@playwright/test';

const TEST_HARNESS_URL = 'file://' + process.cwd() + '/forecasts/test-harness.html';

test.describe('Phase 1: Shared Modules - Unit Tests', () => {

  // TEST 1: shared.css - CSS variables are defined
  test('shared.css - CSS variables are defined', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    // Check light theme CSS variables
    const bgPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );
    expect(bgPrimary).toBe('#ffffff');

    const accentPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()
    );
    expect(accentPrimary).toBe('#667eea');
  });

  // TEST 2: shared.css - dark theme CSS variables apply correctly
  test('shared.css - dark theme CSS variables apply correctly', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    // Add dark-theme class
    await page.evaluate(() => document.body.classList.add('dark-theme'));

    // Check that body has dark-theme class applied
    const hasClass = await page.evaluate(() => document.body.classList.contains('dark-theme'));
    expect(hasClass).toBe(true);

    // Dark theme variables are applied via body.dark-theme in CSS
    const bgPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );
    expect(bgPrimary).toBe('#0f172a');

    const textPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
    );
    expect(textPrimary).toBe('#f1f5f9');
  });

  // TEST 3: Button styles from shared.css work
  test('shared.css - button styles render correctly', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const button = page.locator('.btn-primary');
    await expect(button).toBeVisible();

    const bgColor = await button.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBeTruthy();

    const padding = await button.evaluate(el =>
      window.getComputedStyle(el).padding
    );
    expect(padding).toBeTruthy();
  });

  // TEST 4: ThemeManager initializes with light theme by default
  test('theme-manager.js - initializes with light theme by default', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(() => window.testReady);

    // Should NOT have dark-theme class
    const hasDarkTheme = await page.evaluate(() => document.body.classList.contains('dark-theme'));
    expect(hasDarkTheme).toBe(false);

    // Button should show moon (for switching to dark)
    const btnText = await page.locator('#themeToggle').textContent();
    expect(btnText).toBe('🌙');
  });

  // TEST 5: ThemeManager toggles theme on button click
  test('theme-manager.js - toggles theme on button click', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(() => window.testReady);

    // Click toggle
    await page.click('#themeToggle');

    // Should have dark-theme class
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark-theme');

    // Button should show sun
    const btnText = await page.locator('#themeToggle').textContent();
    expect(btnText).toBe('☀️');
  });

  // TEST 6: ThemeManager persists theme to localStorage
  test('theme-manager.js - persists theme to localStorage', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(() => window.testReady);

    // Toggle to dark
    await page.click('#themeToggle');

    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('cashflow-theme'));
    expect(storedTheme).toBe('dark');

    // Reload page
    await page.reload();
    await page.waitForFunction(() => window.testReady);

    // Should still be dark
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark-theme');
  });

  // TEST 7: DataLoader class exists and has correct structure
  test('data-loader.js - class exports and has correct methods', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const result = await page.evaluate(() => {
      return {
        classExists: typeof DataLoader === 'function',
        hasFetchMethod: typeof DataLoader.prototype.fetchCashFlowData === 'function',
        hasClearCacheMethod: typeof DataLoader.prototype.clearCache === 'function',
        canInstantiate: (() => {
          try {
            const loader = new DataLoader();
            return loader instanceof DataLoader;
          } catch (e) {
            return false;
          }
        })()
      };
    });

    expect(result.classExists).toBe(true);
    expect(result.hasFetchMethod).toBe(true);
    expect(result.hasClearCacheMethod).toBe(true);
    expect(result.canInstantiate).toBe(true);
  });

  // TEST 8: DataLoader constructor sets correct properties
  test('data-loader.js - constructor initializes properties', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const result = await page.evaluate(() => {
      const loader = new DataLoader();
      return {
        hasDataPath: typeof loader.dataPath === 'string',
        dataPathValue: loader.dataPath,
        hasCachedData: loader.hasOwnProperty('cachedData'),
        cachedDataInitialValue: loader.cachedData
      };
    });

    expect(result.hasDataPath).toBe(true);
    expect(result.dataPathValue).toBe('../data/cash-flow-data.md');
    expect(result.hasCachedData).toBe(true);
    expect(result.cachedDataInitialValue).toBe(null);
  });

  // TEST 9: Constants exports all required values
  test('constants.js - exports all required constants', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const constants = await page.evaluate(() => window.CONSTANTS);

    // Forecast settings
    expect(constants.FORECAST_DAYS).toBe(42);
    expect(constants.LOW_BALANCE_THRESHOLD).toBe(500);
    expect(constants.EMERGENCY_WINDOW_DAYS).toBe(7);

    // Performance settings
    expect(constants.DEBOUNCE_DELAY).toBe(300);
    expect(constants.CHART_ANIMATION_DURATION).toBe(500);

    // Storage keys
    expect(constants.STORAGE_KEY_THEME).toBe('cashflow-theme');
    expect(constants.STORAGE_KEY_SCENARIOS).toBe('cashflow-scenarios');

    // Chart colors
    expect(constants.CHART_COLORS.normal).toBe('#667eea');
    expect(constants.CHART_COLORS.low).toBe('#f59e0b');
    expect(constants.CHART_COLORS.negative).toBe('#ef4444');
  });

  // TEST 10: Constants accessible globally via window
  test('constants.js - accessible via window.CONSTANTS', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const forecastDays = await page.evaluate(() => {
      const forecastDays = window.CONSTANTS.FORECAST_DAYS;
      document.body.dataset.forecastDays = forecastDays;
      return document.body.dataset.forecastDays;
    });

    expect(forecastDays).toBe('42');
  });

});
