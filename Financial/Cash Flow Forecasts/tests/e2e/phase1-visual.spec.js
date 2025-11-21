/**
 * Phase 1: Visual Regression Tests
 * Captures screenshots to verify visual appearance of the control panel
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, '../../forecasts/dashboard.html');
const dashboardUrl = `file://${dashboardPath}`;

test.describe('Phase 1: Visual Regression Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(dashboardUrl);
        await page.waitForSelector('.control-panel');
        await page.waitForTimeout(500);
    });

    test('sidebar full view snapshot', async ({ page }) => {
        const sidebar = page.locator('.control-panel');

        await expect(sidebar).toHaveScreenshot('phase1-sidebar-full.png', {
            maxDiffPixels: 100
        });
    });

    test('panel header snapshot', async ({ page }) => {
        const header = page.locator('.panel-header');

        await expect(header).toHaveScreenshot('phase1-header.png', {
            maxDiffPixels: 50
        });
    });

    test('expense category expanded snapshot', async ({ page }) => {
        const firstCategory = page.locator('.expense-category').first();

        await expect(firstCategory).toHaveScreenshot('phase1-category-expanded.png', {
            maxDiffPixels: 100
        });
    });

    test('expense category collapsed snapshot', async ({ page }) => {
        const firstCategory = page.locator('.expense-category').first();
        const summary = firstCategory.locator('summary');

        // Collapse the category
        await summary.click();
        await page.waitForTimeout(300);

        await expect(firstCategory).toHaveScreenshot('phase1-category-collapsed.png', {
            maxDiffPixels: 50
        });
    });

    test('expense item unchecked snapshot', async ({ page }) => {
        const firstItem = page.locator('.expense-item').first();
        const firstCheckbox = firstItem.locator('.expense-checkbox');

        // Uncheck to show strikethrough
        await firstCheckbox.uncheck();
        await page.waitForTimeout(200);

        await expect(firstItem).toHaveScreenshot('phase1-expense-disabled.png', {
            maxDiffPixels: 50
        });
    });

    test('expense item checked snapshot', async ({ page }) => {
        const firstItem = page.locator('.expense-item').first();

        await expect(firstItem).toHaveScreenshot('phase1-expense-enabled.png', {
            maxDiffPixels: 50
        });
    });

    test('impact summary snapshot', async ({ page }) => {
        const impactSummary = page.locator('.impact-summary');

        await expect(impactSummary).toHaveScreenshot('phase1-impact-summary.png', {
            maxDiffPixels: 100
        });
    });

    test('impact summary after changes snapshot', async ({ page }) => {
        // Uncheck some expenses
        const checkboxes = page.locator('.expense-checkbox');
        await checkboxes.first().uncheck();
        await checkboxes.nth(1).uncheck();
        await checkboxes.nth(2).uncheck();
        await page.waitForTimeout(300);

        const impactSummary = page.locator('.impact-summary');

        await expect(impactSummary).toHaveScreenshot('phase1-impact-with-changes.png', {
            maxDiffPixels: 100
        });
    });

    test('control buttons snapshot', async ({ page }) => {
        const controlButtons = page.locator('.control-buttons');

        await expect(controlButtons).toHaveScreenshot('phase1-control-buttons.png', {
            maxDiffPixels: 100
        });
    });

    test('search box empty snapshot', async ({ page }) => {
        const searchBox = page.locator('#searchBox');

        await expect(searchBox).toHaveScreenshot('phase1-search-empty.png', {
            maxDiffPixels: 50
        });
    });

    test('search box with text snapshot', async ({ page }) => {
        const searchBox = page.locator('#searchBox');

        await searchBox.fill('mortgage');
        await page.waitForTimeout(200);

        await expect(searchBox).toHaveScreenshot('phase1-search-filled.png', {
            maxDiffPixels: 50
        });
    });

    test('filtered expenses snapshot', async ({ page }) => {
        const searchBox = page.locator('#searchBox');
        const panelContent = page.locator('.panel-content');

        // Filter to show only mortgage-related expenses
        await searchBox.fill('mortgage');
        await page.waitForTimeout(300);

        await expect(panelContent).toHaveScreenshot('phase1-filtered-expenses.png', {
            maxDiffPixels: 100
        });
    });

    test('survival mode preset snapshot', async ({ page }) => {
        const survivalBtn = page.locator('#survivalBtn');
        const panelContent = page.locator('.panel-content');

        await survivalBtn.click();
        await page.waitForTimeout(300);

        await expect(panelContent).toHaveScreenshot('phase1-survival-mode.png', {
            maxDiffPixels: 150
        });
    });

    test('aggressive paydown preset snapshot', async ({ page }) => {
        const aggressiveBtn = page.locator('#aggressiveBtn');
        const panelContent = page.locator('.panel-content');

        await aggressiveBtn.click();
        await page.waitForTimeout(300);

        await expect(panelContent).toHaveScreenshot('phase1-aggressive-mode.png', {
            maxDiffPixels: 150
        });
    });

    test('collapsed sidebar with show button snapshot', async ({ page }) => {
        const toggleBtn = page.locator('#togglePanel');

        await toggleBtn.click();
        await page.waitForTimeout(500);

        const showBtn = page.locator('#showPanelBtn');

        await expect(showBtn).toHaveScreenshot('phase1-show-button.png', {
            maxDiffPixels: 50
        });
    });

    test('full dashboard with sidebar snapshot', async ({ page }) => {
        // Capture entire viewport showing sidebar and main content
        await expect(page).toHaveScreenshot('phase1-full-dashboard.png', {
            fullPage: true,
            maxDiffPixels: 500
        });
    });

    test('dark theme sidebar snapshot', async ({ page }) => {
        // Toggle dark theme
        const themeToggle = page.locator('#themeToggle');
        await themeToggle.click();
        await page.waitForTimeout(300);

        const sidebar = page.locator('.control-panel');

        await expect(sidebar).toHaveScreenshot('phase1-sidebar-dark.png', {
            maxDiffPixels: 150
        });
    });

    test('category hover state snapshot', async ({ page }) => {
        const firstCategory = page.locator('.expense-category summary').first();

        await firstCategory.hover();
        await page.waitForTimeout(200);

        await expect(firstCategory).toHaveScreenshot('phase1-category-hover.png', {
            maxDiffPixels: 50
        });
    });

    test('expense item hover state snapshot', async ({ page }) => {
        const firstItem = page.locator('.expense-item').first();

        await firstItem.hover();
        await page.waitForTimeout(200);

        await expect(firstItem).toHaveScreenshot('phase1-expense-hover.png', {
            maxDiffPixels: 50
        });
    });

    test('control button hover state snapshot', async ({ page }) => {
        const resetBtn = page.locator('#resetBtn');

        await resetBtn.hover();
        await page.waitForTimeout(200);

        await expect(resetBtn).toHaveScreenshot('phase1-button-hover.png', {
            maxDiffPixels: 50
        });
    });
});
