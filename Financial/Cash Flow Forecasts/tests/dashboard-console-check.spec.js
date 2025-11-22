import { test, expect } from '@playwright/test';

test('Check dashboard console for errors', async ({ page }) => {
    const consoleMessages = [];
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text()
        });
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });

    await page.goto('http://localhost:8080/forecasts/dashboard.html');

    // Wait longer for data to load
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({
        path: 'test-results/dashboard-console-check.png',
        fullPage: true
    });

    // Log all console messages
    console.log('=== ALL CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => {
        console.log(`[${msg.type}] ${msg.text}`);
    });

    // Log errors specifically
    console.log('\n=== CONSOLE ERRORS ===');
    consoleErrors.forEach(err => {
        console.log(`ERROR: ${err}`);
    });

    // Log page errors
    console.log('\n=== PAGE ERRORS ===');
    pageErrors.forEach(err => {
        console.log(`PAGE ERROR: ${err}`);
    });

    // Check if forecast data was loaded
    const forecastDataLoaded = consoleMessages.some(msg =>
        msg.text.includes('Loaded forecast data')
    );
    console.log('\nForecast data loaded:', forecastDataLoaded);

    // Check actual values on page
    const currentBalance = await page.locator('.summary-card:nth-child(1) .value').textContent();
    const lowestPoint = await page.locator('.summary-card:nth-child(2) .value').textContent();
    console.log('\n=== DISPLAYED VALUES ===');
    console.log('Current Balance shown:', currentBalance);
    console.log('Lowest Point shown:', lowestPoint);
    console.log('Expected Current Balance: $1,362.00');
    console.log('Expected Lowest Point: -$492.65');
});
