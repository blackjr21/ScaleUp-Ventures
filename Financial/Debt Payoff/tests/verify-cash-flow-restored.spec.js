const { test, expect } = require('@playwright/test');
const path = require('path');

const DASHBOARD_URL = 'http://localhost:8080/dashboard.html';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'cash-flow-verification');

test.describe('Verify Cash Flow Dashboard is Restored', () => {

    test('Confirm dashboard.html is Cash Flow (NOT Debt Payoff)', async ({ page }) => {
        console.log('\n🔍 VERIFYING: http://localhost:8080/dashboard.html');
        console.log('📋 Expected: Cash Flow Dashboard\n');

        await page.goto(DASHBOARD_URL);
        await page.waitForTimeout(2000);

        console.log('✅ Page loaded\n');

        // ========================================
        // Check page title
        // ========================================
        const pageTitle = await page.title();
        console.log(`📄 Page Title: "${pageTitle}"\n`);

        if (pageTitle.toLowerCase().includes('debt')) {
            console.log('❌ ERROR: Page title contains "Debt" - this is the DEBT dashboard!');
            console.log('   Expected: Cash Flow Dashboard');
            console.log('   Got: Debt Payoff Dashboard\n');
            throw new Error('WRONG DASHBOARD - Still showing Debt Payoff instead of Cash Flow');
        }

        expect(pageTitle).toContain('Cash Flow');
        console.log('✅ CORRECT: Page title contains "Cash Flow"\n');

        // ========================================
        // Check for Cash Flow specific elements
        // ========================================
        console.log('🔍 Looking for Cash Flow specific elements:\n');

        // Look for cash flow forecast data
        const hasForecastData = await page.locator('text=/forecast|transaction|balance|cash flow/i').count() > 0;
        console.log(`   Forecast-related text found: ${hasForecastData ? 'YES ✓' : 'NO ✗'}`);

        // Check for debt-specific elements (should NOT be present)
        const hasDebtTable = await page.locator('#promotional-table').count();
        const hasVictoryPath = await page.locator('#victory-path-table').count();

        console.log(`   Debt promotional table: ${hasDebtTable > 0 ? 'FOUND ✗ (BAD)' : 'NOT FOUND ✓ (GOOD)'}`);
        console.log(`   Debt victory path table: ${hasVictoryPath > 0 ? 'FOUND ✗ (BAD)' : 'NOT FOUND ✓ (GOOD)'}`);

        if (hasDebtTable > 0 || hasVictoryPath > 0) {
            console.log('\n❌ ERROR: Debt payoff tables found on Cash Flow dashboard!');
            throw new Error('WRONG DASHBOARD - Debt tables present');
        }

        console.log('\n✅ No debt tables found (correct)\n');

        // ========================================
        // Take screenshots
        // ========================================
        console.log('📸 Taking screenshots:\n');

        // Full page screenshot
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'full-dashboard.png'),
            fullPage: true
        });
        console.log('   ✓ full-dashboard.png (complete page)');

        // Viewport screenshot
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'viewport-screenshot.png'),
            fullPage: false
        });
        console.log('   ✓ viewport-screenshot.png (visible area)');

        // ========================================
        // Look for specific Cash Flow elements
        // ========================================
        console.log('\n🔍 Searching for Cash Flow content:\n');

        const bodyText = await page.locator('body').textContent();

        const cashFlowIndicators = [
            'balance',
            'transaction',
            'forecast',
            'cash',
            'income',
            'expense'
        ];

        let foundIndicators = [];
        for (const indicator of cashFlowIndicators) {
            if (bodyText.toLowerCase().includes(indicator)) {
                foundIndicators.push(indicator);
            }
        }

        console.log(`   Found indicators: ${foundIndicators.join(', ')}`);

        // Check for debt-specific terms (should NOT be present)
        const debtIndicators = ['promotional balance', 'victory path', 'avalanche', 'snowball', 'debt payoff'];
        let foundDebtTerms = [];
        for (const term of debtIndicators) {
            if (bodyText.toLowerCase().includes(term.toLowerCase())) {
                foundDebtTerms.push(term);
            }
        }

        if (foundDebtTerms.length > 0) {
            console.log(`\n❌ ERROR: Found debt-specific terms: ${foundDebtTerms.join(', ')}`);
            throw new Error('WRONG DASHBOARD - Contains debt payoff terminology');
        }

        console.log('   ✓ No debt-specific terms found\n');

        // ========================================
        // Final verification
        // ========================================
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ VERIFICATION COMPLETE');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('🌐 URL: http://localhost:8080/dashboard.html');
        console.log(`📄 Title: ${pageTitle}`);
        console.log('📊 Type: Cash Flow Dashboard ✓');
        console.log('');
        console.log('✓ Page title contains "Cash Flow"');
        console.log('✓ No debt payoff tables found');
        console.log('✓ No debt-specific terminology found');
        console.log(`✓ Found ${foundIndicators.length} cash flow indicators`);
        console.log('');
        console.log('📂 Screenshots saved to: cash-flow-verification/');
        console.log('');
        console.log('🎉 Cash Flow Dashboard is CORRECTLY restored!');
        console.log('═══════════════════════════════════════════════════════\n');
    });
});
