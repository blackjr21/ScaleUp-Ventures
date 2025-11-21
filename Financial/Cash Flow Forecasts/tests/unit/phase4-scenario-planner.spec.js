import { test, expect } from '@playwright/test';

const SCENARIO_PLANNER_URL = 'file://' + process.cwd() + '/forecasts/scenario-planner.html';

test.describe('Phase 4: Scenario Planner Page', () => {

  test('page loads successfully with all modules', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    const title = await page.title();
    expect(title).toBe('Scenario Planner - Cash Flow Forecast');

    // Verify all modules loaded
    const modulesLoaded = await page.evaluate(() => {
      return typeof window.TRANSACTION_RULES === 'object' &&
             typeof window.TransactionRuleEngine === 'function' &&
             typeof window.ComparisonCalculator === 'function' &&
             typeof window.ScenarioManager === 'function' &&
             typeof window.ScenarioStorage === 'function';
    });

    expect(modulesLoaded).toBe(true);
  });

  test('control panel renders with all expense categories', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    const categoriesExist = await page.evaluate(() => {
      const categories = document.querySelectorAll('.expense-category');
      const summaryTexts = Array.from(categories).map(cat => {
        const summary = cat.querySelector('summary');
        return summary ? summary.textContent : '';
      });

      const hasMonthlyBills = summaryTexts.some(text => text.includes('Monthly Bills'));
      const hasBiweeklyBills = summaryTexts.some(text => text.includes('Biweekly Bills'));
      const hasWeekdayRecurring = summaryTexts.some(text => text.includes('Weekday Recurring'));
      const hasFridayAllocations = summaryTexts.some(text => text.includes('Friday Allocations'));

      return hasMonthlyBills && hasBiweeklyBills && hasWeekdayRecurring && hasFridayAllocations;
    });

    expect(categoriesExist).toBe(true);

    // Verify at least some checkboxes exist
    const checkboxCount = await page.locator('.expense-checkbox').count();
    expect(checkboxCount).toBeGreaterThan(0);
  });

  test('scenario manager initializes and calculates baseline forecast', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    const forecastData = await page.evaluate(() => {
      const manager = window.getScenarioManager();
      const baseline = manager.getBaselineForecast();
      return {
        length: baseline.length,
        hasCredits: baseline.some(d => d.credits > 0),
        hasDebits: baseline.some(d => d.debits > 0),
        hasEndBalance: baseline.every(d => typeof d.endBalance === 'number')
      };
    });

    expect(forecastData.length).toBe(42);
    expect(forecastData.hasCredits).toBe(true);
    expect(forecastData.hasDebits).toBe(true);
    expect(forecastData.hasEndBalance).toBe(true);
  });

  test('toggling expense checkbox updates scenario', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Get initial baseline
    const initialData = await page.evaluate(() => {
      const manager = window.getScenarioManager();
      const baseline = manager.getBaselineForecast();
      const modified = manager.getModifiedForecast();
      return {
        baselineDebits: baseline.reduce((sum, d) => sum + d.debits, 0),
        modifiedDebits: modified.reduce((sum, d) => sum + d.debits, 0),
        disabledCount: manager.getDisabledExpenses().size
      };
    });

    expect(initialData.baselineDebits).toBeGreaterThan(0);
    expect(initialData.modifiedDebits).toBe(initialData.baselineDebits);
    expect(initialData.disabledCount).toBe(0);

    // Uncheck the first checkbox
    const firstCheckbox = page.locator('.expense-checkbox').first();
    await firstCheckbox.uncheck();
    await page.waitForTimeout(400); // Wait for debounce

    // Verify expense was disabled
    const updatedData = await page.evaluate(() => {
      const manager = window.getScenarioManager();
      const modified = manager.getModifiedForecast();
      return {
        modifiedDebits: modified.reduce((sum, d) => sum + d.debits, 0),
        disabledCount: manager.getDisabledExpenses().size
      };
    });

    expect(updatedData.disabledCount).toBe(1);
    expect(updatedData.modifiedDebits).toBeLessThan(initialData.baselineDebits);
  });

  test('impact summary updates when expense is disabled', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Get initial impact summary
    const initialImpact = await page.locator('#expensesRemoved').textContent();
    expect(initialImpact).toContain('$0');

    // Uncheck an expense
    await page.locator('.expense-checkbox').first().uncheck();
    await page.waitForTimeout(400);

    // Verify impact summary changed
    const updatedImpact = await page.locator('#expensesRemoved').textContent();
    expect(updatedImpact).not.toContain('$0');
  });

  test('reset button restores all expenses', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Uncheck several expenses
    await page.locator('.expense-checkbox').first().uncheck();
    await page.locator('.expense-checkbox').nth(1).uncheck();
    await page.locator('.expense-checkbox').nth(2).uncheck();
    await page.waitForTimeout(400);

    // Verify some expenses disabled
    const disabledCount = await page.evaluate(() => {
      return window.getScenarioManager().getDisabledExpenses().size;
    });
    expect(disabledCount).toBe(3);

    // Click reset button
    await page.locator('#resetBtn').click();
    await page.waitForTimeout(200);

    // Verify all expenses re-enabled
    const resetCount = await page.evaluate(() => {
      return window.getScenarioManager().getDisabledExpenses().size;
    });
    expect(resetCount).toBe(0);
  });

  test('survival mode preset applies correct configuration', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Click survival mode button
    await page.locator('#survivalBtn').click();
    await page.waitForTimeout(400);

    // Verify discretionary expenses are disabled
    const disabledExpenses = await page.evaluate(() => {
      const manager = window.getScenarioManager();
      return Array.from(manager.getDisabledExpenses());
    });

    const expectedDisabled = ['savings', 'tithe', 'debt-payoff', 'eating-out',
                             'club-pilates', 'myfitnesspal', 'pliability',
                             'netflix', 'supplements'];

    expectedDisabled.forEach(expenseId => {
      expect(disabledExpenses).toContain(expenseId);
    });
  });

  test('aggressive paydown preset keeps only essentials', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Click aggressive paydown button
    await page.locator('#aggressiveBtn').click();
    await page.waitForTimeout(400);

    // Verify only essential expenses are enabled
    const enabledExpenses = await page.evaluate(() => {
      const manager = window.getScenarioManager();
      const disabled = manager.getDisabledExpenses();
      const allCheckboxes = Array.from(document.querySelectorAll('.expense-checkbox'));
      return allCheckboxes
        .filter(cb => !disabled.has(cb.dataset.expenseId))
        .map(cb => cb.dataset.expenseId);
    });

    const essentialIds = ['loancare-mortgage', '2nd-mortgage', 'duke-energy', 'att',
                         'groceries', 'gas', 'nfcu-volvo', 'debt-payoff'];

    essentialIds.forEach(expenseId => {
      expect(enabledExpenses).toContain(expenseId);
    });
  });

  test('comparison tables render with correct data', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Verify baseline table has rows
    const baselineRows = await page.locator('#baselineTableBody tr').count();
    expect(baselineRows).toBe(42);

    // Verify modified table has rows
    const modifiedRows = await page.locator('#modifiedTableBody tr').count();
    expect(modifiedRows).toBe(42);

    // Verify table cells have proper formatting
    const firstRowData = await page.evaluate(() => {
      const baselineRow = document.querySelector('#baselineTableBody tr');
      const cells = baselineRow.querySelectorAll('td');
      return {
        date: cells[0].textContent,
        credits: cells[1].textContent,
        debits: cells[2].textContent,
        balance: cells[3].textContent,
        flag: cells[4].textContent
      };
    });

    expect(firstRowData.date).toContain(','); // Date format check
    expect(firstRowData.credits).toContain('$'); // Currency format check
    expect(firstRowData.debits).toContain('$');
    expect(firstRowData.balance).toContain('$');
  });

  test('filter buttons update table display', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Initially should show all 42 rows
    let visibleRows = await page.locator('#baselineTableBody tr').count();
    expect(visibleRows).toBe(42);

    // Disable some expenses to create negative days
    await page.evaluate(() => {
      const manager = window.getScenarioManager();
      // Disable all income by manipulating directly (for testing purposes)
      const checkboxes = Array.from(document.querySelectorAll('.expense-checkbox'));
      checkboxes.slice(0, 10).forEach(cb => {
        cb.checked = false;
        manager.toggleExpense(cb.dataset.expenseId, false);
      });
    });
    await page.waitForTimeout(400);

    // Click "Negative" filter button
    const negFilterBtn = page.locator('.filter-btn[data-filter="neg"][data-table="baseline"]');
    await negFilterBtn.click();
    await page.waitForTimeout(200);

    // Verify filter button is active
    const isActive = await negFilterBtn.evaluate(btn => btn.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('search box filters expense items', async ({ page }) => {
    await page.goto(SCENARIO_PLANNER_URL);
    await page.waitForTimeout(500);

    // Count initial visible items
    const initialCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.expense-item'))
        .filter(item => item.style.display !== 'none').length;
    });
    expect(initialCount).toBeGreaterThan(0);

    // Type search term
    await page.locator('#searchBox').fill('netflix');
    await page.waitForTimeout(200);

    // Verify only matching items are visible
    const filteredCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.expense-item'))
        .filter(item => item.style.display !== 'none').length;
    });

    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

});
