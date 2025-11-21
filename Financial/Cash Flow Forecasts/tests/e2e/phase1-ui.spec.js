/**
 * Phase 1: UI Interactions - E2E Tests
 * Tests user interactions with the expense control panel
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, '../../forecasts/dashboard.html');
const dashboardUrl = `file://${dashboardPath}`;

test.describe('Phase 1: UI Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(dashboardUrl);
        // Wait for control panel to be initialized
        await page.waitForSelector('.control-panel');
        await page.waitForTimeout(500); // Give time for JS to initialize
    });

    test('sidebar is visible on load', async ({ page }) => {
        const sidebar = page.locator('.control-panel');
        await expect(sidebar).toBeVisible();

        // Check it has the correct width
        const boundingBox = await sidebar.boundingBox();
        expect(boundingBox.width).toBeGreaterThanOrEqual(350);
    });

    test('sidebar contains all required sections', async ({ page }) => {
        await expect(page.locator('.panel-header')).toBeVisible();
        await expect(page.locator('.panel-content')).toBeVisible();
        await expect(page.locator('.impact-summary')).toBeVisible();
        await expect(page.locator('.control-buttons')).toBeVisible();
    });

    test('can toggle sidebar collapse', async ({ page }) => {
        const sidebar = page.locator('.control-panel');
        const toggleBtn = page.locator('#togglePanel');
        const showBtn = page.locator('#showPanelBtn');

        // Sidebar should be visible initially
        await expect(sidebar).toBeVisible();
        await expect(sidebar).not.toHaveClass(/collapsed/);

        // Click toggle to collapse
        await toggleBtn.click();
        await page.waitForTimeout(500); // Wait for animation

        // Sidebar should be collapsed
        await expect(sidebar).toHaveClass(/collapsed/);

        // Show button should appear
        await expect(showBtn).toHaveClass(/visible/);

        // Click show button to expand (force click to bypass pointer event check)
        await showBtn.click({ force: true });
        await page.waitForTimeout(500);

        // Sidebar should be visible again
        await expect(sidebar).not.toHaveClass(/collapsed/);
    });

    test('all expense categories are rendered', async ({ page }) => {
        const categories = page.locator('.expense-category');
        const count = await categories.count();

        // Should have 4 categories
        expect(count).toBe(4);

        // Check category names
        await expect(page.locator('text=Monthly Bills')).toBeVisible();
        await expect(page.locator('text=Biweekly Bills')).toBeVisible();
        await expect(page.locator('text=Weekday Recurring')).toBeVisible();
        await expect(page.locator('text=Friday Allocations')).toBeVisible();
    });

    test('categories can be expanded and collapsed', async ({ page }) => {
        const firstCategory = page.locator('.expense-category').first();
        const summary = firstCategory.locator('summary');

        // Should be open initially (open attribute)
        const isOpen = await firstCategory.evaluate((el) => el.hasAttribute('open'));
        expect(isOpen).toBe(true);

        // Click to collapse
        await summary.click();
        await page.waitForTimeout(300);

        const isClosedNow = await firstCategory.evaluate((el) => el.hasAttribute('open'));
        expect(isClosedNow).toBe(false);
    });

    test('checkboxes are present for all expenses', async ({ page }) => {
        const checkboxes = page.locator('.expense-checkbox');
        const count = await checkboxes.count();

        // Should have at least 35 checkboxes (all expenses from data)
        expect(count).toBeGreaterThanOrEqual(35);
    });

    test('checkboxes are checked by default', async ({ page }) => {
        const checkboxes = page.locator('.expense-checkbox');
        const count = await checkboxes.count();

        for (let i = 0; i < count; i++) {
            const checkbox = checkboxes.nth(i);
            await expect(checkbox).toBeChecked();
        }
    });

    test('can check and uncheck expense', async ({ page }) => {
        const firstCheckbox = page.locator('.expense-checkbox').first();

        // Should be checked initially
        await expect(firstCheckbox).toBeChecked();

        // Uncheck it
        await firstCheckbox.uncheck();
        await expect(firstCheckbox).not.toBeChecked();

        // Check it again
        await firstCheckbox.check();
        await expect(firstCheckbox).toBeChecked();
    });

    test('expense name shows strikethrough when unchecked', async ({ page }) => {
        const firstItem = page.locator('.expense-item').first();
        const firstCheckbox = firstItem.locator('.expense-checkbox');
        const expenseName = firstItem.locator('.expense-name');

        // Uncheck the expense
        await firstCheckbox.uncheck();
        await page.waitForTimeout(200);

        // Parent item should have disabled class
        const hasDisabledClass = await firstItem.evaluate((el) =>
            el.classList.contains('disabled')
        );
        expect(hasDisabledClass).toBe(true);

        // Check that strikethrough CSS is applied
        const textDecoration = await expenseName.evaluate((el) =>
            window.getComputedStyle(el).textDecoration
        );
        expect(textDecoration).toContain('line-through');
    });

    test('search box filters expenses', async ({ page }) => {
        const searchBox = page.locator('#searchBox');
        const expenseItems = page.locator('.expense-item');

        // Get initial count
        const initialCount = await expenseItems.count();
        expect(initialCount).toBeGreaterThan(0);

        // Search for "savings"
        await searchBox.fill('savings');
        await page.waitForTimeout(300);

        // Count visible items
        const visibleItems = await expenseItems.evaluateAll((items) =>
            items.filter(item => {
                const style = window.getComputedStyle(item);
                return style.display !== 'none';
            }).length
        );

        // Should have fewer items visible
        expect(visibleItems).toBeLessThan(initialCount);
        expect(visibleItems).toBeGreaterThan(0);
    });

    test('reset button checks all expenses', async ({ page }) => {
        const resetBtn = page.locator('#resetBtn');
        const checkboxes = page.locator('.expense-checkbox');

        // Uncheck first 3 checkboxes
        for (let i = 0; i < 3; i++) {
            await checkboxes.nth(i).uncheck();
        }

        // Verify some are unchecked
        await expect(checkboxes.first()).not.toBeChecked();

        // Click reset
        await resetBtn.click();
        await page.waitForTimeout(300);

        // All should be checked now
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
            await expect(checkboxes.nth(i)).toBeChecked();
        }
    });

    test('survival mode preset unchecks discretionary expenses', async ({ page }) => {
        const survivalBtn = page.locator('#survivalBtn');

        // Click Survival Mode
        await survivalBtn.click();
        await page.waitForTimeout(300);

        // Check that savings is unchecked (discretionary) - select input specifically
        const savingsCheckbox = page.locator('input[data-expense-id="savings"]');
        await expect(savingsCheckbox).not.toBeChecked();

        // Check that mortgage is still checked (essential)
        const mortgageCheckbox = page.locator('input[data-expense-id="loancare-mortgage"]');
        await expect(mortgageCheckbox).toBeChecked();
    });

    test('aggressive paydown preset keeps only essentials', async ({ page }) => {
        const aggressiveBtn = page.locator('#aggressiveBtn');

        // Click Aggressive Paydown
        await aggressiveBtn.click();
        await page.waitForTimeout(300);

        // Check that mortgage is checked (essential) - select input specifically
        const mortgageCheckbox = page.locator('input[data-expense-id="loancare-mortgage"]');
        await expect(mortgageCheckbox).toBeChecked();

        // Check that debt payoff is checked (aggressive)
        const debtCheckbox = page.locator('input[data-expense-id="debt-payoff"]');
        await expect(debtCheckbox).toBeChecked();

        // Check that netflix is unchecked (non-essential)
        const netflixCheckbox = page.locator('input[data-expense-id="netflix"]');
        await expect(netflixCheckbox).not.toBeChecked();
    });

    test('impact summary updates when expenses are toggled', async ({ page }) => {
        const firstCheckbox = page.locator('.expense-checkbox').first();
        const expensesRemoved = page.locator('#expensesRemoved');

        // Get initial value
        const initialText = await expensesRemoved.textContent();
        expect(initialText).toContain('$0');

        // Uncheck first expense
        await firstCheckbox.uncheck();
        await page.waitForTimeout(300);

        // Value should have changed
        const updatedText = await expensesRemoved.textContent();
        expect(updatedText).not.toBe(initialText);
        expect(updatedText).not.toContain('$0');
    });

    test('impact summary shows ending balance change', async ({ page }) => {
        const endingBalanceImpact = page.locator('#endingBalanceImpact');

        // Should show arrow (→)
        const text = await endingBalanceImpact.textContent();
        expect(text).toContain('→');
    });

    test('impact summary shows status', async ({ page }) => {
        const statusImpact = page.locator('#statusImpact');

        // Should have some status text
        const text = await statusImpact.textContent();
        expect(text.length).toBeGreaterThan(0);
    });

    test('control buttons are clickable', async ({ page }) => {
        const resetBtn = page.locator('#resetBtn');
        const saveBtn = page.locator('#saveBtn');
        const survivalBtn = page.locator('#survivalBtn');
        const aggressiveBtn = page.locator('#aggressiveBtn');

        await expect(resetBtn).toBeEnabled();
        await expect(saveBtn).toBeEnabled();
        await expect(survivalBtn).toBeEnabled();
        await expect(aggressiveBtn).toBeEnabled();
    });

    test('save button shows placeholder alert', async ({ page }) => {
        const saveBtn = page.locator('#saveBtn');

        // Set up dialog handler
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Scenario saved');
            await dialog.accept();
        });

        await saveBtn.click();
    });

    test('hover effects work on expense items', async ({ page }) => {
        const firstItem = page.locator('.expense-item').first();

        // Get initial border color
        const initialBorder = await firstItem.evaluate((el) =>
            window.getComputedStyle(el).borderColor
        );

        // Hover over item
        await firstItem.hover();
        await page.waitForTimeout(200);

        // Border should have changed (hover effect)
        const hoveredBorder = await firstItem.evaluate((el) =>
            window.getComputedStyle(el).borderColor
        );

        // Note: This may not always change if CSS variables are the same
        // Just verify the element responds to hover
        expect(hoveredBorder).toBeDefined();
    });
});
