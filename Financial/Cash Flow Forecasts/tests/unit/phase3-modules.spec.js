import { test, expect } from '@playwright/test';

const TEST_HARNESS_URL = 'file://' + process.cwd() + '/forecasts/test-harness-phase3.html';

test.describe('Phase 3: Scenario Planner Modules', () => {

  test('transaction-rules.js - exports TRANSACTION_RULES object', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const rulesExist = await page.evaluate(() => {
      return typeof window.TRANSACTION_RULES === 'object' &&
             Array.isArray(window.TRANSACTION_RULES.monthlyBills) &&
             Array.isArray(window.TRANSACTION_RULES.biweeklyBills);
    });

    expect(rulesExist).toBe(true);
  });

  test('transaction-engine.js - TransactionRuleEngine class exists', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const engineExists = await page.evaluate(() => {
      return typeof window.TransactionRuleEngine === 'function';
    });

    expect(engineExists).toBe(true);
  });

  test('transaction-engine.js - calculates 42-day forecast', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const forecastLength = await page.evaluate(() => {
      const engine = new window.TransactionRuleEngine(
        window.TRANSACTION_RULES,
        '2025-11-21',
        800
      );
      const forecast = engine.calculateDailyForecast(new Set());
      return forecast.length;
    });

    expect(forecastLength).toBe(42);
  });

  test('transaction-engine.js - biweekly math works correctly', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const biweeklyTest = await page.evaluate(() => {
      const engine = new window.TransactionRuleEngine(
        window.TRANSACTION_RULES,
        '2025-11-21',
        800
      );

      // Check if Nov 28 is a biweekly date (anchor 2025-11-28)
      const testDate = new Date('2025-11-28T12:00:00');
      return engine.isBiweeklyDue(testDate, '2025-11-28');
    });

    expect(biweeklyTest).toBe(true);
  });

  test('comparison-calc.js - ComparisonCalculator class exists', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const calcExists = await page.evaluate(() => {
      return typeof window.ComparisonCalculator === 'function';
    });

    expect(calcExists).toBe(true);
  });

  test('comparison-calc.js - calculates total removed correctly', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const totalRemoved = await page.evaluate(() => {
      const baseline = [
        { debits: 100 },
        { debits: 200 }
      ];
      const modified = [
        { debits: 50 },
        { debits: 150 }
      ];
      const calc = new window.ComparisonCalculator(baseline, modified);
      return calc.getTotalRemoved();
    });

    expect(totalRemoved).toBe(100);
  });

  test('scenario-manager.js - ScenarioManager class exists', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const managerExists = await page.evaluate(() => {
      return typeof window.ScenarioManager === 'function';
    });

    expect(managerExists).toBe(true);
  });

  test('scenario-manager.js - toggles expenses correctly', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const toggleWorks = await page.evaluate(() => {
      const manager = new window.ScenarioManager(
        window.TRANSACTION_RULES,
        '2025-11-21',
        800
      );

      manager.toggleExpense('netflix', false);
      return manager.getDisabledExpenses().has('netflix');
    });

    expect(toggleWorks).toBe(true);
  });

  test('scenario-storage.js - ScenarioStorage class exists', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const storageExists = await page.evaluate(() => {
      return typeof window.ScenarioStorage === 'function';
    });

    expect(storageExists).toBe(true);
  });

  test('scenario-storage.js - saves and loads scenarios', async ({ page }) => {
    await page.goto(TEST_HARNESS_URL);
    await page.waitForFunction(() => window.testReady);

    const saveLoadWorks = await page.evaluate(() => {
      localStorage.clear();

      const storage = new window.ScenarioStorage();
      const testExpenses = new Set(['netflix', 'spotify']);

      storage.saveScenario('Test Scenario', testExpenses, { saved: true });
      const loaded = storage.loadScenario('Test Scenario');

      return loaded && loaded.disabledExpenses.length === 2;
    });

    expect(saveLoadWorks).toBe(true);
  });

});
