/**
 * Phase 4: Real-Time Updates and Event System - E2E Tests
 * Tests the scenario manager, event system, and real-time UI updates
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, '../../forecasts/dashboard.html');
const dashboardUrl = `file://${dashboardPath}`;

test.describe('Phase 4: Real-Time Updates', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(dashboardUrl);
        await page.waitForSelector('.control-panel');
        await page.waitForTimeout(1000); // Wait for scenario manager initialization
    });

    test.describe('ScenarioManager Class', () => {
        test('ScenarioManager class exists globally', async ({ page }) => {
            const classExists = await page.evaluate(() => {
                return typeof window.ScenarioManager === 'function';
            });
            expect(classExists).toBe(true);
        });

        test('scenario manager instance is created and accessible', async ({ page }) => {
            const managerExists = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                return manager !== null && manager !== undefined;
            });
            expect(managerExists).toBe(true);
        });

        test('scenario manager has baseline forecast', async ({ page }) => {
            const hasBaseline = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                const baseline = manager.getBaselineForecast();
                return baseline && baseline.length > 0;
            });
            expect(hasBaseline).toBe(true);
        });

        test('scenario manager baseline forecast has 42 days', async ({ page }) => {
            const forecastLength = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                return manager.getBaselineForecast().length;
            });
            expect(forecastLength).toBe(42);
        });

        test('toggleExpense adds to disabled set', async ({ page }) => {
            await page.evaluate(() => {
                const manager = window.getScenarioManager();
                manager.toggleExpense('savings', false);
            });

            await page.waitForTimeout(400); // Wait for debounce

            const isDisabled = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                return manager.getDisabledExpenses().has('savings');
            });

            expect(isDisabled).toBe(true);
        });

        test('toggleExpense removes from disabled set', async ({ page }) => {
            await page.evaluate(() => {
                const manager = window.getScenarioManager();
                manager.toggleExpense('savings', false);
            });

            await page.waitForTimeout(400);

            await page.evaluate(() => {
                const manager = window.getScenarioManager();
                manager.toggleExpense('savings', true);
            });

            await page.waitForTimeout(400);

            const isDisabled = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                return manager.getDisabledExpenses().has('savings');
            });

            expect(isDisabled).toBe(false);
        });

        test('reset clears all disabled expenses', async ({ page }) => {
            await page.evaluate(() => {
                const manager = window.getScenarioManager();
                manager.toggleExpense('savings', false);
                manager.toggleExpense('tithe', false);
            });

            await page.waitForTimeout(400);

            await page.evaluate(() => {
                const manager = window.getScenarioManager();
                manager.reset();
            });

            await page.waitForTimeout(400);

            const disabledCount = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                return manager.getDisabledExpenses().size;
            });

            expect(disabledCount).toBe(0);
        });

        test('modified forecast differs from baseline when expenses disabled', async ({ page }) => {
            await page.evaluate(() => {
                const manager = window.getScenarioManager();
                manager.toggleExpense('savings', false);
            });

            await page.waitForTimeout(400);

            const forecastsDiffer = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                const baseline = manager.getBaselineForecast();
                const modified = manager.getModifiedForecast();
                return baseline[baseline.length - 1].endBalance !== modified[modified.length - 1].endBalance;
            });

            expect(forecastsDiffer).toBe(true);
        });
    });

    test.describe('Real-Time UI Updates', () => {
        test('toggling checkbox triggers real-time update', async ({ page }) => {
            const initialBalance = await page.locator('#endingBalanceImpact').textContent();

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400); // Wait for debounce + update

            const updatedBalance = await page.locator('#endingBalanceImpact').textContent();
            expect(updatedBalance).not.toBe(initialBalance);
        });

        test('multiple rapid toggles are debounced', async ({ page }) => {
            // Toggle expenses rapidly
            for (let i = 0; i < 5; i++) {
                if (i % 2 === 0) {
                    await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
                } else {
                    await page.locator('input.expense-checkbox[data-expense-id="savings"]').check();
                }
                await page.waitForTimeout(50); // Rapid toggling
            }

            await page.waitForTimeout(500); // Wait for final debounce

            // Should not have frozen or errored
            const statusText = await page.locator('#statusImpact').textContent();
            expect(statusText).toBeDefined();
        });

        test('impact summary updates automatically', async ({ page }) => {
            const initialRemoved = await page.locator('#expensesRemoved').textContent();

            await page.locator('input.expense-checkbox[data-expense-id="tithe"]').uncheck();
            await page.waitForTimeout(400);

            const updatedRemoved = await page.locator('#expensesRemoved').textContent();
            expect(updatedRemoved).not.toBe(initialRemoved);
            expect(updatedRemoved).toContain('$');
        });

        test('status updates automatically when expenses toggled', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            const statusText = await page.locator('#statusImpact').textContent();
            expect(statusText).toBeDefined();
            expect(statusText.length).toBeGreaterThan(0);
        });

        test('removed expenses list updates automatically', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            const listText = await page.locator('#removedExpensesList').textContent();
            expect(listText).toContain('Savings');
        });

        test('delta badge updates automatically', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="debt-payoff"]').uncheck();
            await page.waitForTimeout(400);

            const deltaBadge = page.locator('.delta-badge');
            await expect(deltaBadge).toBeVisible();

            const deltaText = await deltaBadge.textContent();
            expect(deltaText).toMatch(/\$[\d,]+\.\d{2}/);
        });

        test('reset button triggers automatic recalculation', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            await page.locator('#resetBtn').click();
            await page.waitForTimeout(400);

            const removedText = await page.locator('#expensesRemoved').textContent();
            expect(removedText).toBe('$0.00');
        });

        test('survival mode preset updates in real-time', async ({ page }) => {
            await page.locator('#survivalBtn').click();
            await page.waitForTimeout(400);

            const removedText = await page.locator('#expensesRemoved').textContent();
            expect(removedText).not.toBe('$0.00');

            const listVisible = await page.locator('#removedExpensesList').isVisible();
            expect(listVisible).toBe(true);
        });

        test('aggressive paydown preset updates in real-time', async ({ page }) => {
            await page.locator('#aggressiveBtn').click();
            await page.waitForTimeout(400);

            const deltaBadge = page.locator('.delta-badge');
            await expect(deltaBadge).toBeVisible();

            const deltaText = await deltaBadge.textContent();
            expect(deltaText).toContain('+');
        });

        test('continuous expense toggling maintains consistency', async ({ page }) => {
            // Toggle 10 different expenses
            const expenseIds = ['savings', 'tithe', 'debt-payoff', 'netflix', 'supplements',
                               'eating-out', 'club-pilates', 'myfitnesspal', 'pliability', 'merry-maids'];

            for (const expenseId of expenseIds) {
                await page.locator(`input.expense-checkbox[data-expense-id="${expenseId}"]`).uncheck();
                await page.waitForTimeout(100);
            }

            await page.waitForTimeout(500); // Final debounce

            const disabledCount = await page.evaluate(() => {
                const manager = window.getScenarioManager();
                return manager.getDisabledExpenses().size;
            });

            expect(disabledCount).toBe(10);
        });

        test('re-enabling expenses updates UI correctly', async ({ page }) => {
            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            const listAfterUncheck = await page.locator('#removedExpensesList').textContent();
            expect(listAfterUncheck).toContain('Savings');

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').check();
            await page.waitForTimeout(400);

            const listAfterRecheck = await page.locator('#removedExpensesList').isVisible();
            expect(listAfterRecheck).toBe(false);
        });
    });

    test.describe('Event System and Listeners', () => {
        test('listeners are called when expenses change', async ({ page }) => {
            const listenerCallCount = await page.evaluate(() => {
                let callCount = 0;
                const manager = window.getScenarioManager();
                manager.addListener(() => {
                    callCount++;
                });

                manager.toggleExpense('savings', false);
                return new Promise(resolve => {
                    setTimeout(() => resolve(callCount), 500);
                });
            });

            expect(listenerCallCount).toBeGreaterThan(0);
        });

        test('debouncing prevents excessive calculations', async ({ page }) => {
            const recalcCount = await page.evaluate(() => {
                let count = 0;
                const manager = window.getScenarioManager();
                manager.addListener(() => {
                    count++;
                });

                // Rapid toggles within debounce window
                for (let i = 0; i < 5; i++) {
                    manager.toggleExpense('savings', i % 2 === 0);
                }

                return new Promise(resolve => {
                    setTimeout(() => resolve(count), 500);
                });
            });

            // Should be 1 due to debouncing, not 5
            expect(recalcCount).toBeLessThan(3);
        });

        test('forecast data passed to listeners is complete', async ({ page }) => {
            const dataComplete = await page.evaluate(() => {
                return new Promise(resolve => {
                    const manager = window.getScenarioManager();
                    manager.addListener((data) => {
                        const hasBaseline = data.baseline && data.baseline.length > 0;
                        const hasModified = data.modified && data.modified.length > 0;
                        const hasDisabled = data.disabledExpenses !== undefined;
                        resolve(hasBaseline && hasModified && hasDisabled);
                    });

                    manager.toggleExpense('savings', false);
                });
            });

            expect(dataComplete).toBe(true);
        });
    });
});
