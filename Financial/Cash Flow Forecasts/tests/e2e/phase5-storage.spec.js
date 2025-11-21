/**
 * Phase 5: Scenario Storage and Management - E2E Tests
 * Tests localStorage persistence, scenario saving/loading, and management features
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, '../../forecasts/dashboard.html');
const dashboardUrl = `file://${dashboardPath}`;

test.describe('Phase 5: Scenario Storage', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto(dashboardUrl);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForSelector('.control-panel');
        await page.waitForTimeout(1000);
    });

    test.describe('ScenarioStorage Class', () => {
        test('ScenarioStorage class exists globally', async ({ page }) => {
            const classExists = await page.evaluate(() => {
                return typeof window.ScenarioStorage === 'function';
            });
            expect(classExists).toBe(true);
        });

        test('scenario storage instance is accessible', async ({ page }) => {
            const storageExists = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage !== null && storage !== undefined;
            });
            expect(storageExists).toBe(true);
        });

        test('can save scenario to localStorage', async ({ page }) => {
            const saved = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                const disabledExpenses = new Set(['savings', 'tithe']);
                const summary = { totalRemoved: 1800, endingBalance: 2500, delta: 1800 };
                return storage.saveScenario('Test Scenario', disabledExpenses, summary);
            });

            expect(saved).toBe(true);
        });

        test('saved scenario persists in localStorage', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                const disabledExpenses = new Set(['savings']);
                const summary = { totalRemoved: 1200 };
                storage.saveScenario('Persist Test', disabledExpenses, summary);
            });

            const persisted = await page.evaluate(() => {
                const data = localStorage.getItem('cashflow-scenarios');
                return data !== null && data.includes('Persist Test');
            });

            expect(persisted).toBe(true);
        });

        test('can load saved scenario', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                const disabledExpenses = new Set(['savings', 'tithe']);
                const summary = { totalRemoved: 1800 };
                storage.saveScenario('Load Test', disabledExpenses, summary);
            });

            const loaded = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.loadScenario('Load Test');
            });

            expect(loaded).toBeDefined();
            expect(loaded.disabledExpenses).toHaveLength(2);
            expect(loaded.summary.totalRemoved).toBe(1800);
        });

        test('loading non-existent scenario returns null', async ({ page }) => {
            const result = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.loadScenario('NonExistent');
            });

            expect(result).toBeNull();
        });

        test('can delete saved scenario', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.saveScenario('Delete Me', new Set(['savings']), {});
            });

            const deleted = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.deleteScenario('Delete Me');
                return storage.loadScenario('Delete Me');
            });

            expect(deleted).toBeNull();
        });

        test('getAllScenarios returns all saved scenarios', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.saveScenario('Scenario 1', new Set(['savings']), {});
                storage.saveScenario('Scenario 2', new Set(['tithe']), {});
                storage.saveScenario('Scenario 3', new Set(['debt-payoff']), {});
            });

            const allScenarios = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.getAllScenarios();
            });

            expect(Object.keys(allScenarios)).toHaveLength(3);
            expect(allScenarios['Scenario 1']).toBeDefined();
            expect(allScenarios['Scenario 2']).toBeDefined();
            expect(allScenarios['Scenario 3']).toBeDefined();
        });

        test('scenarioExists checks correctly', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.saveScenario('Exists Test', new Set(), {});
            });

            const exists = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return {
                    existing: storage.scenarioExists('Exists Test'),
                    nonExisting: storage.scenarioExists('Not There')
                };
            });

            expect(exists.existing).toBe(true);
            expect(exists.nonExisting).toBe(false);
        });

        test('saved scenario includes timestamp', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.saveScenario('Timestamp Test', new Set(), {});
            });

            const scenario = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.loadScenario('Timestamp Test');
            });

            expect(scenario.savedAt).toBeDefined();
            expect(new Date(scenario.savedAt)).toBeInstanceOf(Date);
        });

        test('overwriting scenario updates data', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.saveScenario('Overwrite Test', new Set(['savings']), { value: 1 });
                storage.saveScenario('Overwrite Test', new Set(['tithe']), { value: 2 });
            });

            const scenario = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.loadScenario('Overwrite Test');
            });

            expect(scenario.disabledExpenses).toHaveLength(1);
            expect(scenario.disabledExpenses[0]).toBe('tithe');
            expect(scenario.summary.value).toBe(2);
        });
    });

    test.describe('Save Button Integration', () => {
        test('save button exists and is clickable', async ({ page }) => {
            const saveBtn = page.locator('#saveBtn');
            await expect(saveBtn).toBeVisible();
            await expect(saveBtn).toBeEnabled();
        });

        test('save button triggers save dialog', async ({ page }) => {
            // Set up dialog handler
            let dialogAppeared = false;
            page.on('dialog', async dialog => {
                dialogAppeared = true;
                await dialog.dismiss();
            });

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            await page.locator('#saveBtn').click();
            await page.waitForTimeout(200);

            expect(dialogAppeared).toBe(true);
        });

        test('saving with valid name stores scenario', async ({ page }) => {
            page.on('dialog', async dialog => {
                await dialog.accept('My Test Scenario');
            });

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            await page.locator('#saveBtn').click();
            await page.waitForTimeout(500);

            const scenarioSaved = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.scenarioExists('My Test Scenario');
            });

            expect(scenarioSaved).toBe(true);
        });

        test('saved scenario contains disabled expenses', async ({ page }) => {
            page.on('dialog', async dialog => {
                await dialog.accept('Expense Test');
            });

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.locator('input.expense-checkbox[data-expense-id="tithe"]').uncheck();
            await page.waitForTimeout(400);

            await page.locator('#saveBtn').click();
            await page.waitForTimeout(500);

            const savedExpenses = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                const scenario = storage.loadScenario('Expense Test');
                return scenario.disabledExpenses;
            });

            expect(savedExpenses).toContain('savings');
            expect(savedExpenses).toContain('tithe');
        });

        test('saved scenario includes summary data', async ({ page }) => {
            page.on('dialog', async dialog => {
                await dialog.accept('Summary Test');
            });

            await page.locator('input.expense-checkbox[data-expense-id="debt-payoff"]').uncheck();
            await page.waitForTimeout(400);

            await page.locator('#saveBtn').click();
            await page.waitForTimeout(500);

            const summary = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                const scenario = storage.loadScenario('Summary Test');
                return scenario.summary;
            });

            expect(summary.totalRemoved).toBeGreaterThan(0);
            expect(summary.endingBalance).toBeDefined();
            expect(summary.delta).toBeDefined();
            expect(summary.expenseCount).toBe(1);
        });

        test('canceling save dialog does not create scenario', async ({ page }) => {
            page.on('dialog', async dialog => {
                await dialog.dismiss();
            });

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            await page.locator('#saveBtn').click();
            await page.waitForTimeout(500);

            const scenarioCount = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return Object.keys(storage.getAllScenarios()).length;
            });

            expect(scenarioCount).toBe(0);
        });

        test('empty scenario name does not save', async ({ page }) => {
            page.on('dialog', async dialog => {
                await dialog.accept('');
            });

            await page.locator('input.expense-checkbox[data-expense-id="savings"]').uncheck();
            await page.waitForTimeout(400);

            await page.locator('#saveBtn').click();
            await page.waitForTimeout(500);

            const scenarioCount = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return Object.keys(storage.getAllScenarios()).length;
            });

            expect(scenarioCount).toBe(0);
        });
    });

    test.describe('Scenario Persistence', () => {
        test('scenarios persist across page reloads', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.saveScenario('Persist Reload', new Set(['savings']), { value: 100 });
            });

            await page.reload();
            await page.waitForTimeout(1000);

            const stillExists = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.scenarioExists('Persist Reload');
            });

            expect(stillExists).toBe(true);
        });

        test('multiple scenarios can coexist', async ({ page }) => {
            await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                storage.saveScenario('Scenario A', new Set(['savings']), {});
                storage.saveScenario('Scenario B', new Set(['tithe']), {});
                storage.saveScenario('Scenario C', new Set(['debt-payoff']), {});
            });

            const count = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return Object.keys(storage.getAllScenarios()).length;
            });

            expect(count).toBe(3);
        });

        test('scenario data integrity after reload', async ({ page }) => {
            const originalData = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                const disabledExpenses = new Set(['savings', 'tithe', 'debt-payoff']);
                const summary = { totalRemoved: 7800, endingBalance: 5432.10, delta: 7800 };
                storage.saveScenario('Integrity Test', disabledExpenses, summary);
                return storage.loadScenario('Integrity Test');
            });

            await page.reload();
            await page.waitForTimeout(1000);

            const reloadedData = await page.evaluate(() => {
                const storage = window.getScenarioStorage();
                return storage.loadScenario('Integrity Test');
            });

            expect(reloadedData.disabledExpenses).toEqual(originalData.disabledExpenses);
            expect(reloadedData.summary.totalRemoved).toBe(originalData.summary.totalRemoved);
            expect(reloadedData.summary.endingBalance).toBe(originalData.summary.endingBalance);
        });
    });
});
