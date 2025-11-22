const { test, expect } = require('@playwright/test');
const path = require('path');

const DASHBOARD_URL = 'http://localhost:8080/dashboard.html';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'no-cache-verification');

test.describe('Verify Dashboard with Hard Refresh (No Cache)', () => {

    test('Hard refresh and verify Cash Flow Dashboard', async ({ page }) => {
        console.log('\n🔄 HARD REFRESH TEST - Bypassing Browser Cache');
        console.log('🌐 URL: http://localhost:8080/dashboard.html\n');

        // Navigate with cache disabled
        await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });

        // Hard reload to bypass cache
        await page.reload({ waitUntil: 'networkidle' });

        await page.waitForTimeout(2000);

        console.log('✅ Page loaded with hard refresh\n');

        // ========================================
        // Check what's actually rendered
        // ========================================
        const pageTitle = await page.title();
        const h1Text = await page.locator('h1').first().textContent();
        const bodyText = await page.locator('body').textContent();

        console.log(`📄 Page Title: "${pageTitle}"`);
        console.log(`📝 H1 Header: "${h1Text}"\n`);

        // Take screenshots FIRST before any assertions
        console.log('📸 Taking screenshots:\n');

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '01-viewport.png'),
            fullPage: false
        });
        console.log('   ✓ 01-viewport.png (what browser shows)');

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '02-full-page.png'),
            fullPage: true
        });
        console.log('   ✓ 02-full-page.png (complete page)\n');

        // ========================================
        // Analyze what we got
        // ========================================
        console.log('🔍 ANALYSIS:\n');

        const isDebt = pageTitle.toLowerCase().includes('debt') ||
                       (h1Text && h1Text.toLowerCase().includes('debt'));
        const isCashFlow = pageTitle.toLowerCase().includes('cash flow') ||
                          (h1Text && h1Text.toLowerCase().includes('cash flow'));

        console.log(`   Contains "Debt": ${isDebt ? 'YES ⚠️' : 'NO ✓'}`);
        console.log(`   Contains "Cash Flow": ${isCashFlow ? 'YES ✓' : 'NO ⚠️'}\n`);

        // Check for specific elements
        const hasDebtTables = await page.locator('#promotional-table, #victory-path-table').count() > 0;
        const hasDebtStats = bodyText.includes('$924,231') || bodyText.includes('$11,185');

        console.log(`   Has Debt Tables: ${hasDebtTables ? 'YES ⚠️ (WRONG)' : 'NO ✓ (CORRECT)'}`);
        console.log(`   Has Debt Stats ($924k): ${hasDebtStats ? 'YES ⚠️ (WRONG)' : 'NO ✓ (CORRECT)'}\n`);

        // Check for cash flow elements
        const hasCashFlowStatus = bodyText.toLowerCase().includes('healthy') ||
                                 bodyText.toLowerCase().includes('cash runway');
        const hasCashFlowAlerts = bodyText.toLowerCase().includes('alerts');

        console.log(`   Has Cash Flow Status: ${hasCashFlowStatus ? 'YES ✓' : 'NO ⚠️'}`);
        console.log(`   Has Alerts: ${hasCashFlowAlerts ? 'YES ✓' : 'NO ⚠️'}\n`);

        // ========================================
        // Report findings
        // ========================================
        console.log('═══════════════════════════════════════════════════════');

        if (isDebt || hasDebtTables || hasDebtStats) {
            console.log('❌ STILL SHOWING DEBT PAYOFF DASHBOARD');
            console.log('═══════════════════════════════════════════════════════');
            console.log('');
            console.log('🔴 PROBLEM IDENTIFIED:');
            console.log(`   Page Title: ${pageTitle}`);
            console.log(`   H1 Header: ${h1Text || 'Not found'}`);
            console.log(`   Has Debt Tables: ${hasDebtTables}`);
            console.log(`   Has Debt Stats: ${hasDebtStats}`);
            console.log('');
            console.log('📸 Screenshots captured showing current state');
            console.log('📂 Location: no-cache-verification/');
            console.log('');
            throw new Error('WRONG DASHBOARD - Still serving Debt Payoff instead of Cash Flow');
        } else if (isCashFlow || hasCashFlowStatus) {
            console.log('✅ CORRECTLY SHOWING CASH FLOW DASHBOARD');
            console.log('═══════════════════════════════════════════════════════');
            console.log('');
            console.log('✓ Page Title: Cash Flow Dashboard');
            console.log('✓ No debt tables found');
            console.log('✓ Cash flow elements present');
            console.log('');
            console.log('📸 Screenshots saved to: no-cache-verification/');
            console.log('');
        } else {
            console.log('⚠️  UNKNOWN DASHBOARD TYPE');
            console.log('═══════════════════════════════════════════════════════');
            console.log('');
            console.log('📸 Screenshots captured for investigation');
            console.log('');
            throw new Error('UNKNOWN DASHBOARD - Neither Cash Flow nor Debt Payoff detected');
        }
    });
});
