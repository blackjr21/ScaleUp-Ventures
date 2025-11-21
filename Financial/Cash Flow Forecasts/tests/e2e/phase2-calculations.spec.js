/**
 * Phase 2: Parser + Calculation Engine - E2E Tests
 * Tests the transaction rule parser and calculation engine
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, '../../forecasts/dashboard.html');
const dashboardUrl = `file://${dashboardPath}`;

test.describe('Phase 2: Parser + Calculation Engine', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(dashboardUrl);
        await page.waitForSelector('.control-panel');
        await page.waitForTimeout(500);
    });

    test.describe('Transaction Rules Parser', () => {
        test('TRANSACTION_RULES object exists globally', async ({ page }) => {
            const rulesExist = await page.evaluate(() => {
                return typeof window.TRANSACTION_RULES !== 'undefined';
            });
            expect(rulesExist).toBe(true);
        });

        test('parser reads all monthly bills correctly', async ({ page }) => {
            const monthlyBillsCount = await page.evaluate(() => {
                return window.TRANSACTION_RULES.monthlyBills.length;
            });
            expect(monthlyBillsCount).toBe(34);
        });

        test('parser reads all biweekly bills correctly', async ({ page }) => {
            const biweeklyBillsCount = await page.evaluate(() => {
                return window.TRANSACTION_RULES.biweeklyBills.length;
            });
            expect(biweeklyBillsCount).toBe(7);
        });

        test('parser reads weekday recurring correctly', async ({ page }) => {
            const weekdayCount = await page.evaluate(() => {
                return window.TRANSACTION_RULES.weekdayRecurring.length;
            });
            expect(weekdayCount).toBe(1);
        });

        test('parser reads Friday allocations correctly', async ({ page }) => {
            const fridayCount = await page.evaluate(() => {
                return window.TRANSACTION_RULES.fridayAllocations.length;
            });
            expect(fridayCount).toBe(3);
        });

        test('parser reads biweekly inflows correctly', async ({ page }) => {
            const inflowsCount = await page.evaluate(() => {
                return window.TRANSACTION_RULES.biweeklyInflows.length;
            });
            expect(inflowsCount).toBe(3);
        });

        test('parser reads monthly inflows correctly', async ({ page }) => {
            const monthlyInflowsCount = await page.evaluate(() => {
                return window.TRANSACTION_RULES.monthlyInflows.length;
            });
            expect(monthlyInflowsCount).toBe(1);
        });

        test('monthly bills have correct structure', async ({ page }) => {
            const firstBill = await page.evaluate(() => {
                return window.TRANSACTION_RULES.monthlyBills[0];
            });
            expect(firstBill).toHaveProperty('id');
            expect(firstBill).toHaveProperty('name');
            expect(firstBill).toHaveProperty('amount');
            expect(firstBill).toHaveProperty('day');
        });

        test('biweekly bills have correct structure with anchor dates', async ({ page }) => {
            const firstBiweekly = await page.evaluate(() => {
                return window.TRANSACTION_RULES.biweeklyBills[0];
            });
            expect(firstBiweekly).toHaveProperty('id');
            expect(firstBiweekly).toHaveProperty('name');
            expect(firstBiweekly).toHaveProperty('amount');
            expect(firstBiweekly).toHaveProperty('anchor');
            expect(firstBiweekly.anchor).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        test('one-time adjustments are loaded', async ({ page }) => {
            const adjustments = await page.evaluate(() => {
                return window.TRANSACTION_RULES.oneTimeAdjustments;
            });
            expect(adjustments['2025-11-20']).toBeDefined();
            expect(adjustments['2025-11-21']).toBeDefined();
            expect(adjustments['2025-11-25']).toBeDefined();
            expect(adjustments['2025-11-28']).toBeDefined();
        });
    });

    test.describe('TransactionRuleEngine Class', () => {
        test('TransactionRuleEngine class exists globally', async ({ page }) => {
            const classExists = await page.evaluate(() => {
                return typeof window.TransactionRuleEngine === 'function';
            });
            expect(classExists).toBe(true);
        });

        test('can instantiate TransactionRuleEngine', async ({ page }) => {
            const engineCreated = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                return engine !== null;
            });
            expect(engineCreated).toBe(true);
        });

        test('engine stores start date correctly', async ({ page }) => {
            const startDate = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                return engine.startDate.toISOString().split('T')[0];
            });
            expect(startDate).toBe('2025-11-20');
        });

        test('engine stores start balance correctly', async ({ page }) => {
            const startBalance = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                return engine.startBalance;
            });
            expect(startBalance).toBe(1362);
        });
    });

    test.describe('Calculation Logic', () => {
        test('forecast produces exactly 42 days by default', async ({ page }) => {
            const forecastLength = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());
                return forecast.length;
            });
            expect(forecastLength).toBe(42);
        });

        test('forecast supports custom day count', async ({ page }) => {
            const forecastLength = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set(), 30);
                return forecast.length;
            });
            expect(forecastLength).toBe(30);
        });

        test('first day has correct start balance', async ({ page }) => {
            const firstDay = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());
                return forecast[0];
            });
            expect(firstDay.startBalance).toBe(1362);
        });

        test('each day has required properties', async ({ page }) => {
            const firstDay = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());
                return forecast[0];
            });
            expect(firstDay).toHaveProperty('date');
            expect(firstDay).toHaveProperty('startBalance');
            expect(firstDay).toHaveProperty('credits');
            expect(firstDay).toHaveProperty('debits');
            expect(firstDay).toHaveProperty('endBalance');
            expect(firstDay).toHaveProperty('flag');
            expect(firstDay).toHaveProperty('creditNames');
            expect(firstDay).toHaveProperty('debitNames');
        });

        test('balance calculation is correct (endBalance = startBalance + credits - debits)', async ({ page }) => {
            const isCorrect = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());
                // Check all days
                return forecast.every(day => {
                    const calculated = day.startBalance + day.credits - day.debits;
                    return Math.abs(calculated - day.endBalance) < 0.01;
                });
            });
            expect(isCorrect).toBe(true);
        });

        test('daily balance chain is continuous', async ({ page }) => {
            const isChainValid = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());
                // Check that each day's ending balance equals next day's starting balance
                for (let i = 0; i < forecast.length - 1; i++) {
                    if (Math.abs(forecast[i].endBalance - forecast[i + 1].startBalance) > 0.01) {
                        return false;
                    }
                }
                return true;
            });
            expect(isChainValid).toBe(true);
        });

        test('biweekly date math is correct', async ({ page }) => {
            const biweeklyTest = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                // Test if Nov 28 is biweekly from anchor Nov 28
                const testDate = new Date('2025-11-28T12:00:00');
                return engine.isBiweeklyDue(testDate, '2025-11-28');
            });
            expect(biweeklyTest).toBe(true);
        });

        test('biweekly date math correctly identifies non-due dates', async ({ page }) => {
            const notDue = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                // Test if Nov 27 is NOT biweekly from anchor Nov 28
                const testDate = new Date('2025-11-27T12:00:00');
                return engine.isBiweeklyDue(testDate, '2025-11-28');
            });
            expect(notDue).toBe(false);
        });

        test('flag LOW is set when balance < $500', async ({ page }) => {
            const flag = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                return engine.getFlag(300);
            });
            expect(flag).toBe('LOW');
        });

        test('flag NEG is set when balance < $0', async ({ page }) => {
            const flag = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                return engine.getFlag(-100);
            });
            expect(flag).toBe('NEG');
        });

        test('flag is empty when balance >= $500', async ({ page }) => {
            const flag = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                return engine.getFlag(1000);
            });
            expect(flag).toBe('');
        });

        test('disabled expenses are excluded from calculations', async ({ page }) => {
            const comparison = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const baselineForecast = engine.calculateDailyForecast(new Set());
                const modifiedForecast = engine.calculateDailyForecast(new Set(['savings']));

                return {
                    baselineEnding: baselineForecast[baselineForecast.length - 1].endBalance,
                    modifiedEnding: modifiedForecast[modifiedForecast.length - 1].endBalance,
                    difference: modifiedForecast[modifiedForecast.length - 1].endBalance -
                                baselineForecast[baselineForecast.length - 1].endBalance
                };
            });

            // Disabling savings should increase ending balance
            expect(comparison.modifiedEnding).toBeGreaterThan(comparison.baselineEnding);
            // Difference should be positive (saved money)
            expect(comparison.difference).toBeGreaterThan(0);
        });

        test('multiple disabled expenses compound the savings', async ({ page }) => {
            const comparison = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const baselineForecast = engine.calculateDailyForecast(new Set());
                const oneDisabled = engine.calculateDailyForecast(new Set(['savings']));
                const twoDisabled = engine.calculateDailyForecast(new Set(['savings', 'tithe']));

                return {
                    baselineEnding: baselineForecast[baselineForecast.length - 1].endBalance,
                    oneDisabledEnding: oneDisabled[oneDisabled.length - 1].endBalance,
                    twoDisabledEnding: twoDisabled[twoDisabled.length - 1].endBalance
                };
            });

            expect(comparison.twoDisabledEnding).toBeGreaterThan(comparison.oneDisabledEnding);
            expect(comparison.oneDisabledEnding).toBeGreaterThan(comparison.baselineEnding);
        });

        test('weekday recurring only appears Mon-Fri', async ({ page }) => {
            const weekdayTest = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20', // This is a Thursday
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());

                // Check Nov 20 (Thu), Nov 21 (Fri), Nov 22 (Sat), Nov 23 (Sun), Nov 24 (Mon)
                return {
                    thursday: forecast[0].debitNames.includes('NFCU'),
                    friday: forecast[1].debitNames.includes('NFCU'),
                    saturday: forecast[2].debitNames.includes('NFCU'),
                    sunday: forecast[3].debitNames.includes('NFCU'),
                    monday: forecast[4].debitNames.includes('NFCU')
                };
            });

            expect(weekdayTest.thursday).toBe(true);
            expect(weekdayTest.friday).toBe(true);
            expect(weekdayTest.saturday).toBe(false);
            expect(weekdayTest.sunday).toBe(false);
            expect(weekdayTest.monday).toBe(true);
        });

        test('Friday allocations only appear on Fridays', async ({ page }) => {
            const fridayTest = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20', // Thursday
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());

                return {
                    thursday: forecast[0].debitNames.includes('Savings'),
                    friday: forecast[1].debitNames.includes('Savings'),
                    saturday: forecast[2].debitNames.includes('Savings')
                };
            });

            expect(fridayTest.thursday).toBe(false);
            expect(fridayTest.friday).toBe(true);
            expect(fridayTest.saturday).toBe(false);
        });

        test('monthly bills appear on correct day of month', async ({ page }) => {
            const monthlyTest = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-28',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());

                // Find Dec 1 in forecast (should be day 4: Nov 28, 29, 30, Dec 1)
                const dec1 = forecast[3];
                return {
                    date: dec1.date,
                    hasVitruvian: dec1.debitNames.includes('Vitruvian'),
                    hasTransamerica: dec1.debitNames.includes('TRANSAMERICA')
                };
            });

            expect(monthlyTest.date).toBe('2025-12-01');
            expect(monthlyTest.hasVitruvian).toBe(true);
            expect(monthlyTest.hasTransamerica).toBe(true);
        });

        test('one-time adjustments are applied correctly', async ({ page }) => {
            const adjustmentTest = await page.evaluate(() => {
                const engine = new window.TransactionRuleEngine(
                    window.TRANSACTION_RULES,
                    '2025-11-20',
                    1362
                );
                const forecast = engine.calculateDailyForecast(new Set());

                // Nov 20 should have early transfer
                return {
                    nov20Credits: forecast[0].credits,
                    nov20HasTransfer: forecast[0].creditNames.includes('Early')
                };
            });

            expect(adjustmentTest.nov20HasTransfer).toBe(true);
            expect(adjustmentTest.nov20Credits).toBe(1000);
        });
    });
});
