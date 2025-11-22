import { test, expect } from '@playwright/test';

test('Final Dashboard Verification - Real Data from forecast-2025-11-20.md', async ({ page }) => {
    await page.goto('http://localhost:8080/forecasts/dashboard.html');
    await page.waitForTimeout(3000);

    // Take full page screenshot
    await page.screenshot({
        path: 'test-results/dashboard-final-full-page.png',
        fullPage: true
    });

    console.log('=== VERIFICATION RESULTS ===');

    // Verify summary cards
    const currentBalance = await page.locator('.summary-card:nth-child(1) .value').textContent();
    const lowestPoint = await page.locator('.summary-card:nth-child(2) .value').textContent();
    const totalIncome = await page.locator('.summary-card:nth-child(3) .value').textContent();
    const totalExpenses = await page.locator('.summary-card:nth-child(4) .value').textContent();

    console.log('\n📊 Summary Cards:');
    console.log(`  Current Balance: ${currentBalance} (Expected: $1,362.00)`);
    console.log(`  Lowest Point: ${lowestPoint} (Expected: $-492.65)`);
    console.log(`  Total Income: ${totalIncome}`);
    console.log(`  Total Expenses: ${totalExpenses}`);

    // Verify glance cards
    const status = await page.locator('#statusValue').textContent();
    const alertCount = await page.locator('#alertCount').textContent();
    const runwayDays = await page.locator('#runwayDays').textContent();

    console.log('\n👀 Glance Cards:');
    console.log(`  Status: ${status} (Expected: HEALTHY)`);
    console.log(`  Alert Count: ${alertCount} (Expected: 8)`);
    console.log(`  Runway Days: ${runwayDays}`);

    // Verify alert badges
    const badges = await page.locator('.alert-badge').allTextContents();
    console.log('\n🚨 Alert Badges:');
    badges.forEach(badge => console.log(`  ${badge}`));

    // Count transaction rows
    const transactionCount = await page.locator('tbody tr').count();
    console.log('\n📋 Transactions:');
    console.log(`  Transaction rows displayed: ${transactionCount}`);

    // Get first 3 transactions
    if (transactionCount > 0) {
        const firstThree = await page.locator('tbody tr').evaluateAll(rows =>
            rows.slice(0, 3).map(row => ({
                date: row.cells[0]?.textContent || '',
                description: row.cells[1]?.textContent || '',
                amount: row.cells[2]?.textContent || '',
                balance: row.cells[3]?.textContent || ''
            }))
        );
        console.log('  First 3 transactions:');
        firstThree.forEach((t, i) => {
            console.log(`    ${i + 1}. ${t.date}: ${t.description} | ${t.amount} | Balance: ${t.balance}`);
        });
    }

    // Scroll to transaction table for screenshot
    await page.locator('.transactions-section').scrollIntoViewIfNeeded();
    await page.screenshot({
        path: 'test-results/dashboard-transactions-section.png',
        fullPage: false
    });

    // Verify critical assertions
    expect(currentBalance).toContain('1362');
    expect(lowestPoint).toContain('-492.65');
    expect(status).toBe('HEALTHY');
    expect(parseInt(alertCount)).toBe(8);
    expect(transactionCount).toBeGreaterThan(0);

    console.log('\n✅ ALL VERIFICATIONS PASSED!');
    console.log('📸 Screenshots saved to test-results/');
});
