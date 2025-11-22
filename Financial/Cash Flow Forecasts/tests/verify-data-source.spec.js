import { test, expect } from '@playwright/test';

test('Verify Dashboard Data Source and Content', async ({ page }) => {
    console.log('🔍 Starting data source verification...\n');

    // Intercept network requests to see what files are being loaded
    const requests = [];
    page.on('request', request => {
        if (request.url().includes('forecast') || request.url().includes('.json') || request.url().includes('.md')) {
            requests.push(request.url());
            console.log(`📥 Loading: ${request.url()}`);
        }
    });

    // Navigate to dashboard
    await page.goto('http://localhost:8080/dashboard.html?v=14');
    await page.waitForTimeout(3000);

    console.log('\n📊 Files loaded:');
    requests.forEach(url => console.log(`   - ${url}`));

    // Check what data is actually displayed
    const firstRow = page.locator('#transactionTableBody tr:not(.detail-row)').first();
    const date = await firstRow.locator('td').nth(0).textContent();
    const description = await firstRow.locator('td').nth(1).textContent();
    const balance = await firstRow.locator('td').nth(3).textContent();

    console.log('\n📋 First row data:');
    console.log(`   Date: ${date}`);
    console.log(`   Description: ${description}`);
    console.log(`   Balance: ${balance}`);

    // Get total row count
    const totalRows = await page.locator('#transactionTableBody tr:not(.detail-row)').count();
    console.log(`\n📊 Total rows: ${totalRows}`);

    // Get last row
    const lastRow = page.locator('#transactionTableBody tr:not(.detail-row)').last();
    const lastDate = await lastRow.locator('td').nth(0).textContent();
    const lastDescription = await lastRow.locator('td').nth(1).textContent();
    const lastBalance = await lastRow.locator('td').nth(3).textContent();

    console.log('\n📋 Last row data:');
    console.log(`   Date: ${lastDate}`);
    console.log(`   Description: ${lastDescription}`);
    console.log(`   Balance: ${lastBalance}`);

    // Expected data from forecast-2025-11-20.json
    console.log('\n✅ Expected first row:');
    console.log('   Date: 2025-11-21');
    console.log('   Description: NFCU Volvo Loan ($33.00)');
    console.log('   Balance: $1,829.00');

    // Take screenshot
    await page.screenshot({
        path: 'test-results/data-source-verification.png',
        fullPage: true
    });

    console.log('\n📸 Screenshot saved: test-results/data-source-verification.png');

    // Verify the data matches expected JSON
    expect(date).toBe('2025-11-21');
    expect(description).toContain('NFCU Volvo Loan');
    expect(balance).toBe('$1,829.00');
});
