const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Tier 2 - Visual Verification', () => {
    test('capture Tier 2 promotional section screenshots', async ({ page }) => {
        // Navigate using HTTP
        await page.goto('http://localhost:8000/debt-strategy-complete.html');

        // Wait for page to fully load
        await page.waitForSelector('#complete-dashboard', { state: 'visible', timeout: 15000 });
        await page.waitForTimeout(2000); // Additional wait for JavaScript execution

        // Take full page screenshot
        await page.screenshot({
            path: 'test-results/tier2-full-page.png',
            fullPage: true
        });

        console.log('✓ Full page screenshot captured');

        // Find and scroll to Tier 2 section
        const tier2Exists = await page.locator('text=TIER 2 - PROMOTIONAL DEFENSE').count() > 0;

        if (tier2Exists) {
            // Scroll to Tier 2
            await page.locator('text=TIER 2 - PROMOTIONAL DEFENSE').first().scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);

            // Take screenshot of visible area (showing Tier 2)
            await page.screenshot({
                path: 'test-results/tier2-visible-area.png',
                fullPage: false
            });

            console.log('✓ Tier 2 visible area screenshot captured');

            // Get all promotional debt rows
            const debtRows = await page.locator('tr:has-text("PayPal"), tr:has-text("Container Store"), tr:has-text("CareCredit")').all();
            console.log(`Found ${debtRows.length} promotional debt rows`);

            // Verify key elements exist
            const hasHeader = await page.locator('th:has-text("EXPIRATION DATE")').count() > 0;
            const hasDaysColumn = await page.locator('th:has-text("DAYS UNTIL EXPIRATION")').count() > 0;
            const hasDeferredInterest = await page.locator('th:has-text("DEFERRED INTEREST AT RISK")').count() > 0;

            console.log('Header verification:', {
                hasExpirationDate: hasHeader,
                hasDaysUntilExpiration: hasDaysColumn,
                hasDeferredInterestColumn: hasDeferredInterest
            });

            // Find Tier 2 totals
            const tier2Totals = await page.locator('text=TIER 2 TOTALS:').count() > 0;
            const totalBalances = await page.locator('text=Total Balances to Eliminate:').count() > 0;

            console.log('Totals verification:', {
                hasTier2Totals: tier2Totals,
                hasTotalBalances: totalBalances
            });

            // Capture close-up of a promotional debt row
            const firstPromoRow = page.locator('tr').filter({ hasText: 'PayPal Credit' }).first();
            if (await firstPromoRow.count() > 0) {
                await firstPromoRow.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);

                const box = await firstPromoRow.boundingBox();
                if (box) {
                    await page.screenshot({
                        path: 'test-results/tier2-promo-row-closeup.png',
                        clip: {
                            x: Math.max(0, box.x - 20),
                            y: Math.max(0, box.y - 100),
                            width: Math.min(page.viewportSize().width, box.width + 40),
                            height: Math.min(400, box.height + 200)
                        }
                    });
                    console.log('✓ Promotional row close-up captured');
                }
            }

        } else {
            console.log('⚠ Tier 2 section not found - may be empty or page not loaded correctly');
        }

        console.log('\n=== Test Complete ===\nScreenshots saved to test-results/\n');
    });
});
