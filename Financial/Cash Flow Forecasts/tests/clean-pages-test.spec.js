import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Clean Pages CSS Loading Verification', () => {
    test('index.html loads with CSS', async ({ page }) => {
        await page.goto(`${BASE_URL}/index.html`);
        await page.waitForTimeout(1000);

        // Check navigation styling
        const nav = page.locator('.top-nav');
        const navBg = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
        const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);

        console.log('index.html - Nav background:', navBg);
        console.log('index.html - Nav position:', navPosition);

        expect(navPosition).toBe('sticky');

        await page.screenshot({
            path: 'test-results/clean-index.png',
            fullPage: true
        });
    });

    test('dashboard.html loads with CSS', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard.html`);
        await page.waitForTimeout(1000);

        // Check navigation styling
        const nav = page.locator('.top-nav');
        const navBg = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
        const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);

        console.log('dashboard.html - Nav background:', navBg);
        console.log('dashboard.html - Nav position:', navPosition);

        expect(navPosition).toBe('sticky');

        // Check summary cards exist
        const summaryCards = page.locator('.summary-card');
        await expect(summaryCards.first()).toBeVisible();

        await page.screenshot({
            path: 'test-results/clean-dashboard.png',
            fullPage: true
        });
    });

    test('scenarios.html loads with CSS', async ({ page }) => {
        await page.goto(`${BASE_URL}/scenarios.html`);
        await page.waitForTimeout(1000);

        // Check navigation styling
        const nav = page.locator('.top-nav');
        const navBg = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
        const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);

        console.log('scenarios.html - Nav background:', navBg);
        console.log('scenarios.html - Nav position:', navPosition);

        expect(navPosition).toBe('sticky');

        // Check toggles exist
        const toggles = page.locator('.toggle-item');
        await expect(toggles.first()).toBeVisible();

        await page.screenshot({
            path: 'test-results/clean-scenarios.png',
            fullPage: true
        });
    });

    test('test-styles.html loads with CSS', async ({ page }) => {
        await page.goto(`${BASE_URL}/test-styles.html`);
        await page.waitForTimeout(1000);

        // Check navigation styling
        const nav = page.locator('.top-nav');
        const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);

        console.log('test-styles.html - Nav position:', navPosition);

        expect(navPosition).toBe('sticky');

        await page.screenshot({
            path: 'test-results/clean-test-styles.png',
            fullPage: true
        });
    });

    test('Navigation tabs work correctly on all pages', async ({ page }) => {
        const pages = ['index.html', 'dashboard.html', 'scenarios.html'];

        for (const pagePath of pages) {
            await page.goto(`${BASE_URL}/${pagePath}`);
            await page.waitForTimeout(500);

            // Check active tab styling
            const activeLink = page.locator('.top-nav a.active');
            await expect(activeLink).toBeVisible();

            const borderBottom = await activeLink.evaluate(el =>
                window.getComputedStyle(el).borderBottomColor
            );

            console.log(`${pagePath} - Active tab border:`, borderBottom);
        }
    });
});
