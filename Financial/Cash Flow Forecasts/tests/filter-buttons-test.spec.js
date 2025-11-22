import { test, expect } from '@playwright/test';

test('Test All Filter Buttons - All, Negative Days, Low Balance', async ({ page }) => {
    console.log('🎬 Starting filter button test...');

    // Navigate to dashboard
    await page.goto('http://localhost:8080/dashboard.html?v=13');
    await page.waitForTimeout(2000);

    // Get total row count initially
    const totalRows = await page.locator('#transactionTableBody tr:not(.detail-row)').count();
    console.log(`\n📊 Total rows in table: ${totalRows}`);

    // TEST 1: All button (default)
    console.log('\n🔵 TEST 1: "All" button');
    const allButton = page.locator('button[data-filter="all"]');
    await expect(allButton).toHaveClass(/active/);

    const allVisibleRows = await page.locator('#transactionTableBody tr:not(.detail-row):visible').count();
    console.log(`   ✅ All button active`);
    console.log(`   ✅ Visible rows: ${allVisibleRows}`);

    await page.screenshot({
        path: 'test-results/filter-test-01-all-button.png',
        fullPage: true
    });

    // TEST 2: Negative Days button
    console.log('\n🔴 TEST 2: "Negative Days" button');
    const negativeButton = page.locator('button[data-filter="negative"]');
    await negativeButton.click();
    await page.waitForTimeout(500);

    await expect(negativeButton).toHaveClass(/active/);
    await expect(allButton).not.toHaveClass(/active/);

    const negativeVisibleRows = await page.locator('#transactionTableBody tr:not(.detail-row):visible').count();
    console.log(`   ✅ Negative Days button active`);
    console.log(`   ✅ Visible rows: ${negativeVisibleRows}`);
    console.log(`   ℹ️  Should show fewer rows than "All" (only negative balances)`);

    // Verify it shows fewer rows
    expect(negativeVisibleRows).toBeLessThan(allVisibleRows);

    // Check that visible rows actually have negative balances
    const firstNegativeRow = page.locator('#transactionTableBody tr:not(.detail-row):visible').first();
    const statusCell = firstNegativeRow.locator('td').nth(4);
    const statusText = await statusCell.textContent();
    console.log(`   ✅ First visible row status: ${statusText}`);
    expect(statusText).toContain('Negative');

    await page.screenshot({
        path: 'test-results/filter-test-02-negative-days.png',
        fullPage: true
    });

    // TEST 3: Low Balance button
    console.log('\n🟡 TEST 3: "Low Balance" button');
    const lowButton = page.locator('button[data-filter="low"]');
    await lowButton.click();
    await page.waitForTimeout(500);

    await expect(lowButton).toHaveClass(/active/);
    await expect(negativeButton).not.toHaveClass(/active/);

    const lowVisibleRows = await page.locator('#transactionTableBody tr:not(.detail-row):visible').count();
    console.log(`   ✅ Low Balance button active`);
    console.log(`   ✅ Visible rows: ${lowVisibleRows}`);
    console.log(`   ℹ️  Should show rows with balance > $0 and < $500`);

    // Verify it shows fewer rows
    expect(lowVisibleRows).toBeLessThan(allVisibleRows);

    // Check that visible rows actually have low balances
    const firstLowRow = page.locator('#transactionTableBody tr:not(.detail-row):visible').first();
    const lowStatusCell = firstLowRow.locator('td').nth(4);
    const lowStatusText = await lowStatusCell.textContent();
    console.log(`   ✅ First visible row status: ${lowStatusText}`);
    expect(lowStatusText).toContain('Low');

    await page.screenshot({
        path: 'test-results/filter-test-03-low-balance.png',
        fullPage: true
    });

    // TEST 4: Switch back to All
    console.log('\n🔵 TEST 4: Switch back to "All" button');
    await allButton.click();
    await page.waitForTimeout(500);

    await expect(allButton).toHaveClass(/active/);
    await expect(lowButton).not.toHaveClass(/active/);

    const finalAllRows = await page.locator('#transactionTableBody tr:not(.detail-row):visible').count();
    console.log(`   ✅ All button active again`);
    console.log(`   ✅ Visible rows: ${finalAllRows}`);
    console.log(`   ✅ Should match initial count: ${finalAllRows === allVisibleRows ? 'YES' : 'NO'}`);

    expect(finalAllRows).toBe(allVisibleRows);

    await page.screenshot({
        path: 'test-results/filter-test-04-back-to-all.png',
        fullPage: true
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL FILTER BUTTON TESTS PASSED!');
    console.log('='.repeat(60));
    console.log(`Total rows: ${totalRows}`);
    console.log(`All filter: ${allVisibleRows} rows`);
    console.log(`Negative filter: ${negativeVisibleRows} rows`);
    console.log(`Low Balance filter: ${lowVisibleRows} rows`);
    console.log('\n📸 Screenshots saved in test-results/filter-test-*.png');
});
