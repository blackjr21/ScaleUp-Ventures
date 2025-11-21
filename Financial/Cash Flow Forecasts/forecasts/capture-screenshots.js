const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to ensure consistent screenshots
  await page.setViewportSize({ width: 1920, height: 1080 });

  const dashboardPath = path.resolve(__dirname, 'dashboard.html');
  const fileUrl = `file://${dashboardPath}`;

  console.log(`Opening dashboard at: ${fileUrl}`);
  await page.goto(fileUrl);

  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Extra wait for chart rendering

  // Take full page screenshot
  const screenshotPath = path.resolve(__dirname, process.argv[2] || 'dashboard-screenshot.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Extract key metrics for verification
  const metrics = await page.evaluate(() => {
    const getTextContent = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent : 'Not found';
    };

    return {
      startingBalance: getTextContent('#startingBalance'),
      endingBalance: getTextContent('#endingBalance'),
      netPosition: getTextContent('#netPosition'),
      lowestPoint: getTextContent('#lowestPoint')
    };
  });

  console.log('\nCurrent Dashboard Metrics:');
  console.log('Starting Balance:', metrics.startingBalance);
  console.log('Ending Balance:', metrics.endingBalance);
  console.log('Net Position:', metrics.netPosition);
  console.log('Lowest Point:', metrics.lowestPoint);

  await browser.close();
})();
