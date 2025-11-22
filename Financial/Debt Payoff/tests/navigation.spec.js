const { test, expect } = require('@playwright/test');

test.describe('Navigation Tests', () => {
    test('should have working navigation on debt-strategy-complete.html', async ({ page }) => {
        // Start on debt strategy page
        await page.goto('http://localhost:8000/debt-strategy-complete.html');
        await page.waitForSelector('.top-nav', { timeout: 10000 });

        // Take screenshot of navigation
        await page.screenshot({
            path: 'nav-debt-strategy.png',
            fullPage: false
        });

        // Verify navigation exists
        const nav = page.locator('.top-nav');
        await expect(nav).toBeVisible();

        // Verify all links are present
        const homeLink = page.locator('.top-nav a:has-text("Home")');
        const dashboardLink = page.locator('.top-nav a:has-text("Dashboard")');
        const scenarioLink = page.locator('.top-nav a:has-text("Scenario Planner")');
        const debtLink = page.locator('.top-nav a:has-text("Debt Strategy")');

        await expect(homeLink).toBeVisible();
        await expect(dashboardLink).toBeVisible();
        await expect(scenarioLink).toBeVisible();
        await expect(debtLink).toBeVisible();

        // Verify active link
        await expect(debtLink).toHaveClass(/active/);

        console.log('✅ Navigation menu verified on debt-strategy-complete.html');
    });

    test('should navigate from debt strategy to index page', async ({ page }) => {
        await page.goto('http://localhost:8000/debt-strategy-complete.html');
        await page.waitForSelector('.top-nav');

        // Click Home link
        await page.click('.top-nav a:has-text("Home")');

        // Wait for navigation
        await page.waitForURL('**/index.html');

        // Verify we're on the home page
        await expect(page.locator('h1')).toContainText('Cash Flow Forecasting System');

        // Take screenshot
        await page.screenshot({
            path: 'nav-to-home.png',
            fullPage: false
        });

        console.log('✅ Successfully navigated from debt strategy to home');
    });

    test('should navigate from debt strategy to dashboard', async ({ page }) => {
        await page.goto('http://localhost:8000/debt-strategy-complete.html');
        await page.waitForSelector('.top-nav');

        // Click Dashboard link
        await page.click('.top-nav a:has-text("Dashboard")');

        // Wait for navigation
        await page.waitForURL('**/dashboard.html');

        // Verify we're on the dashboard page
        await expect(page.locator('h1')).toContainText('Cash Flow Dashboard');

        // Take screenshot
        await page.screenshot({
            path: 'nav-to-dashboard.png',
            fullPage: false
        });

        console.log('✅ Successfully navigated from debt strategy to dashboard');
    });

    test('should navigate from debt strategy to scenarios', async ({ page }) => {
        await page.goto('http://localhost:8000/debt-strategy-complete.html');
        await page.waitForSelector('.top-nav');

        // Click Scenario Planner link
        await page.click('.top-nav a:has-text("Scenario Planner")');

        // Wait for navigation
        await page.waitForURL('**/scenarios.html');

        // Verify we're on the scenarios page
        await expect(page.locator('h1')).toContainText('Scenario Planner');

        // Take screenshot
        await page.screenshot({
            path: 'nav-to-scenarios.png',
            fullPage: false
        });

        console.log('✅ Successfully navigated from debt strategy to scenarios');
    });

    test('should navigate from other pages back to debt strategy', async ({ page }) => {
        // Start on home page
        await page.goto('http://localhost:8080/index.html');
        await page.waitForSelector('.top-nav');

        // Click Debt Strategy link
        await page.click('.top-nav a:has-text("Debt Strategy")');

        // Wait for navigation
        await page.waitForURL('**/debt-strategy-complete.html');

        // Wait for page to load
        await page.waitForSelector('#complete-dashboard', { state: 'visible', timeout: 10000 });

        // Verify we're on the debt strategy page
        await expect(page.locator('h1')).toContainText('Complete Debt Elimination Strategy');

        // Take screenshot
        await page.screenshot({
            path: 'nav-back-to-debt-strategy.png',
            fullPage: false
        });

        console.log('✅ Successfully navigated from home back to debt strategy');
    });

    test('should have consistent navigation across all pages', async ({ page }) => {
        const pages = [
            { url: 'http://localhost:8080/index.html', name: 'Home' },
            { url: 'http://localhost:8080/dashboard.html', name: 'Dashboard' },
            { url: 'http://localhost:8080/scenarios.html', name: 'Scenarios' },
            { url: 'http://localhost:8000/debt-strategy-complete.html', name: 'Debt Strategy' }
        ];

        for (const pageInfo of pages) {
            await page.goto(pageInfo.url);
            await page.waitForSelector('.top-nav', { timeout: 5000 });

            // Verify navigation exists
            const nav = page.locator('.top-nav');
            await expect(nav).toBeVisible();

            // Count links
            const links = page.locator('.top-nav a');
            const linkCount = await links.count();
            expect(linkCount).toBe(4); // Should have exactly 4 links

            console.log(`✅ ${pageInfo.name}: Navigation has ${linkCount} links`);
        }

        console.log('✅ All pages have consistent navigation');
    });
});
