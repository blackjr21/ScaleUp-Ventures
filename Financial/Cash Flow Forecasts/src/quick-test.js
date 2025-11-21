const { chromium } = require('playwright');
const path = require('path');

async function quickTest() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    const dashboardPath = path.join(__dirname, 'Cash Flow Projections', 'dashboard-full.html');
    await page.goto(`file://${dashboardPath}`, { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    // Take screenshots
    await page.screenshot({
        path: path.join(__dirname, 'temp', 'dashboard-full-desktop.png'),
        fullPage: true
    });

    console.log('✅ Screenshot saved to temp/dashboard-full-desktop.png');

    // Check table rows
    const rows = await page.locator('table tbody tr').count();
    console.log(`📋 Table rows: ${rows}`);

    await browser.close();
}

quickTest().catch(console.error);
