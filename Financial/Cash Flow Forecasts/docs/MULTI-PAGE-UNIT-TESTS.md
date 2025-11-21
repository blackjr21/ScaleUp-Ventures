# Multi-Page Website - Comprehensive Unit Test Plan

**Version:** 1.0
**Date:** 2025-11-21
**Status:** Ready for Implementation
**Testing Framework:** Playwright (E2E, Unit, Visual)

---

## 🎯 Testing Philosophy

Following the proven approach from scenario planner implementation:
- ✅ **Playwright-only testing** - No Jest, all tests via Playwright
- ✅ **Test after each phase** - Must pass before moving to next phase
- ✅ **Unit + E2E + Visual** - Comprehensive coverage
- ✅ **Automated execution** - Run tests, verify pass, commit, move on

---

## 📋 Test Structure Overview

```
tests/
├── unit/
│   ├── phase1-shared-modules.spec.js       (10 unit tests)
│   ├── phase2-dashboard-only.spec.js       (25 unit tests)
│   ├── phase3-js-modules.spec.js           (40 unit tests)
│   ├── phase4-scenario-planner.spec.js     (50 unit tests)
│   ├── phase5-navigation.spec.js           (15 unit tests)
│   ├── phase6-integration.spec.js          (30 unit tests)
│   └── phase7-agent-workflow.spec.js       (10 unit tests)
├── visual/
│   ├── phase1-visual.spec.js               (5 screenshots)
│   ├── phase2-visual.spec.js               (10 screenshots)
│   ├── phase4-visual.spec.js               (15 screenshots)
│   └── phase5-visual.spec.js               (8 screenshots)
└── fixtures/
    ├── sample-cash-flow-data.md
    └── test-forecast-data.json
```

**Total Tests:** 180 Playwright tests + 38 visual snapshots

---

## PHASE 1: Shared Modules Unit Tests

**File:** `tests/unit/phase1-shared-modules.spec.js`

**Purpose:** Test that shared CSS, theme manager, data loader, and constants work independently

