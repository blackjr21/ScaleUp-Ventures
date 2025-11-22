import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Verify Alerts Accuracy - Match Actual Balances', async ({ page }) => {
    console.log('🔍 Starting alerts accuracy verification...\n');

    // Load the JSON file to compare
    const jsonData = JSON.parse(
        fs.readFileSync('/Users/calvinwilliamsjr/Personal AI Enablement/Personal/Financial/Cash Flow Forecasts/forecasts/forecast-2025-11-20.json', 'utf8')
    );

    console.log('📊 Alerts in JSON:');
    console.log(`   Total alerts: ${jsonData.alerts.length}`);

    let negativeCount = 0;
    let lowCount = 0;

    jsonData.alerts.forEach(alert => {
        const balance = parseFloat(alert.balance.replace(/[^0-9.-]/g, ''));
        console.log(`   ${alert.date}: ${alert.balance} (${alert.type})`);

        // Verify the alert type matches the balance
        if (alert.type === 'NEGATIVE') {
            expect(balance).toBeLessThan(0);
            negativeCount++;
        } else if (alert.type === 'LOW') {
            expect(balance).toBeGreaterThanOrEqual(0);
            expect(balance).toBeLessThan(500);
            lowCount++;
        }
    });

    console.log(`\n✅ Alert breakdown:`);
    console.log(`   NEGATIVE (< $0): ${negativeCount}`);
    console.log(`   LOW ($0-$500): ${lowCount}`);
    console.log(`   Total: ${negativeCount + lowCount}`);

    // Navigate to dashboard
    await page.goto('http://localhost:8080/dashboard.html?v=15');
    await page.waitForTimeout(2000);

    // Verify the alert count on the dashboard
    const alertCountText = await page.locator('#alertCount').textContent();
    console.log(`\n📋 Dashboard shows: ${alertCountText} Alerts`);
    expect(parseInt(alertCountText)).toBe(jsonData.alerts.length);

    // Verify each alert appears correctly in the table
    for (const alert of jsonData.alerts) {
        const row = page.locator(`#transactionTableBody tr:not(.detail-row):has-text("${alert.date}")`);
        await expect(row).toBeVisible();

        const statusCell = row.locator('td').nth(4);
        const statusText = await statusCell.textContent();

        if (alert.type === 'NEGATIVE') {
            expect(statusText).toContain('Negative');
            console.log(`   ✅ ${alert.date}: Correctly marked as Negative`);
        } else if (alert.type === 'LOW') {
            expect(statusText).toContain('Low');
            console.log(`   ✅ ${alert.date}: Correctly marked as Low`);
        }
    }

    // Take screenshot
    await page.screenshot({
        path: 'test-results/alerts-accuracy-verification.png',
        fullPage: true
    });

    console.log('\n✅ ALL ALERTS VERIFIED CORRECTLY!');
    console.log(`📸 Screenshot: test-results/alerts-accuracy-verification.png`);
});
