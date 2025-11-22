import { test, expect } from '@playwright/test';

test('Verify All 41 Rows Are Displayed', async ({ page }) => {
    console.log('🔍 Verifying all 41 rows are displayed...\n');

    // Navigate with cache-busting parameter
    const timestamp = Date.now();
    await page.goto(`http://localhost:8080/dashboard.html?v=${timestamp}`);
    await page.waitForTimeout(2000);

    // Count all transaction rows (excluding detail rows)
    const rowCount = await page.locator('#transactionTableBody tr:not(.detail-row)').count();

    console.log(`📊 Total rows displayed: ${rowCount}`);
    console.log(`✅ Expected: 41 rows`);

    if (rowCount !== 41) {
        console.log(`❌ MISMATCH: Only showing ${rowCount} rows instead of 41`);

        // Check if it's showing exactly 10 (the old limit)
        if (rowCount === 10) {
            console.log(`⚠️  Looks like the .slice(0, 10) limit is still in effect`);
            console.log(`⚠️  This suggests browser is loading cached JavaScript`);
        }
    }

    // Take screenshot
    await page.screenshot({
        path: 'test-results/verify-41-rows.png',
        fullPage: true
    });

    // Get first and last row dates
    const firstRow = page.locator('#transactionTableBody tr:not(.detail-row)').first();
    const firstDate = await firstRow.locator('td').nth(0).textContent();

    const lastRow = page.locator('#transactionTableBody tr:not(.detail-row)').last();
    const lastDate = await lastRow.locator('td').nth(0).textContent();

    console.log(`\n📅 Date range:`);
    console.log(`   First row: ${firstDate}`);
    console.log(`   Last row: ${lastDate}`);
    console.log(`   Expected first: 2025-11-21`);
    console.log(`   Expected last: 2025-12-31`);

    console.log(`\n📸 Screenshot: test-results/verify-41-rows.png`);
    console.log(`\n🌐 Test URL: http://localhost:8080/dashboard.html?v=${timestamp}`);

    // Assert
    expect(rowCount).toBe(41);
    expect(firstDate).toBe('2025-11-21');
    expect(lastDate).toBe('2025-12-31');

    console.log(`\n✅ ALL 41 ROWS VERIFIED!`);
});
