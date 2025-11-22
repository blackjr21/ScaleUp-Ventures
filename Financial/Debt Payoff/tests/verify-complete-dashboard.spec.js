const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

test.describe('Complete Dashboard Verification', () => {
    test('should load complete dashboard and take screenshot', async ({ page }) => {
        // Navigate to the complete dashboard
        await page.goto(`${BASE_URL}/debt-strategy-complete.html`);

        // Wait for loading to complete
        await page.waitForSelector('#complete-dashboard', { state: 'visible', timeout: 10000 });

        // Take full page screenshot
        await page.screenshot({
            path: 'complete-dashboard-verification.png',
            fullPage: true
        });

        // Verify page loaded correctly
        await expect(page.locator('h1')).toContainText('Complete Debt Elimination Strategy');

        // Verify hero stats are visible
        await expect(page.locator('.hero-stats')).toBeVisible();
        const statCards = page.locator('.stat-card');
        const count = await statCards.count();
        expect(count).toBe(5); // Total Debt, DTI, Weighted APR, Min Payments, Extra Payment Power

        // Verify debts table is populated
        await expect(page.locator('#debts-table')).toBeVisible();
        const rows = page.locator('#debts-tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);

        // Verify scenarios section exists
        await expect(page.locator('#scenarios-section')).toBeVisible();

        // Check for tier headers
        await expect(page.locator('text=TIER 1')).toBeVisible();

        // Verify calculations are showing (not "undefined" or errors)
        const heroStatsText = await page.locator('.hero-stats').textContent();
        expect(heroStatsText).not.toContain('undefined');
        expect(heroStatsText).not.toContain('NaN');
        expect(heroStatsText).toContain('$');
        expect(heroStatsText).toContain('%');

        console.log('✅ Complete dashboard loaded successfully!');
        console.log('📸 Screenshot saved to: complete-dashboard-verification.png');
    });

    test('should display all dynamic calculations', async ({ page }) => {
        await page.goto(`${BASE_URL}/debt-strategy-complete.html`);
        await page.waitForSelector('#complete-dashboard', { state: 'visible' });

        // Check that DTI is displaying correctly
        const dtiCard = page.locator('.stat-card.yellow');
        await expect(dtiCard).toBeVisible();
        const dtiText = await dtiCard.textContent();
        expect(dtiText).toMatch(/\d+\.\d+%/); // Should have percentage like "40.6%"
        expect(dtiText).toContain('Debt-to-Income Ratio');

        // Check total debt is calculated
        const redCard = page.locator('.stat-card.red');
        await expect(redCard).toBeVisible();
        const totalText = await redCard.textContent();
        expect(totalText).toMatch(/\$\d+K/); // Should show like "$241K"

        // Check tier classifications are working
        const tierHeaders = page.locator('tbody tr:has-text("TIER")');
        const tierCount = await tierHeaders.count();
        expect(tierCount).toBeGreaterThan(0);
        expect(tierCount).toBeLessThanOrEqual(5); // Should have 1-5 tiers

        // Verify acceleration scenarios table
        const scenariosTable = page.locator('#scenarios-section table');
        await expect(scenariosTable).toBeVisible();
        const scenarioRows = scenariosTable.locator('tbody tr');
        const scenarioCount = await scenarioRows.count();
        expect(scenarioCount).toBe(4); // Should have 4 scenarios

        console.log('✅ All dynamic calculations verified!');
    });

    test('should show payment status badges', async ({ page }) => {
        await page.goto(`${BASE_URL}/debt-strategy-complete.html`);
        await page.waitForSelector('#complete-dashboard', { state: 'visible' });

        // Look for PAID badges (from 11/21/25 payments)
        const paidBadges = page.locator('span:has-text("PAID 2025-11-21")');
        const paidCount = await paidBadges.count();
        expect(paidCount).toBeGreaterThan(0);

        console.log(`✅ Found ${paidCount} PAID status badges`);
    });

    test('should calculate monthly interest correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/debt-strategy-complete.html`);
        await page.waitForSelector('#complete-dashboard', { state: 'visible' });

        // Get the table content
        const tableText = await page.locator('#debts-table').textContent();

        // Should show monthly interest calculations ($ amounts)
        expect(tableText).toContain('Monthly Interest');

        // Should have multiple interest amounts displayed
        const interestAmounts = tableText.match(/\$[\d,]+\.\d{2}/g);
        expect(interestAmounts).toBeTruthy();
        expect(interestAmounts.length).toBeGreaterThan(20); // At least 22 debts

        console.log('✅ Monthly interest calculations displayed');
    });

    test('should load without JavaScript errors', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(`${BASE_URL}/debt-strategy-complete.html`);
        await page.waitForSelector('#complete-dashboard', { state: 'visible' });
        await page.waitForLoadState('networkidle');

        // Should have no JavaScript errors
        if (errors.length > 0) {
            console.log('Errors found:', errors);
        }
        expect(errors.length).toBe(0);

        console.log('✅ No JavaScript errors detected');
    });
});
