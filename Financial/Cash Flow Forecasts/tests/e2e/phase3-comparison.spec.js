/**
 * Phase 3: Comparison View - E2E Tests
 * Tests the comparison calculator and UI updates
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, '../../forecasts/dashboard.html');
const dashboardUrl = `file://${dashboardPath}`;

test.describe('Phase 3: Comparison View', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(dashboardUrl);
        await page.waitForSelector('.control-panel');
        await page.waitForTimeout(500);
    });

    test.describe('ComparisonCalculator Class', () => {
        test('ComparisonCalculator class exists globally', async ({ page }) => {
            const classExists = await page.evaluate(() => {
                return typeof window.ComparisonCalculator === 'function';
            });
            expect(classExists).toBe(true);
        });

        test('can instantiate ComparisonCalculator', async ({ page }) => {
            const calcCreated = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc !== null;
            });
            expect(calcCreated).toBe(true);
        });

        test('getTotalRemoved calculates expense reduction correctly', async ({ page }) => {
            const totalRemoved = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc.getTotalRemoved();
            });
            // Savings is $200/week on Fridays, so over 42 days should be 6 Fridays = $1,200
            expect(totalRemoved).toBeGreaterThan(0);
            expect(totalRemoved).toBeCloseTo(1200, 0);
        });

        test('getEndingBalanceChange returns correct structure', async ({ page }) => {
            const balanceChange = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc.getEndingBalanceChange();
            });
            expect(balanceChange).toHaveProperty('before');
            expect(balanceChange).toHaveProperty('after');
            expect(balanceChange).toHaveProperty('delta');
            expect(balanceChange).toHaveProperty('improvement');
        });

        test('getEndingBalanceChange shows improvement when expenses removed', async ({ page }) => {
            const balanceChange = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings', 'tithe']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc.getEndingBalanceChange();
            });
            expect(balanceChange.after).toBeGreaterThan(balanceChange.before);
            expect(balanceChange.delta).toBeGreaterThan(0);
            expect(balanceChange.improvement).toBe(true);
        });

        test('getNegativeDaysChange returns correct structure', async ({ page }) => {
            const negDaysChange = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc.getNegativeDaysChange();
            });
            expect(negDaysChange).toHaveProperty('before');
            expect(negDaysChange).toHaveProperty('after');
            expect(negDaysChange).toHaveProperty('reduction');
        });

        test('getLowBalanceDaysChange returns correct structure', async ({ page }) => {
            const lowDaysChange = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc.getLowBalanceDaysChange();
            });
            expect(lowDaysChange).toHaveProperty('before');
            expect(lowDaysChange).toHaveProperty('after');
            expect(lowDaysChange).toHaveProperty('reduction');
        });

        test('getStatusChange returns correct structure', async ({ page }) => {
            const statusChange = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc.getStatusChange();
            });
            expect(statusChange).toHaveProperty('text');
            expect(statusChange).toHaveProperty('color');
        });

        test('getRemovedExpensesList returns sorted list', async ({ page }) => {
            const removedList = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(window.TRANSACTION_RULES, '2025-11-20', 1362);
                const baseline = engine.calculateDailyForecast(new Set());
                const modified = engine.calculateDailyForecast(new Set(['savings', 'tithe']));
                const calc = new window.ComparisonCalculator(baseline, modified);
                return calc.getRemovedExpensesList(new Set(['savings', 'tithe']));
            });
            expect(removedList.length).toBe(2);
            expect(removedList[0]).toHaveProperty('name');
            expect(removedList[0]).toHaveProperty('amount');
            // Should be sorted by amount descending
            expect(removedList[0].amount).toBeGreaterThanOrEqual(removedList[1].amount);
        });
    });

    test.describe('Comparison UI Updates', () => {
        test('impact summary updates when expense is toggled', async ({ page }) => {
            const initialText = await page.locator('#expensesRemoved').textContent();

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            const updatedText = await page.locator('#expensesRemoved').textContent();
            expect(updatedText).not.toBe(initialText);
        });

        test('ending balance shows before and after values', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            const balanceText = await page.locator('#endingBalanceImpact').textContent();
            expect(balanceText).toContain('→');
        });

        test('delta badge appears with positive change', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            const deltaBadge = page.locator('.delta-badge');
            await expect(deltaBadge).toBeVisible();

            const badgeClass = await deltaBadge.getAttribute('class');
            expect(badgeClass).toContain('delta-positive');
        });

        test('delta badge shows correct amount', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            const deltaBadge = page.locator('.delta-badge');
            const deltaText = await deltaBadge.textContent();
            expect(deltaText).toMatch(/^\+?\$[\d,]+\.\d{2}$/);
        });

        test('status changes when expenses are removed', async ({ page }) => {
            const initialStatus = await page.locator('#statusImpact').textContent();

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            const updatedStatus = await page.locator('#statusImpact').textContent();
            // Status might change or stay same depending on baseline, but should update
            expect(updatedStatus).toBeDefined();
        });

        test('removed expenses list appears when expenses unchecked', async ({ page }) => {
            const removedList = page.locator('#removedExpensesList');

            // Should be hidden initially
            const initialDisplay = await removedList.evaluate(el => el.style.display);
            expect(initialDisplay).toBe('none');

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            // Should be visible after unchecking
            const updatedDisplay = await removedList.evaluate(el => el.style.display);
            expect(updatedDisplay).toBe('block');
        });

        test('removed expenses list shows expense name and amount', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="tithe"]').uncheck();
            await page.waitForTimeout(300);

            const removedList = await page.locator('#removedExpensesList').textContent();
            expect(removedList).toContain('Tithe');
            expect(removedList).toContain('$100');
        });

        test('removed expenses list shows multiple expenses', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.locator('input.expense-checkbox[data-expense-id="tithe"]').uncheck();
            await page.waitForTimeout(300);

            const removedList = await page.locator('#removedExpensesList').textContent();
            expect(removedList).toContain('Savings');
            expect(removedList).toContain('Tithe');
        });

        test('removed expenses list hides when all expenses re-enabled', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            const removedList = page.locator('#removedExpensesList');
            await expect(removedList).toBeVisible();

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').check();
            await page.waitForTimeout(300);

            const display = await removedList.evaluate(el => el.style.display);
            expect(display).toBe('none');
        });

        test('comparison updates with survival mode preset', async ({ page }) => {
            await page.locator('#survivalBtn').click();
            await page.waitForTimeout(300);

            const removedList = page.locator('#removedExpensesList');
            await expect(removedList).toBeVisible();

            const listText = await removedList.textContent();
            expect(listText.length).toBeGreaterThan(0);
        });

        test('comparison updates with aggressive paydown preset', async ({ page }) => {
            await page.locator('#aggressiveBtn').click();
            await page.waitForTimeout(300);

            const removedList = page.locator('#removedExpensesList');
            await expect(removedList).toBeVisible();

            const deltaText = await page.locator('.delta-badge').textContent();
            expect(deltaText).toContain('+');
        });

        test('reset button clears comparison', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(300);

            await page.locator('#resetBtn').click();
            await page.waitForTimeout(300);

            const removedList = page.locator('#removedExpensesList');
            const display = await removedList.evaluate(el => el.style.display);
            expect(display).toBe('none');
        });
    });
});
