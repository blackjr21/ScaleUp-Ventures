const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

test.describe('Page Inspection', () => {
    test('should inspect debt-strategy-complete.html and scroll through all tiers', async ({ page }) => {
        await page.goto(`${BASE_URL}/debt-strategy-complete.html`);

        // Wait for page to load
        await page.waitForSelector('#complete-dashboard', { state: 'visible', timeout: 10000 });

        // Take initial screenshot
        await page.screenshot({
            path: 'inspection-top.png',
            fullPage: false
        });

        console.log('=== INSPECTING PAGE STRUCTURE ===');

        // Check for tier headers
        const tierHeaders = page.locator('tbody tr:has-text("TIER")');
        const tierCount = await tierHeaders.count();
        console.log(`Found ${tierCount} tier headers`);

        for (let i = 0; i < tierCount; i++) {
            const tierText = await tierHeaders.nth(i).textContent();
            console.log(`Tier ${i + 1}: ${tierText.trim()}`);
        }

        // Scroll to debts table
        await page.locator('#debts-table').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: 'inspection-debts-table.png',
            fullPage: false
        });

        // Get all rows in the debts table
        const debtRows = page.locator('#debts-tbody tr');
        const rowCount = await debtRows.count();
        console.log(`\n=== DEBTS TABLE ===`);
        console.log(`Total rows: ${rowCount}`);

        // Scroll through and identify tier sections
        for (let i = 0; i < Math.min(rowCount, 30); i++) {
            const row = debtRows.nth(i);
            const rowText = await row.textContent();

            if (rowText.includes('TIER')) {
                console.log(`\n--- ${rowText.trim().substring(0, 50)} ---`);
            } else {
                const cells = row.locator('td');
                const cellCount = await cells.count();
                if (cellCount > 0) {
                    const firstCell = await cells.first().textContent();
                    console.log(`  ${firstCell.trim().substring(0, 40)}`);
                }
            }
        }

        // Scroll to portfolio summary
        const portfolioSection = page.locator('#portfolio-summary');
        if (await portfolioSection.count() > 0) {
            await portfolioSection.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await page.screenshot({
                path: 'inspection-portfolio.png',
                fullPage: false
            });
            console.log('\n=== PORTFOLIO SUMMARY FOUND ===');
        } else {
            console.log('\n=== NO PORTFOLIO SUMMARY FOUND ===');
        }

        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: 'inspection-bottom.png',
            fullPage: false
        });

        // Take full page screenshot
        await page.screenshot({
            path: 'inspection-full-page.png',
            fullPage: true
        });

        console.log('\n=== SCREENSHOTS SAVED ===');
        console.log('- inspection-top.png');
        console.log('- inspection-debts-table.png');
        console.log('- inspection-portfolio.png');
        console.log('- inspection-bottom.png');
        console.log('- inspection-full-page.png');
    });

    test('should inspect navigation on index.html', async ({ page }) => {
        await page.goto('http://localhost:8080/index.html');
        await page.waitForLoadState('networkidle');

        // Find all navigation links
        const navLinks = page.locator('nav a, header a, .nav a, a[href*="debt"]');
        const linkCount = await navLinks.count();

        console.log('\n=== NAVIGATION LINKS ON index.html ===');
        for (let i = 0; i < linkCount; i++) {
            const link = navLinks.nth(i);
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            console.log(`${text?.trim()}: ${href}`);
        }

        await page.screenshot({
            path: 'navigation-index.png',
            fullPage: true
        });
    });

    test('should inspect navigation on dashboard.html', async ({ page }) => {
        await page.goto('http://localhost:8080/dashboard.html');
        await page.waitForLoadState('networkidle');

        const navLinks = page.locator('nav a, header a, .nav a, a[href*="debt"]');
        const linkCount = await navLinks.count();

        console.log('\n=== NAVIGATION LINKS ON dashboard.html ===');
        for (let i = 0; i < linkCount; i++) {
            const link = navLinks.nth(i);
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            console.log(`${text?.trim()}: ${href}`);
        }

        await page.screenshot({
            path: 'navigation-dashboard.png',
            fullPage: true
        });
    });

    test('should inspect navigation on scenarios.html', async ({ page }) => {
        await page.goto('http://localhost:8080/scenarios.html');
        await page.waitForLoadState('networkidle');

        const navLinks = page.locator('nav a, header a, .nav a, a[href*="debt"]');
        const linkCount = await navLinks.count();

        console.log('\n=== NAVIGATION LINKS ON scenarios.html ===');
        for (let i = 0; i < linkCount; i++) {
            const link = navLinks.nth(i);
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            console.log(`${text?.trim()}: ${href}`);
        }

        await page.screenshot({
            path: 'navigation-scenarios.png',
            fullPage: true
        });
    });
});
