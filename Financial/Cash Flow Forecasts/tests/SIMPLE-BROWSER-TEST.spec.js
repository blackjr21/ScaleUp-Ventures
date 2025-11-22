import { test, expect } from '@playwright/test';

test('Open debt strategy page directly and check for errors', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n🔍 Opening debt strategy page directly...\n');

    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log('❌ JavaScript Error:', msg.text());
        }
    });

    // Navigate directly
    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    console.log('✅ Page loaded\n');

    // Wait for data to load or error to appear
    await page.waitForTimeout(5000);

    // Check if error banner is visible
    const errorBanner = page.locator('.error-banner');
    const hasError = await errorBanner.isVisible();

    if (hasError) {
        const errorText = await errorBanner.textContent();
        console.log('⚠️  Error banner visible:');
        console.log(errorText);
        console.log();
    } else {
        console.log('✅ No error banner - data loaded successfully!\n');
    }

    // Take screenshot
    await page.screenshot({
        path: 'test-results/DIRECT-PAGE-LOAD.png',
        fullPage: true
    });
    console.log('📸 Screenshot saved: DIRECT-PAGE-LOAD.png\n');

    // Print all JavaScript errors
    if (errors.length > 0) {
        console.log(`\n❌ Found ${errors.length} JavaScript errors:`);
        errors.forEach((err, i) => {
            console.log(`   ${i + 1}. ${err}`);
        });
    } else {
        console.log('✅ No JavaScript errors detected!\n');
    }

    // Keep browser open
    await page.waitForTimeout(3000);
});
