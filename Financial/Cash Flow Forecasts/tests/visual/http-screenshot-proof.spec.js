import { test, expect } from '@playwright/test';

// PROOF TEST - Take screenshots via HTTP server to verify pages actually work
const BASE_URL = 'http://localhost:8080';

test.describe('HTTP Screenshot Proof Tests', () => {

  test('PROOF: Landing page via HTTP', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/PROOF-http-landing.png',
      fullPage: true
    });

    // Log what we see
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);

    // Check for CSS by looking at computed style of header
    const hasGradient = await page.evaluate(() => {
      const h1 = document.querySelector('.landing-header h1');
      if (!h1) return { found: false, reason: 'h1 not found' };

      const style = window.getComputedStyle(h1);
      const bg = style.background;
      const hasGrad = bg.includes('gradient');

      return {
        found: true,
        hasGradient: hasGrad,
        background: bg,
        color: style.color,
        fontSize: style.fontSize
      };
    });

    console.log('CSS Check:', JSON.stringify(hasGradient, null, 2));
  });

  test('PROOF: Dashboard via HTTP', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);
    await page.waitForTimeout(3000); // Wait for chart to render

    // Take screenshot
    await page.screenshot({
      path: 'test-results/PROOF-http-dashboard.png',
      fullPage: true
    });

    // Check for styled elements
    const dashboardCheck = await page.evaluate(() => {
      const checks = {
        headerExists: !!document.querySelector('header'),
        chartExists: !!document.querySelector('#balanceChart'),
        tableExists: !!document.querySelector('table'),
      };

      // Check if amounts are colored
      const amounts = Array.from(document.querySelectorAll('.amount-col'));
      const redAmounts = amounts.filter(el => {
        const color = window.getComputedStyle(el).color;
        return color.includes('255, 0, 0') || color.includes('239, 68, 68');
      });
      const greenAmounts = amounts.filter(el => {
        const color = window.getComputedStyle(el).color;
        return color.includes('0, 255, 0') || color.includes('34, 197, 94');
      });

      checks.redAmountCount = redAmounts.length;
      checks.greenAmountCount = greenAmounts.length;

      return checks;
    });

    console.log('Dashboard Check:', JSON.stringify(dashboardCheck, null, 2));
  });

  test('PROOF: Scenario planner via HTTP', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-planner.html`);
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/PROOF-http-scenario.png',
      fullPage: true
    });

    // Check tables rendered
    const tableCheck = await page.evaluate(() => {
      const baselineRows = document.querySelectorAll('#baselineTableBody tr').length;
      const modifiedRows = document.querySelectorAll('#modifiedTableBody tr').length;

      return {
        baselineRows,
        modifiedRows,
        controlPanelExists: !!document.querySelector('.control-panel'),
      };
    });

    console.log('Scenario Check:', JSON.stringify(tableCheck, null, 2));
  });

});
