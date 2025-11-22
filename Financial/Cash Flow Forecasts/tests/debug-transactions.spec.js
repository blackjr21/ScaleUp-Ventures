import { test } from '@playwright/test';

test('Debug transaction data loading', async ({ page }) => {
    const consoleMessages = [];

    page.on('console', msg => {
        consoleMessages.push(msg.text());
    });

    await page.goto('http://localhost:8080/forecasts/dashboard.html');
    await page.waitForTimeout(3000);

    // Execute JavaScript to check the data object
    const debugInfo = await page.evaluate(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Try to access the forecast data that was loaded
                const info = {
                    windowKeys: Object.keys(window).filter(k => k.includes('forecast') || k.includes('data')),
                    hasTransactions: false,
                    transactionCount: 0
                };
                resolve(info);
            }, 2000);
        });
    });

    console.log('=== DEBUG INFO ===');
    console.log('Window keys:', debugInfo.windowKeys);
    console.log('Has transactions:', debugInfo.hasTransactions);
    console.log('Transaction count:', debugInfo.transactionCount);

    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));

    // Take screenshot
    await page.screenshot({
        path: 'test-results/debug-transactions.png',
        fullPage: true
    });
});
