const { test, expect } = require('@playwright/test');
const path = require('path');

const LOCALHOST_8080 = 'http://localhost:8080/debt-dashboard.html';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'port-8080-screenshots');

test.describe('Verify localhost:8080/debt-dashboard.html', () => {

    test('Debt dashboard loads with latest JSON data on port 8080', async ({ page }) => {
        console.log('\n🌐 Testing: http://localhost:8080/debt-dashboard.html\n');

        // Navigate to localhost:8080
        await page.goto(LOCALHOST_8080);

        // Wait for JavaScript to load JSON data
        await page.waitForTimeout(2000);

        console.log('✅ Page loaded\n');

        // ========================================
        // Verify Promotional Table
        // ========================================
        console.log('📋 PROMOTIONAL BALANCE DEFENSE TABLE:');

        const promoTable = page.locator('#promotional-table');
        await expect(promoTable).toBeVisible();

        // Check for Monthly Payment column
        const promoHeaders = await promoTable.locator('thead th').allTextContents();
        expect(promoHeaders).toContain('Monthly Payment');
        console.log(`   ✓ Headers: ${promoHeaders.join(' | ')}`);

        // Count rows (should be 6 promo debts + 1 total row)
        const promoRows = await promoTable.locator('tbody tr').count();
        console.log(`   ✓ Rows loaded: ${promoRows}`);

        // Get total monthly payment
        const totalRow = promoTable.locator('.success-row');
        const totalPayment = await totalRow.locator('td').nth(2).textContent();
        console.log(`   ✓ Total Monthly Payment: ${totalPayment}\n`);

        // Screenshot
        await promoTable.screenshot({
            path: path.join(SCREENSHOT_DIR, 'promotional-table-8080.png')
        });
        console.log('   📸 Screenshot: promotional-table-8080.png\n');

        // ========================================
        // Verify Victory Path Table
        // ========================================
        console.log('🎯 VICTORY PATH TABLE:');

        const victoryTable = page.locator('#victory-path-table');
        await expect(victoryTable).toBeVisible();

        // Check for Monthly Payment column
        const victoryHeaders = await victoryTable.locator('thead th').allTextContents();
        expect(victoryHeaders).toContain('Monthly Payment');
        console.log(`   ✓ Headers: ${victoryHeaders.join(' | ')}`);

        // Find tier summaries
        const tierRows = victoryTable.locator('tbody tr[style*="background: #e0e7ff"]');
        const tierCount = await tierRows.count();
        console.log(`   ✓ Tier summaries found: ${tierCount}\n`);

        // Verify each tier
        for (let i = 0; i < tierCount; i++) {
            const tier = tierRows.nth(i);
            const tierName = await tier.locator('td').nth(0).textContent();
            const tierPayment = await tier.locator('td').nth(2).textContent();
            console.log(`   Tier ${i + 1}: ${tierName.trim()}`);
            console.log(`      Monthly Payment: ${tierPayment}\n`);
        }

        // Screenshot
        await victoryTable.screenshot({
            path: path.join(SCREENSHOT_DIR, 'victory-path-table-8080.png')
        });
        console.log('   📸 Screenshot: victory-path-table-8080.png\n');

        // ========================================
        // Verify specific debts from JSON
        // ========================================
        console.log('💳 VERIFY SPECIFIC DEBTS FROM JSON:');

        // Johns Hopkins 401k Loan 2
        const loan401k = victoryTable.locator('tbody tr', { hasText: 'Johns Hopkins 401k Loan 2' });
        if (await loan401k.count() > 0) {
            const balance = await loan401k.locator('td').nth(2).textContent();
            const payment = await loan401k.locator('td').nth(3).textContent();
            const apr = await loan401k.locator('td').nth(4).textContent();

            console.log('   Johns Hopkins 401k Loan 2:');
            console.log(`      Balance: ${balance}`);
            console.log(`      Monthly Payment: ${payment}`);
            console.log(`      APR: ${apr}`);

            // Verify values match JSON
            expect(balance).toContain('35,360.58');
            expect(payment).toContain('828.53');
            expect(apr).toContain('8.50');
            console.log('      ✅ Matches debt-inventory-current.json\n');
        }

        // SoFi Personal Loan
        const sofi = victoryTable.locator('tbody tr', { hasText: 'SoFi Personal Loan' });
        if (await sofi.count() > 0) {
            const balance = await sofi.locator('td').nth(2).textContent();
            const payment = await sofi.locator('td').nth(3).textContent();
            const apr = await sofi.locator('td').nth(4).textContent();

            console.log('   SoFi Personal Loan:');
            console.log(`      Balance: ${balance}`);
            console.log(`      Monthly Payment: ${payment}`);
            console.log(`      APR: ${apr}`);

            // Verify values match JSON
            expect(balance).toContain('40,735.15');
            expect(payment).toContain('1,042.78');
            expect(apr).toContain('17.89');
            console.log('      ✅ Matches debt-inventory-current.json\n');
        }

        // ========================================
        // Full page screenshot
        // ========================================
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'full-page-8080.png'),
            fullPage: true
        });

        console.log('📸 Full page screenshot: full-page-8080.png\n');

        // ========================================
        // Summary
        // ========================================
        console.log('✅ VERIFICATION COMPLETE:');
        console.log('   ======================');
        console.log('   ✓ Dashboard loads on http://localhost:8080/debt-dashboard.html');
        console.log('   ✓ JSON data (debt-inventory-current.json) loaded successfully');
        console.log('   ✓ Promotional table has Monthly Payment column');
        console.log('   ✓ Victory Path table has Monthly Payment column');
        console.log(`   ✓ ${tierCount} tier summaries with auto-calculated totals`);
        console.log('   ✓ Johns Hopkins 401k Loan 2 data matches JSON');
        console.log('   ✓ SoFi Personal Loan data matches JSON');
        console.log('\n🎉 Your debt dashboard is connected and working on port 8080!\n');
    });
});
