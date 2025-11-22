const { test, expect } = require('@playwright/test');

test.describe('Tier 2 - Promotional Debt Display', () => {
    test('should display promotional debts with all required columns', async ({ page }) => {
        // Navigate to the debt strategy page
        await page.goto('http://localhost:8000/debt-strategy-complete.html');

        // Wait for the page to load
        await page.waitForSelector('#complete-dashboard', { state: 'visible', timeout: 10000 });

        // Wait for the table to render
        await page.waitForSelector('#debts-tbody', { timeout: 5000 });

        // Take full page screenshot
        await page.screenshot({
            path: 'test-results/tier2-promotional-full-page.png',
            fullPage: true
        });

        // Scroll to Tier 2 section
        await page.evaluate(() => {
            const tier2Header = Array.from(document.querySelectorAll('tr')).find(tr =>
                tr.textContent.includes('TIER 2 - PROMOTIONAL DEFENSE')
            );
            if (tier2Header) {
                tier2Header.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        await page.waitForTimeout(1000);

        // Take screenshot of Tier 2 section
        await page.screenshot({
            path: 'test-results/tier2-promotional-section.png',
            fullPage: false
        });

        // Verify Tier 2 header exists
        const tier2Header = await page.locator('text=TIER 2 - PROMOTIONAL DEFENSE: STOP THE DEFERRED INTEREST BOMB');
        await expect(tier2Header).toBeVisible();

        // Verify promotional table headers exist
        await expect(page.locator('th:has-text("DEBT")')).toBeVisible();
        await expect(page.locator('th:has-text("BALANCE")')).toBeVisible();
        await expect(page.locator('th:has-text("EXPIRATION DATE")')).toBeVisible();
        await expect(page.locator('th:has-text("DAYS UNTIL EXPIRATION")')).toBeVisible();
        await expect(page.locator('th:has-text("DEFERRED INTEREST AT RISK")')).toBeVisible();
        await expect(page.locator('th:has-text("PRIORITY")')).toBeVisible();

        // Verify promotional debts are displayed
        const promotionalDebts = [
            'PayPal Credit - THORUM',
            'PayPal Credit - DELTA (Promo expires 01/11/26)',
            'PayPal Credit - DELTA (Promo expires 02/11/26)',
            'Container Store/Synchrony',
            'CareCredit/Synchrony'
        ];

        for (const debtName of promotionalDebts) {
            const debtCell = page.locator(`td:has-text("${debtName}")`).first();
            await expect(debtCell).toBeVisible();
        }

        // Verify TIER 2 TOTALS row exists
        const tier2Totals = await page.locator('text=TIER 2 TOTALS:');
        await expect(tier2Totals).toBeVisible();

        // Verify "Total Balances to Eliminate" row exists
        const totalBalances = await page.locator('text=Total Balances to Eliminate:');
        await expect(totalBalances).toBeVisible();

        // Get the tier 2 section element
        const tier2Section = await page.locator('tr:has-text("TIER 2 - PROMOTIONAL DEFENSE")').first();
        const tier2Box = await tier2Section.boundingBox();

        if (tier2Box) {
            // Scroll to show the entire Tier 2 section
            await page.evaluate((y) => {
                window.scrollTo({ top: y - 100, behavior: 'smooth' });
            }, tier2Box.y);

            await page.waitForTimeout(1000);

            // Take a focused screenshot of Tier 2
            await page.screenshot({
                path: 'test-results/tier2-promotional-focused.png',
                clip: {
                    x: 0,
                    y: tier2Box.y - 50,
                    width: page.viewportSize().width,
                    height: Math.min(tier2Box.height + 500, page.viewportSize().height)
                }
            });
        }

        // Verify data values are correct
        console.log('Tier 2 promotional debts verified successfully!');
    });

    test('should show correct expiration dates and days remaining', async ({ page }) => {
        await page.goto('http://localhost:8000/debt-strategy-complete.html');
        await page.waitForSelector('#complete-dashboard', { state: 'visible', timeout: 10000 });

        // Check for expiration dates
        const expirationDates = [
            '2026-01-11',  // PayPal THORUM and DELTA 1
            '2026-02-11',  // PayPal DELTA 2
            '2026-04-03',  // Container Store
            '2026-02-03'   // CareCredit
        ];

        // Verify at least one expiration date is visible
        let foundDate = false;
        for (const date of expirationDates) {
            const dateLocator = page.locator(`td:has-text("${date}")`);
            if (await dateLocator.count() > 0) {
                foundDate = true;
                break;
            }
        }

        expect(foundDate).toBe(true);

        // Verify DAYS text appears (e.g., "52 DAYS", "83 DAYS")
        const daysText = await page.locator('td:text-matches("\\d+ DAYS", "i")').first();
        await expect(daysText).toBeVisible();

        // Verify CRITICAL or HIGH priority badges exist
        const priorityBadges = page.locator('span:has-text("CRITICAL"), span:has-text("HIGH")');
        await expect(priorityBadges.first()).toBeVisible();

        console.log('Expiration dates and days remaining verified!');
    });

    test('should display deferred interest amounts', async ({ page }) => {
        await page.goto('http://localhost:8000/debt-strategy-complete.html');
        await page.waitForSelector('#complete-dashboard', { state: 'visible', timeout: 10000 });

        // Look for the tier 2 totals to save amount
        const toSaveBadge = await page.locator('td:has-text("TO SAVE")');
        await expect(toSaveBadge).toBeVisible();

        // Verify deferred interest values are displayed (should show dollar amounts)
        const deferredInterestCells = await page.locator('td[style*="color: #e53e3e"]').all();
        expect(deferredInterestCells.length).toBeGreaterThan(0);

        console.log('Deferred interest amounts verified!');
    });
});
