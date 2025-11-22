import { test, expect } from '@playwright/test';

test('Dashboard Complete Data Verification', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:8080/dashboard.html?v=10');

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check console for errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    // Verify the transaction table exists
    const tableBody = page.locator('#forecastTableBody');
    await expect(tableBody).toBeVisible();

    // Count the number of rows
    const rows = await tableBody.locator('tr').count();
    console.log(`Found ${rows} transaction rows in table`);

    // Verify we have all 41 rows
    expect(rows).toBe(41);

    // Check first row has complete data
    const firstRow = tableBody.locator('tr').first();
    const firstRowCells = firstRow.locator('td');

    const firstDate = await firstRowCells.nth(0).textContent();
    const firstDesc = await firstRowCells.nth(1).textContent();
    const firstAmount = await firstRowCells.nth(2).textContent();
    const firstBalance = await firstRowCells.nth(3).textContent();

    console.log('First row data:');
    console.log('  Date:', firstDate);
    console.log('  Description:', firstDesc);
    console.log('  Amount:', firstAmount);
    console.log('  Balance:', firstBalance);

    // Verify first row is NOT showing "No transactions"
    expect(firstDesc).not.toBe('No transactions');
    expect(firstDesc.length).toBeGreaterThan(0);

    // Check a few more rows to ensure they have descriptions
    const rowsToCheck = [0, 5, 10, 20, 30, 40]; // Check spread across the table

    for (const rowIndex of rowsToCheck) {
        const row = tableBody.locator('tr').nth(rowIndex);
        const cells = row.locator('td');

        const date = await cells.nth(0).textContent();
        const desc = await cells.nth(1).textContent();
        const amount = await cells.nth(2).textContent();
        const balance = await cells.nth(3).textContent();

        console.log(`\nRow ${rowIndex}:`);
        console.log('  Date:', date);
        console.log('  Description:', desc);
        console.log('  Amount:', amount);
        console.log('  Balance:', balance);

        // Verify this row has valid data
        expect(date).toMatch(/2025-\d{2}-\d{2}/); // Date format
        expect(amount).toMatch(/\$[\d,]+\.\d{2}/); // Dollar amount format
        expect(balance).toMatch(/\$[\d,\-]+\.\d{2}/); // Balance format

        // Description should either have content or be empty (for days with no transactions)
        // But should NOT be the literal string "No transactions"
        expect(desc).not.toBe('No transactions');
    }

    // Take a full-page screenshot
    await page.screenshot({
        path: 'test-results/dashboard-complete-full-page.png',
        fullPage: true
    });

    console.log('\n✅ ALL VERIFICATIONS PASSED!');
    console.log(`   - Table has all 41 rows`);
    console.log(`   - All checked rows have valid data`);
    console.log(`   - No "No transactions" placeholders found`);
});