### Test Suite (10 Tests)

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 1: Shared Modules - Unit Tests', () => {

  // ============================================
  // TEST 1: shared.css loads and applies styles
  // ============================================
  test('shared.css - CSS variables are defined', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body></body>
      </html>
    `);

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

  // ============================================
  // TEST 2: shared.css dark theme variables work
  // ============================================
  test('shared.css - dark theme CSS variables apply correctly', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body class="dark-theme"></body>
      </html>
    `);

    const bgPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );
    expect(bgPrimary).toBe('#0f172a');

    const textPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
    );
    expect(textPrimary).toBe('#f1f5f9');
  });

  // ============================================
  // TEST 3: Button styles from shared.css work
  // ============================================
  test('shared.css - button styles render correctly', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body>
        <button class="btn-primary">Test Button</button>
      </body>
      </html>
    `);

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

  // ============================================
  // TEST 4: ThemeManager initializes correctly
  // ============================================
  test('theme-manager.js - initializes with light theme by default', async ({ page }) => {
    // Clear localStorage first
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body>
        <button id="themeToggle">🌙</button>
        <script src="../forecasts/js/shared/theme-manager.js"></script>
      </body>
      </html>
    `);

    // Should NOT have dark-theme class
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).not.toContain('dark-theme');

    // Button should show moon (for switching to dark)
    const btnText = await page.locator('#themeToggle').textContent();
    expect(btnText).toBe('🌙');
  });

  // ============================================
  // TEST 5: ThemeManager toggles theme
  // ============================================
  test('theme-manager.js - toggles theme on button click', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body>
        <button id="themeToggle">🌙</button>
        <script src="../forecasts/js/shared/theme-manager.js"></script>
      </body>
      </html>
    `);

    // Click toggle
    await page.click('#themeToggle');

    // Should have dark-theme class
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark-theme');

    // Button should show sun
    const btnText = await page.locator('#themeToggle').textContent();
    expect(btnText).toBe('☀️');
  });

  // ============================================
  // TEST 6: ThemeManager persists to localStorage
  // ============================================
  test('theme-manager.js - persists theme to localStorage', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body>
        <button id="themeToggle">🌙</button>
        <script src="../forecasts/js/shared/theme-manager.js"></script>
      </body>
      </html>
    `);

    // Toggle to dark
    await page.click('#themeToggle');

    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('cashflow-theme'));
    expect(storedTheme).toBe('dark');

    // Reload page
    await page.reload();

    // Should still be dark
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark-theme');
  });

  // ============================================
  // TEST 7: DataLoader fetches cash-flow-data.md
  // ============================================
  test('data-loader.js - successfully fetches cash-flow-data.md', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/forecasts/dashboard.html');

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const data = await loader.fetchCashFlowData();
      return {
        loaded: data && data.length > 0,
        hasMonthlySection: data.includes('## OUTFLOWS - Monthly'),
        hasBiweeklySection: data.includes('## OUTFLOWS - Biweekly'),
        hasInflowsSection: data.includes('## INFLOWS')
      };
    });

    expect(result.loaded).toBe(true);
    expect(result.hasMonthlySection).toBe(true);
    expect(result.hasBiweeklySection).toBe(true);
    expect(result.hasInflowsSection).toBe(true);
  });

  // ============================================
  // TEST 8: DataLoader caches data
  // ============================================
  test('data-loader.js - caches data on second call', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/forecasts/dashboard.html');

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();

      // First fetch
      const data1 = await loader.fetchCashFlowData();
      const firstFetchTime = Date.now();

      // Second fetch (should be instant from cache)
      const data2 = await loader.fetchCashFlowData();
      const secondFetchTime = Date.now();

      return {
        dataMatches: data1 === data2,
        wasCached: (secondFetchTime - firstFetchTime) < 5 // Less than 5ms = cached
      };
    });

    expect(result.dataMatches).toBe(true);
    expect(result.wasCached).toBe(true);
  });

  // ============================================
  // TEST 9: Constants exports all values
  // ============================================
  test('constants.js - exports all required constants', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
      </body>
      </html>
    `);

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

  // ============================================
  // TEST 10: Constants accessible globally
  // ============================================
  test('constants.js - accessible via window.CONSTANTS', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script>
          // Test that constants can be used in other scripts
          const forecastDays = window.CONSTANTS.FORECAST_DAYS;
          document.body.dataset.forecastDays = forecastDays;
        </script>
      </body>
      </html>
    `);

    const forecastDays = await page.locator('body').getAttribute('data-forecast-days');
    expect(forecastDays).toBe('42');
  });

});
```

**Expected Result:** 10/10 tests passing

**Run Command:**
```bash
npx playwright test tests/unit/phase1-shared-modules.spec.js
```

---

## PHASE 2: Dashboard-Only Unit Tests

**File:** `tests/unit/phase2-dashboard-only.spec.js`

**Purpose:** Test that dashboard page works correctly without scenario planner features

### Test Suite (25 Tests)

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 2: Dashboard-Only - Unit Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/forecasts/dashboard.html');
  });

  // ============================================
  // TEST 1: Page loads successfully
  // ============================================
  test('dashboard page loads without errors', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Cash Flow Dashboard');
  });

  // ============================================
  // TEST 2: Shared CSS linked correctly
  // ============================================
  test('dashboard links shared.css correctly', async ({ page }) => {
    const bgPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );
    expect(bgPrimary).toBeTruthy();
  });

  // ============================================
  // TEST 3: Dashboard CSS linked correctly
  // ============================================
  test('dashboard links dashboard.css correctly', async ({ page }) => {
    const heroCar = page.locator('.hero-card').first();
    if (await heroCard.count() > 0) {
      const bgColor = await heroCard.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toBeTruthy();
    }
  });

  // ============================================
  // TEST 4: Theme toggle button exists
  // ============================================
  test('theme toggle button is present', async ({ page }) => {
    const toggle = page.locator('#themeToggle');
    await expect(toggle).toBeVisible();
  });

  // ============================================
  // TEST 5: Theme toggle works
  // ============================================
  test('theme toggle switches between light and dark', async ({ page }) => {
    const toggle = page.locator('#themeToggle');

    // Get initial state
    let bodyClass = await page.locator('body').getAttribute('class');
    const initialDark = bodyClass?.includes('dark-theme') || false;

    // Toggle
    await toggle.click();

    // Check changed
    bodyClass = await page.locator('body').getAttribute('class');
    const afterToggleDark = bodyClass?.includes('dark-theme') || false;

    expect(afterToggleDark).toBe(!initialDark);
  });

  // ============================================
  // TEST 6: Navigation link to scenario planner exists
  // ============================================
  test('navigation link to scenario planner is present', async ({ page }) => {
    const navLink = page.locator('a[href="scenario-planner.html"]');
    await expect(navLink).toBeVisible();
    await expect(navLink).toContainText('Scenario Planner');
  });

  // ============================================
  // TEST 7: Emergency banner (if applicable)
  // ============================================
  test('emergency banner shows when negative within 7 days', async ({ page }) => {
    const banner = page.locator('.emergency-banner');
    const isVisible = await banner.isVisible().catch(() => false);

    if (isVisible) {
      await expect(banner).toContainText('ALERT');
    }
    // If not visible, that's OK - depends on data
  });

  // ============================================
  // TEST 8: Action center exists
  // ============================================
  test('action center section renders', async ({ page }) => {
    const actionCenter = page.locator('.action-center');
    await expect(actionCenter).toBeVisible();
  });

  // ============================================
  // TEST 9: Hero statistics cards render
  // ============================================
  test('hero statistics cards are present', async ({ page }) => {
    const incomeCard = page.locator('.hero-card.income');
    const expenseCard = page.locator('.hero-card.expense');
    const surplusCard = page.locator('.hero-card.surplus');

    await expect(incomeCard).toBeVisible();
    await expect(expenseCard).toBeVisible();
    await expect(surplusCard).toBeVisible();
  });

  // ============================================
  // TEST 10: Hero cards show dollar values
  // ============================================
  test('hero cards display dollar amounts', async ({ page }) => {
    const incomeCard = page.locator('.hero-card.income');
    await expect(incomeCard).toContainText('$');
  });

  // ============================================
  // TEST 11: Spending gauge renders
  // ============================================
  test('spending gauge is visible', async ({ page }) => {
    const gauge = page.locator('.gauge-container');
    await expect(gauge).toBeVisible();

    const gaugeFill = page.locator('.gauge-fill');
    const style = await gaugeFill.getAttribute('style');
    expect(style).toContain('width:');
  });

  // ============================================
  // TEST 12: Alert badges show counts
  // ============================================
  test('alert badges display critical and warning counts', async ({ page }) => {
    const criticalBadge = page.locator('.alert-badge.critical');
    const warningBadge = page.locator('.alert-badge.warning');

    const criticalText = await criticalBadge.textContent();
    const warningText = await warningBadge.textContent();

    expect(criticalText).toMatch(/\d+/);
    expect(warningText).toMatch(/\d+/);
  });

  // ============================================
  // TEST 13: Critical alerts list renders
  // ============================================
  test('critical alerts list shows alert items', async ({ page }) => {
    const alertsList = page.locator('.alerts-list');
    await expect(alertsList).toBeVisible();

    const alertItems = page.locator('.alert-item');
    const count = await alertItems.count();
    expect(count).toBeGreaterThan(0);
  });

  // ============================================
  // TEST 14: Alert items have correct structure
  // ============================================
  test('alert items have icon and content', async ({ page }) => {
    const firstAlert = page.locator('.alert-item').first();
    await expect(firstAlert.locator('.alert-icon')).toBeVisible();
    await expect(firstAlert.locator('.alert-content')).toBeVisible();
  });

  // ============================================
  // TEST 15: Forecast summary grid renders
  // ============================================
  test('forecast summary grid shows values', async ({ page }) => {
    const summary = page.locator('.forecast-summary');
    await expect(summary).toBeVisible();

    await expect(summary).toContainText('Starting Balance');
    await expect(summary).toContainText('Ending Balance');
    await expect(summary).toContainText('$');
  });

  // ============================================
  // TEST 16: Balance chart renders
  // ============================================
  test('balance chart canvas is present', async ({ page }) => {
    const chart = page.locator('canvas#balanceChart');
    await expect(chart).toBeVisible();
  });

  // ============================================
  // TEST 17: Chart has content (not blank)
  // ============================================
  test('balance chart renders with data', async ({ page }) => {
    const chart = page.locator('canvas#balanceChart');
    await page.waitForTimeout(1000); // Wait for Chart.js

    const hasContent = await chart.evaluate((canvas) => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return imageData.data.some(pixel => pixel !== 0);
    });

    expect(hasContent).toBe(true);
  });

  // ============================================
  // TEST 18: Transaction table renders
  // ============================================
  test('transaction table is visible with data', async ({ page }) => {
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();

    const rows = page.locator('.transaction-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  // ============================================
  // TEST 19: Transaction table has correct columns
  // ============================================
  test('transaction table shows date, debits, credits, balance', async ({ page }) => {
    const firstRow = page.locator('.transaction-table tbody tr').first();
    await expect(firstRow).toContainText(/\d{4}-\d{2}-\d{2}/); // Date format
  });

  // ============================================
  // TEST 20: Table filter buttons exist
  // ============================================
  test('table filter buttons are present', async ({ page }) => {
    const allButton = page.locator('button[data-filter="all"]');
    const flaggedButton = page.locator('button[data-filter="flagged"]');
    const majorButton = page.locator('button[data-filter="major"]');

    await expect(allButton).toBeVisible();
    await expect(flaggedButton).toBeVisible();
    await expect(majorButton).toBeVisible();
  });

  // ============================================
  // TEST 21: Table filters work correctly
  // ============================================
  test('table filter buttons filter rows', async ({ page }) => {
    const allButton = page.locator('button[data-filter="all"]');
    const flaggedButton = page.locator('button[data-filter="flagged"]');

    await allButton.click();
    let rows = page.locator('.transaction-table tbody tr:visible');
    const allCount = await rows.count();

    await flaggedButton.click();
    rows = page.locator('.transaction-table tbody tr:visible');
    const flaggedCount = await rows.count();

    expect(flaggedCount).toBeLessThanOrEqual(allCount);
  });

  // ============================================
  // TEST 22: NO control panel sidebar
  // ============================================
  test('control panel sidebar does NOT exist', async ({ page }) => {
    const controlPanel = page.locator('.control-panel');
    expect(await controlPanel.count()).toBe(0);
  });

  // ============================================
  // TEST 23: NO comparison view
  // ============================================
  test('comparison section does NOT exist', async ({ page }) => {
    const comparisonSection = page.locator('.comparison-section');
    expect(await comparisonSection.count()).toBe(0);
  });

  // ============================================
  // TEST 24: NO chart switcher
  // ============================================
  test('chart switcher does NOT exist', async ({ page }) => {
    const switcher = page.locator('.chart-view-switcher');
    expect(await switcher.count()).toBe(0);
  });

  // ============================================
  // TEST 25: NO expense checkboxes
  // ============================================
  test('expense checkboxes do NOT exist', async ({ page }) => {
    const checkboxes = page.locator('.expense-checkbox');
    expect(await checkboxes.count()).toBe(0);
  });

});
```

