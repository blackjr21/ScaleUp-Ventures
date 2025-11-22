import { test, expect } from '@playwright/test';

test.describe('Dashboard Real Data Loading', () => {
    test('should load real forecast data from forecast-2025-11-20.md', async ({ page }) => {
        // Navigate to dashboard
        await page.goto('http://localhost:8080/forecasts/dashboard.html');

        // Wait for data to load
        await page.waitForTimeout(2000);

        // Check console for any errors
        const consoleMessages = [];
        page.on('console', msg => consoleMessages.push(msg.text()));

        // Take initial screenshot
        await page.screenshot({
            path: 'test-results/dashboard-real-data-initial.png',
            fullPage: true
        });

        // Verify Current Balance (should be $1,362.00 from forecast-2025-11-20.md)
        const currentBalance = await page.locator('.summary-card:nth-child(1) .value').textContent();
        console.log('Current Balance:', currentBalance);
        expect(currentBalance).toContain('1,362.00');

        // Verify Lowest Point (should be -$492.65 from forecast)
        const lowestPoint = await page.locator('.summary-card:nth-child(2) .value').textContent();
        console.log('Lowest Point:', lowestPoint);
        expect(lowestPoint).toContain('-492.65');

        // Verify alert badges (should show 4 CRITICAL and 4 WARNING from forecast)
        const criticalBadge = await page.locator('.alert-badge:not(.warning)').textContent();
        const warningBadge = await page.locator('.alert-badge.warning').textContent();
        console.log('Critical Badge:', criticalBadge);
        console.log('Warning Badge:', warningBadge);
        expect(criticalBadge).toContain('4 CRITICAL');
        expect(warningBadge).toContain('4 WARNING');

        // Verify first transaction in table is from Nov 21
        const firstTransactionDate = await page.locator('tbody tr:first-child td:first-child').textContent();
        console.log('First Transaction Date:', firstTransactionDate);
        expect(firstTransactionDate).toContain('2025-11-21');

        // Verify glance cards - Status should be HEALTHY (ending balance is positive)
        const status = await page.locator('#statusValue').textContent();
        console.log('Status:', status);
        expect(status).toBe('HEALTHY');

        // Verify alert count in glance cards
        const alertCountGlance = await page.locator('#alertCount').textContent();
        console.log('Alert Count (Glance):', alertCountGlance);
        expect(alertCountGlance).toBe('8'); // 4 NEG + 4 LOW = 8

        // Take final screenshot after all checks
        await page.screenshot({
            path: 'test-results/dashboard-real-data-final.png',
            fullPage: true
        });

        // Output console messages
        console.log('Console Messages:', consoleMessages);
    });

    test('should display correct transaction details from forecast', async ({ page }) => {
        await page.goto('http://localhost:8080/forecasts/dashboard.html');
        await page.waitForTimeout(2000);

        // Check first few transactions match the forecast
        const transactions = await page.locator('tbody tr').evaluateAll(rows =>
            rows.slice(0, 5).map(row => ({
                date: row.cells[0].textContent,
                description: row.cells[1].textContent,
                amount: row.cells[2].textContent,
                balance: row.cells[3].textContent,
                status: row.cells[4].textContent
            }))
        );

        console.log('First 5 Transactions:', JSON.stringify(transactions, null, 2));

        // Verify Nov 21 - Early Acrisure Transfer $500
        expect(transactions[0].date).toContain('2025-11-21');
        expect(transactions[0].balance).toContain('1,829');

        // Take screenshot of transaction table
        await page.screenshot({
            path: 'test-results/dashboard-transactions.png',
            fullPage: true
        });
    });

    test('should display chart with real balance data', async ({ page }) => {
        await page.goto('http://localhost:8080/forecasts/dashboard.html');
        await page.waitForTimeout(2000);

        // Verify chart is visible
        const chartCanvas = page.locator('#balanceChart');
        await expect(chartCanvas).toBeVisible();

        // Scroll to chart section
        await page.locator('.chart-section').scrollIntoViewIfNeeded();

        // Take screenshot of chart
        await page.screenshot({
            path: 'test-results/dashboard-chart.png',
            fullPage: false
        });
    });
});