**Expected Result:** 25/25 tests passing

**Run Command:**
```bash
npx playwright test tests/unit/phase2-dashboard-only.spec.js
```

---

## PHASE 3: JavaScript Modules Unit Tests

**File:** `tests/unit/phase3-js-modules.spec.js`

**Purpose:** Test each extracted JavaScript module independently

### Test Suite (40 Tests)

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 3: JavaScript Modules - Unit Tests', () => {

  // ============================================
  // PARSER MODULE TESTS (10 tests)
  // ============================================

  test('Parser - successfully parses monthly bills', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      return {
        hasMonthly: rules.monthly.length > 0,
        monthlyCount: rules.monthly.length
      };
    });

    expect(result.hasMonthly).toBe(true);
    expect(result.monthlyCount).toBeGreaterThan(0);
  });

  test('Parser - correctly extracts monthly bill amounts', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      // Find LoanCare Mortgage (should be ~$3566)
      const loancare = rules.monthly.flat().find(bill =>
        bill.name && bill.name.includes('LoanCare')
      );

      return {
        found: !!loancare,
        amount: loancare?.amount,
        hasDay: loancare?.day !== undefined
      };
    });

    expect(result.found).toBe(true);
    expect(result.amount).toBeGreaterThan(3000);
    expect(result.hasDay).toBe(true);
  });

  test('Parser - successfully parses biweekly bills', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      return {
        hasBiweekly: rules.biweekly.length > 0,
        biweeklyCount: rules.biweekly.length,
        hasAnchor: rules.biweekly[0]?.anchor !== undefined
      };
    });

    expect(result.hasBiweekly).toBe(true);
    expect(result.biweeklyCount).toBeGreaterThan(0);
    expect(result.hasAnchor).toBe(true);
  });

  test('Parser - correctly extracts anchor dates', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      const firstBiweekly = rules.biweekly[0];
      const anchorFormat = /\d{4}-\d{2}-\d{2}/;

      return {
        matchesFormat: anchorFormat.test(firstBiweekly.anchor),
        anchor: firstBiweekly.anchor
      };
    });

    expect(result.matchesFormat).toBe(true);
  });

  test('Parser - parses weekday recurring expenses', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      // Should find NFCU weekday recurring
      const nfcu = rules.weekdayRecurring.find(item =>
        item.name && item.name.includes('NFCU')
      );

      return {
        found: !!nfcu,
        amount: nfcu?.amount,
        category: nfcu?.category
      };
    });

    expect(result.found).toBe(true);
    expect(result.amount).toBe(33);
    expect(result.category).toBe('weekday-recurring');
  });

  test('Parser - parses Friday allocations', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      return {
        hasFriday: rules.fridayRecurring.length > 0,
        fridayCount: rules.fridayRecurring.length
      };
    });

    expect(result.hasFriday).toBe(true);
    expect(result.fridayCount).toBeGreaterThanOrEqual(3); // Savings, Tithe, Debt Payoff
  });

  test('Parser - parses inflows (paychecks)', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      return {
        hasInflows: rules.inflows.length > 0,
        inflowCount: rules.inflows.length
      };
    });

    expect(result.hasInflows).toBe(true);
    expect(result.inflowCount).toBeGreaterThan(0);
  });

  test('Parser - generates correct expense IDs', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const parser = new CashFlowParser();

      return {
        id1: parser.generateId('LoanCare Mortgage'),
        id2: parser.generateId('NFCU Volvo Loan'),
        id3: parser.generateId('Sleep Number')
      };
    });

    expect(result.id1).toBe('loancare-mortgage');
    expect(result.id2).toBe('nfcu-volvo-loan');
    expect(result.id3).toBe('sleep-number');
  });

  test('Parser - flatten() creates ID-indexed object', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const flattened = parser.flatten();

      return {
        hasLoancare: 'loancare-mortgage' in flattened,
        hasNFCU: 'nfcu-volvo-loan' in flattened,
        totalRules: Object.keys(flattened).length
      };
    });

    expect(result.hasLoancare).toBe(true);
    expect(result.hasNFCU).toBe(true);
    expect(result.totalRules).toBeGreaterThan(40);
  });

  test('Parser - handles multiple expenses on same day', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      const rules = parser.parse(markdown);

      // Day 1 should have multiple bills
      const day1Bills = rules.monthly.filter(item => {
        if (Array.isArray(item)) {
          return item.some(bill => bill.day === 1);
        }
        return item.day === 1;
      });

      return {
        hasMultiple: day1Bills.length > 0,
        count: day1Bills.length
      };
    });

    expect(result.hasMultiple).toBe(true);
    expect(result.count).toBeGreaterThanOrEqual(1);
  });

  // ============================================
  // TRANSACTION ENGINE TESTS (15 tests)
  // ============================================

  test('TransactionEngine - initializes with rules', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const rules = parser.flatten();

      const engine = new TransactionRuleEngine(rules, '2025-11-21', 400);

      return {
        hasRules: Object.keys(engine.rules).length > 0,
        startBalance: engine.startBalance,
        forecastDays: engine.forecastDays
      };
    });

    expect(result.hasRules).toBe(true);
    expect(result.startBalance).toBe(400);
    expect(result.forecastDays).toBe(42);
  });

  test('TransactionEngine - generates 42-day forecast', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const rules = parser.flatten();

      const engine = new TransactionRuleEngine(rules, '2025-11-21', 400);
      const forecast = engine.calculateDailyForecast();

      return {
        dayCount: forecast.length,
        firstDate: forecast[0].date,
        lastDate: forecast[forecast.length - 1].date
      };
    });

    expect(result.dayCount).toBe(42);
    expect(result.firstDate).toBe('2025-11-21');
    expect(result.lastDate).toBe('2026-01-01');
  });

  test('TransactionEngine - biweekly date math works (modulo 14)', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const engine = new TransactionRuleEngine({}, '2025-11-21', 400);

      // Test anchor: 2025-08-08
      return {
        day0: engine.isBiweeklyDue(new Date('2025-08-08'), '2025-08-08'), // Should be true (anchor day)
        day14: engine.isBiweeklyDue(new Date('2025-08-22'), '2025-08-08'), // Should be true (+14 days)
        day28: engine.isBiweeklyDue(new Date('2025-09-05'), '2025-08-08'), // Should be true (+28 days)
        day7: engine.isBiweeklyDue(new Date('2025-08-15'), '2025-08-08'), // Should be false (+7 days)
        day21: engine.isBiweeklyDue(new Date('2025-08-29'), '2025-08-08') // Should be false (+21 days)
      };
    });

    expect(result.day0).toBe(true);
    expect(result.day14).toBe(true);
    expect(result.day28).toBe(true);
    expect(result.day7).toBe(false);
    expect(result.day21).toBe(false);
  });

  test('TransactionEngine - correctly flags negative balances', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const engine = new TransactionRuleEngine({}, '2025-11-21', 400);

      return {
        negative: engine.getFlag(-100),
        low: engine.getFlag(300),
        normal: engine.getFlag(1000)
      };
    });

    expect(result.negative).toBe('NEG');
    expect(result.low).toBe('LOW');
    expect(result.normal).toBe('');
  });

  test('TransactionEngine - correctly flags low balances', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const engine = new TransactionRuleEngine({}, '2025-11-21', 400);

      return {
        veryLow: engine.getFlag(10),
        borderline: engine.getFlag(499),
        justAbove: engine.getFlag(500)
      };
    });

    expect(result.veryLow).toBe('LOW');
    expect(result.borderline).toBe('LOW');
    expect(result.justAbove).toBe('');
  });

  test('TransactionEngine - formats dates correctly', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const engine = new TransactionRuleEngine({}, '2025-11-21', 400);

      return {
        date1: engine.formatDate(new Date('2025-11-21')),
        date2: engine.formatDate(new Date('2026-01-05'))
      };
    });

    expect(result.date1).toBe('2025-11-21');
    expect(result.date2).toBe('2026-01-05');
  });

  test('TransactionEngine - monthly bills occur on correct day', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const rules = {
        'test-bill': {
          id: 'test-bill',
          name: 'Test Bill',
          amount: 100,
          day: 5,
          category: 'monthly'
        }
      };

      const engine = new TransactionRuleEngine(rules, '2025-11-01', 1000);
      const forecast = engine.calculateDailyForecast();

      // Find day 5
      const day5 = forecast.find(d => d.date === '2025-11-05');

      return {
        found: !!day5,
        hasDebit: day5?.debits > 0,
        debitAmount: day5?.debits,
        debitNames: day5?.debitNames
      };
    });

    expect(result.found).toBe(true);
    expect(result.hasDebit).toBe(true);
    expect(result.debitAmount).toBe(100);
    expect(result.debitNames).toContain('Test Bill');
  });

  test('TransactionEngine - weekday recurring only on Mon-Fri', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const rules = {
        'weekday-test': {
          id: 'weekday-test',
          name: 'Weekday Test',
          amount: 33,
          category: 'weekday-recurring'
        }
      };

      const engine = new TransactionRuleEngine(rules, '2025-11-17', 1000); // Monday
      const forecast = engine.calculateDailyForecast();

      // Check Mon-Fri have charges, Sat-Sun don't
      const mon = forecast.find(d => d.date === '2025-11-17'); // Monday
      const tue = forecast.find(d => d.date === '2025-11-18'); // Tuesday
      const sat = forecast.find(d => d.date === '2025-11-22'); // Saturday
      const sun = forecast.find(d => d.date === '2025-11-23'); // Sunday

      return {
        monHasCharge: mon.debits === 33,
        tueHasCharge: tue.debits === 33,
        satNoCharge: sat.debits === 0,
        sunNoCharge: sun.debits === 0
      };
    });

    expect(result.monHasCharge).toBe(true);
    expect(result.tueHasCharge).toBe(true);
    expect(result.satNoCharge).toBe(true);
    expect(result.sunNoCharge).toBe(true);
  });

  test('TransactionEngine - Friday allocations only on Fridays', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const rules = {
        'friday-test': {
          id: 'friday-test',
          name: 'Friday Test',
          amount: 200,
          category: 'friday-recurring'
        }
      };

      const engine = new TransactionRuleEngine(rules, '2025-11-17', 1000);
      const forecast = engine.calculateDailyForecast();

      const fri1 = forecast.find(d => d.date === '2025-11-21'); // Friday
      const thu = forecast.find(d => d.date === '2025-11-20'); // Thursday
      const fri2 = forecast.find(d => d.date === '2025-11-28'); // Next Friday

      return {
        fri1HasCharge: fri1.debits === 200,
        thuNoCharge: thu.debits === 0,
        fri2HasCharge: fri2.debits === 200
      };
    });

    expect(result.fri1HasCharge).toBe(true);
    expect(result.thuNoCharge).toBe(true);
    expect(result.fri2HasCharge).toBe(true);
  });

  test('TransactionEngine - disabled expenses are excluded', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const rules = {
        'bill1': {
          id: 'bill1',
          name: 'Bill 1',
          amount: 100,
          day: 5,
          category: 'monthly'
        },
        'bill2': {
          id: 'bill2',
          name: 'Bill 2',
          amount: 200,
          day: 5,
          category: 'monthly'
        }
      };

      const engine = new TransactionRuleEngine(rules, '2025-11-01', 1000);

      // Run without disabling
      const forecast1 = engine.calculateDailyForecast();
      const day5_all = forecast1.find(d => d.date === '2025-11-05');

      // Run with bill2 disabled
      const disabled = new Set(['bill2']);
      const forecast2 = engine.calculateDailyForecast(disabled);
      const day5_disabled = forecast2.find(d => d.date === '2025-11-05');

      return {
        allDebits: day5_all.debits,
        disabledDebits: day5_disabled.debits
      };
    });

    expect(result.allDebits).toBe(300);
    expect(result.disabledDebits).toBe(100);
  });

  test('TransactionEngine - balance decreases with debits', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const rules = {
        'test-debit': {
          id: 'test-debit',
          name: 'Test Debit',
          amount: 100,
          day: 2,
          category: 'monthly'
        }
      };

      const engine = new TransactionRuleEngine(rules, '2025-11-01', 1000);
      const forecast = engine.calculateDailyForecast();

      const day1 = forecast.find(d => d.date === '2025-11-01');
      const day2 = forecast.find(d => d.date === '2025-11-02');
      const day3 = forecast.find(d => d.date === '2025-11-03');

      return {
        day1Balance: day1.endBalance,
        day2Balance: day2.endBalance,
        day3Balance: day3.endBalance
      };
    });

    expect(result.day1Balance).toBe(1000);
    expect(result.day2Balance).toBe(900);
    expect(result.day3Balance).toBe(900);
  });

  test('TransactionEngine - balance increases with credits', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const rules = {
        'test-credit': {
          id: 'test-credit',
          name: 'Test Paycheck',
          amount: 3000,
          frequency: { type: 'biweekly', anchor: '2025-11-01' },
          category: 'inflow'
        }
      };

      const engine = new TransactionRuleEngine(rules, '2025-11-01', 400);
      const forecast = engine.calculateDailyForecast();

      const day1 = forecast.find(d => d.date === '2025-11-01');
      const day15 = forecast.find(d => d.date === '2025-11-15'); // +14 days

      return {
        day1Balance: day1.endBalance,
        day1Credits: day1.credits,
        day15Balance: day15.endBalance,
        day15Credits: day15.credits
      };
    });

    expect(result.day1Credits).toBe(3000);
    expect(result.day1Balance).toBe(3400);
    expect(result.day15Credits).toBe(3000);
    expect(result.day15Balance).toBeGreaterThan(3000);
  });

  test('TransactionEngine - calculates running balance correctly', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const rules = {
        'daily-debit': {
          id: 'daily-debit',
          name: 'Daily Debit',
          amount: 10,
          category: 'weekday-recurring'
        }
      };

      const engine = new TransactionRuleEngine(rules, '2025-11-17', 500); // Monday
      const forecast = engine.calculateDailyForecast();

      const mon = forecast.find(d => d.date === '2025-11-17');
      const tue = forecast.find(d => d.date === '2025-11-18');
      const wed = forecast.find(d => d.date === '2025-11-19');

      return {
        monBalance: mon.endBalance,
        tueBalance: tue.endBalance,
        wedBalance: wed.endBalance
      };
    });

    expect(result.monBalance).toBe(490);
    expect(result.tueBalance).toBe(480);
    expect(result.wedBalance).toBe(470);
  });

  test('TransactionEngine - forecast array structure is correct', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const engine = new TransactionRuleEngine({}, '2025-11-21', 400);
      const forecast = engine.calculateDailyForecast();
      const firstDay = forecast[0];

      return {
        hasDate: 'date' in firstDay,
        hasDebits: 'debits' in firstDay,
        hasCredits: 'credits' in firstDay,
        hasEndBalance: 'endBalance' in firstDay,
        hasFlag: 'flag' in firstDay,
        hasDebitNames: 'debitNames' in firstDay,
        hasCreditNames: 'creditNames' in firstDay
      };
    });

    expect(result.hasDate).toBe(true);
    expect(result.hasDebits).toBe(true);
    expect(result.hasCredits).toBe(true);
    expect(result.hasEndBalance).toBe(true);
    expect(result.hasFlag).toBe(true);
    expect(result.hasDebitNames).toBe(true);
    expect(result.hasCreditNames).toBe(true);
  });

  test('TransactionEngine - handles empty rules gracefully', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const engine = new TransactionRuleEngine({}, '2025-11-21', 400);
      const forecast = engine.calculateDailyForecast();

      return {
        dayCount: forecast.length,
        firstDayDebits: forecast[0].debits,
        firstDayCredits: forecast[0].credits,
        allBalancesSame: forecast.every(d => d.endBalance === 400)
      };
    });

    expect(result.dayCount).toBe(42);
    expect(result.firstDayDebits).toBe(0);
    expect(result.firstDayCredits).toBe(0);
    expect(result.allBalancesSame).toBe(true);
  });

  // ============================================
  // COMPARISON CALCULATOR TESTS (8 tests)
  // ============================================

  test('ComparisonCalculator - calculates total removed expenses', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const baseline = [
        { date: '2025-11-21', debits: 100, credits: 0, endBalance: 300 },
        { date: '2025-11-22', debits: 200, credits: 0, endBalance: 100 }
      ];

      const modified = [
        { date: '2025-11-21', debits: 50, credits: 0, endBalance: 350 },
        { date: '2025-11-22', debits: 100, credits: 0, endBalance: 250 }
      ];

      const calc = new ComparisonCalculator(baseline, modified);
      return calc.getTotalRemoved();
    });

    expect(result).toBe(150); // (100-50) + (200-100)
  });

  test('ComparisonCalculator - calculates ending balance change', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const baseline = [
        { date: '2025-11-21', debits: 0, credits: 0, endBalance: -500 }
      ];

      const modified = [
        { date: '2025-11-21', debits: 0, credits: 0, endBalance: 200 }
      ];

      const calc = new ComparisonCalculator(baseline, modified);
      return calc.getEndingBalanceChange();
    });

    expect(result.before).toBe(-500);
    expect(result.after).toBe(200);
    expect(result.delta).toBe(700);
    expect(result.improved).toBe(true);
  });

  test('ComparisonCalculator - detects negative days reduction', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const baseline = [
        { date: '2025-11-21', debits: 0, credits: 0, endBalance: 100, flag: '' },
        { date: '2025-11-22', debits: 0, credits: 0, endBalance: -50, flag: 'NEG' },
        { date: '2025-11-23', debits: 0, credits: 0, endBalance: -100, flag: 'NEG' },
        { date: '2025-11-24', debits: 0, credits: 0, endBalance: 200, flag: '' }
      ];

      const modified = [
        { date: '2025-11-21', debits: 0, credits: 0, endBalance: 100, flag: '' },
        { date: '2025-11-22', debits: 0, credits: 0, endBalance: 50, flag: '' },
        { date: '2025-11-23', debits: 0, credits: 0, endBalance: 100, flag: '' },
        { date: '2025-11-24', debits: 0, credits: 0, endBalance: 200, flag: '' }
      ];

      const calc = new ComparisonCalculator(baseline, modified);
      return calc.getNegativeDaysReduction();
    });

    expect(result.before).toBe(2);
    expect(result.after).toBe(0);
    expect(result.reduction).toBe(2);
  });

  test('ComparisonCalculator - calculates lowest point improvement', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const baseline = [
        { date: '2025-11-21', endBalance: 100 },
        { date: '2025-11-22', endBalance: -300 },
        { date: '2025-11-23', endBalance: 50 }
      ];

      const modified = [
        { date: '2025-11-21', endBalance: 100 },
        { date: '2025-11-22', endBalance: -50 },
        { date: '2025-11-23', endBalance: 50 }
      ];

      const calc = new ComparisonCalculator(baseline, modified);
      return calc.getLowestPointImprovement();
    });

    expect(result.baselineLowest).toBe(-300);
    expect(result.modifiedLowest).toBe(-50);
    expect(result.improvement).toBe(250);
  });

  test('ComparisonCalculator - identifies removed expense names', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const rules = parser.flatten();

      const engine = new TransactionRuleEngine(rules, '2025-11-21', 400);
      const baseline = engine.calculateDailyForecast();

      const disabled = new Set(['loancare-mortgage', 'sleep-number']);
      const modified = engine.calculateDailyForecast(disabled);

      const calc = new ComparisonCalculator(baseline, modified);
      const removed = calc.getRemovedExpensesList(rules, disabled);

      return {
        count: removed.length,
        hasLoancare: removed.some(e => e.name.includes('LoanCare')),
        hasSleepNumber: removed.some(e => e.name.includes('Sleep Number'))
      };
    });

    expect(result.count).toBe(2);
    expect(result.hasLoancare).toBe(true);
    expect(result.hasSleepNumber).toBe(true);
  });

  test('ComparisonCalculator - calculates status change (NEG to POSITIVE)', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const baseline = [
        { date: '2025-11-21', endBalance: -500 }
      ];

      const modified = [
        { date: '2025-11-21', endBalance: 200 }
      ];

      const calc = new ComparisonCalculator(baseline, modified);
      return calc.getStatusChange();
    });

    expect(result.before).toBe('NEGATIVE');
    expect(result.after).toBe('POSITIVE');
    expect(result.improved).toBe(true);
  });

  test('ComparisonCalculator - calculates LOW days reduction', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const baseline = [
        { date: '2025-11-21', endBalance: 1000, flag: '' },
        { date: '2025-11-22', endBalance: 300, flag: 'LOW' },
        { date: '2025-11-23', endBalance: 400, flag: 'LOW' },
        { date: '2025-11-24', endBalance: 1000, flag: '' }
      ];

      const modified = [
        { date: '2025-11-21', endBalance: 1000, flag: '' },
        { date: '2025-11-22', endBalance: 600, flag: '' },
        { date: '2025-11-23', endBalance: 700, flag: '' },
        { date: '2025-11-24', endBalance: 1000, flag: '' }
      ];

      const calc = new ComparisonCalculator(baseline, modified);
      return calc.getLowDaysReduction();
    });

    expect(result.before).toBe(2);
    expect(result.after).toBe(0);
    expect(result.reduction).toBe(2);
  });

  test('ComparisonCalculator - handles identical forecasts', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/scenario-planner/comparison-calc.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const forecast = [
        { date: '2025-11-21', debits: 100, credits: 0, endBalance: 300 }
      ];

      const calc = new ComparisonCalculator(forecast, forecast);

      return {
        totalRemoved: calc.getTotalRemoved(),
        endingDelta: calc.getEndingBalanceChange().delta,
        negativeReduction: calc.getNegativeDaysReduction().reduction
      };
    });

    expect(result.totalRemoved).toBe(0);
    expect(result.endingDelta).toBe(0);
    expect(result.negativeReduction).toBe(0);
  });

  // ============================================
  // SCENARIO MANAGER TESTS (4 tests)
  // ============================================

  test('ScenarioManager - initializes with baseline', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
        <script src="../forecasts/js/scenario-planner/scenario-manager.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const rules = parser.flatten();

      const manager = new ScenarioManager(rules, '2025-11-21', 400);

      return {
        hasBaseline: manager.baselineForecast && manager.baselineForecast.length > 0,
        baselineLength: manager.baselineForecast.length,
        hasDisabledSet: manager.disabledExpenses instanceof Set
      };
    });

    expect(result.hasBaseline).toBe(true);
    expect(result.baselineLength).toBe(42);
    expect(result.hasDisabledSet).toBe(true);
  });

  test('ScenarioManager - toggleExpense adds to disabled set', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
        <script src="../forecasts/js/scenario-planner/scenario-manager.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const rules = parser.flatten();

      const manager = new ScenarioManager(rules, '2025-11-21', 400);

      // Toggle off
      manager.toggleExpense('loancare-mortgage');
      const disabled1 = manager.disabledExpenses.has('loancare-mortgage');

      // Toggle back on
      manager.toggleExpense('loancare-mortgage');
      const disabled2 = manager.disabledExpenses.has('loancare-mortgage');

      return { disabled1, disabled2 };
    });

    expect(result.disabled1).toBe(true);
    expect(result.disabled2).toBe(false);
  });

  test('ScenarioManager - debounces recalculation', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
        <script src="../forecasts/js/scenario-planner/scenario-manager.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const rules = parser.flatten();

      const manager = new ScenarioManager(rules, '2025-11-21', 400);

      let notificationCount = 0;
      manager.addListener(() => notificationCount++);

      // Rapid toggles (should debounce)
      manager.toggleExpense('loancare-mortgage');
      manager.toggleExpense('sleep-number');
      manager.toggleExpense('nfcu-volvo-loan');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      return { notificationCount };
    });

    expect(result.notificationCount).toBe(1); // Only 1 notification due to debouncing
  });

  test('ScenarioManager - notifies listeners on update', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
        <script src="../forecasts/js/shared/data-loader.js"></script>
        <script src="../forecasts/js/scenario-planner/parser.js"></script>
        <script src="../forecasts/js/scenario-planner/transaction-engine.js"></script>
        <script src="../forecasts/js/scenario-planner/scenario-manager.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const markdown = await loader.fetchCashFlowData();
      const parser = new CashFlowParser();
      parser.parse(markdown);
      const rules = parser.flatten();

      const manager = new ScenarioManager(rules, '2025-11-21', 400);

      let receivedUpdate = false;
      manager.addListener((modified, baseline, disabled) => {
        receivedUpdate = true;
      });

      manager.toggleExpense('loancare-mortgage');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      return { receivedUpdate };
    });

    expect(result.receivedUpdate).toBe(true);
  });

  // ============================================
  // SCENARIO STORAGE TESTS (3 tests)
  // ============================================

  test('ScenarioStorage - saves to localStorage', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/scenario-planner/scenario-storage.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const storage = new ScenarioStorage();
      const disabled = new Set(['loancare-mortgage', 'sleep-number']);
      const summary = { endingBalance: 500, negDays: 0 };

      storage.saveScenario('Test Scenario', disabled, summary);

      const saved = localStorage.getItem('cashflow-scenarios');
      return { saved: !!saved, parsed: JSON.parse(saved) };
    });

    expect(result.saved).toBe(true);
    expect(result.parsed['Test Scenario']).toBeDefined();
  });

  test('ScenarioStorage - loads from localStorage', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/scenario-planner/scenario-storage.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const storage = new ScenarioStorage();
      const disabled = new Set(['loancare-mortgage']);
      const summary = { endingBalance: 500 };

      storage.saveScenario('Test Load', disabled, summary);
      const loaded = storage.loadScenario('Test Load');

      return {
        found: !!loaded,
        hasDisabled: loaded.disabledExpenses.includes('loancare-mortgage'),
        hasSummary: !!loaded.summary
      };
    });

    expect(result.found).toBe(true);
    expect(result.hasDisabled).toBe(true);
    expect(result.hasSummary).toBe(true);
  });

  test('ScenarioStorage - deletes scenario', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/scenario-planner/scenario-storage.js"></script>
      </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      const storage = new ScenarioStorage();
      const disabled = new Set(['loancare-mortgage']);
      const summary = { endingBalance: 500 };

      storage.saveScenario('To Delete', disabled, summary);
      const beforeDelete = storage.loadScenario('To Delete');

      storage.deleteScenario('To Delete');
      const afterDelete = storage.loadScenario('To Delete');

      return {
        existedBefore: !!beforeDelete,
        existsAfter: !!afterDelete
      };
    });

    expect(result.existedBefore).toBe(true);
    expect(result.existsAfter).toBe(false);
  });

});
```

**Expected Result:** 40/40 tests passing

**Run Command:**
```bash
npx playwright test tests/unit/phase3-js-modules.spec.js
```

---

## PHASE 4: Scenario Planner Page Unit Tests

**File:** `tests/unit/phase4-scenario-planner.spec.js`

**Purpose:** Test the complete scenario planner page integration

### Test Suite (50 Tests)

*Following same pattern - tests for:*
- Page loads correctly
- Left sidebar renders with all 46 checkboxes
- Category sections (Monthly, Biweekly, Recurring, Friday)
- Search functionality
- Filter buttons
- Preset buttons (Survival Mode, Aggressive Cutbacks)
- Checkbox toggle triggers recalculation
- Comparison view updates
- Delta badges show correct values
- Chart switcher works
- Scenario save/load functionality
- Export/import features
- Real-time updates (<500ms)
- No UI lag during rapid toggles

**Expected Result:** 50/50 tests passing

---

## PHASE 5: Navigation Page Unit Tests

**File:** `tests/unit/phase5-navigation.spec.js`

**Purpose:** Test landing page and cross-page navigation

### Test Suite (15 Tests)

*Tests for:*
- Landing page loads
- Navigation cards render
- Dashboard link works
- Scenario planner link works
- Theme persists across pages
- Back navigation works
- Page titles correct
- Footer displays

**Expected Result:** 15/15 tests passing

---

## PHASE 6: Integration Tests

**File:** `tests/unit/phase6-integration.spec.js`

**Purpose:** Test that all pages work together seamlessly

### Test Suite (30 Tests)

*Tests for:*
- Navigate from landing → dashboard → scenario planner → back
- Theme persists through full workflow
- Data consistency across pages
- No duplicate CSS loading
- No JavaScript conflicts
- SharedCSS applies to all pages
- Constants accessible everywhere
- LocalStorage works across pages

**Expected Result:** 30/30 tests passing

---

## PHASE 7: Agent Integration Tests

**File:** `tests/unit/phase7-agent-workflow.spec.js`

**Purpose:** Test that dashboard-updater agent still works

### Test Suite (10 Tests)

*Tests for:*
- Agent can update dashboard.html
- Transactions array updates
- ChartData updates
- Dashboard renders after agent update
- No breaking changes to agent workflow

**Expected Result:** 10/10 tests passing

---

## 🎯 Overall Testing Summary

| Phase | Test File | Test Count | Visual Snapshots |
|-------|-----------|------------|------------------|
| Phase 1 | phase1-shared-modules.spec.js | 10 | 0 |
| Phase 2 | phase2-dashboard-only.spec.js | 25 | 10 |
| Phase 3 | phase3-js-modules.spec.js | 40 | 0 |
| Phase 4 | phase4-scenario-planner.spec.js | 50 | 15 |
| Phase 5 | phase5-navigation.spec.js | 15 | 8 |
| Phase 6 | phase6-integration.spec.js | 30 | 5 |
| Phase 7 | phase7-agent-workflow.spec.js | 10 | 0 |
| **TOTAL** | **7 test files** | **180 tests** | **38 snapshots** |

---

## 🚀 Test Execution Workflow

### After Each Phase:

```bash
# Run phase-specific tests
npx playwright test tests/unit/phaseX-*.spec.js

# Verify all tests pass
# Check output: X/X passing

# If tests pass → git commit phase
# If tests fail → fix issues, re-run tests

# Move to next phase only after 100% pass rate
```

### Run All Tests:

```bash
npx playwright test tests/unit/
```

### Generate HTML Report:

```bash
npx playwright show-report
```

---

## ✅ Success Criteria

**Per Phase:**
- [ ] All unit tests passing (100%)
- [ ] No console errors
- [ ] Visual snapshots captured (if applicable)
- [ ] Test execution < 5 minutes

**Overall:**
- [ ] 180/180 tests passing
- [ ] 38/38 visual snapshots matching
- [ ] All phases validated independently
- [ ] Integration tests confirm multi-page works seamlessly
- [ ] Agent workflow still functional

---

## 📝 Notes

- Tests use Playwright's built-in assertions (no external libraries)
- Each test is independent (no shared state)
- Tests clear localStorage before running
- Visual snapshots use `animations: 'disabled'` for consistency
- Tests run in chromium only (Chrome desktop focus)
- Retry strategy: 2 retries on failure

**Ready for implementation!**
