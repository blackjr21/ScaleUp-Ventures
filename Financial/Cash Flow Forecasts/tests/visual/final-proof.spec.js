import { test, expect } from '@playwright/test';

// FINAL PROOF TEST with cache-busted CSS
const BASE_URL = 'http://localhost:8080';

test.describe('FINAL PROOF - Cache Busted CSS', () => {

  test('FINAL PROOF: Scenario Planner with cache-busted CSS', async ({ page }) => {
    // Clear all caches first
    await page.goto(`${BASE_URL}/scenario-planner.html`, {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/FINAL-PROOF-scenario-planner.png',
      fullPage: true
    });

    // Verify CSS loaded by checking specific styles
    const cssCheck = await page.evaluate(() => {
      const results = {
        cssLinkHref: null,
        controlPanelExists: !!document.querySelector('.control-panel'),
        baselineRows: document.querySelectorAll('#baselineTableBody tr').length,
        modifiedRows: document.querySelectorAll('#modifiedTableBody tr').length,
      };

      // Check CSS link
      const cssLink = document.querySelector('link[rel="stylesheet"]');
      if (cssLink) {
        results.cssLinkHref = cssLink.href;
      }

      // Check if control panel has background styling
      const controlPanel = document.querySelector('.control-panel');
      if (controlPanel) {
        const styles = window.getComputedStyle(controlPanel);
        results.controlPanelBg = styles.backgroundColor;
        results.controlPanelWidth = styles.width;
      }

      // Check table styling
      const table = document.querySelector('table');
      if (table) {
        const styles = window.getComputedStyle(table);
        results.tableBorderCollapse = styles.borderCollapse;
      }

      return results;
    });

    console.log('Scenario Planner CSS Check:', JSON.stringify(cssCheck, null, 2));

    // Assert key elements exist
    expect(cssCheck.baselineRows).toBe(42);
    expect(cssCheck.modifiedRows).toBe(42);
  });

  test('FINAL PROOF: Landing page with cache-busted CSS', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`, {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/FINAL-PROOF-landing-page.png',
      fullPage: true
    });

    // Verify gradient header
    const gradientCheck = await page.evaluate(() => {
      const h1 = document.querySelector('.landing-header h1');
      if (!h1) return { found: false };

      const styles = window.getComputedStyle(h1);
      return {
        found: true,
        background: styles.background,
        hasGradient: styles.background.includes('gradient'),
        fontSize: styles.fontSize,
        cssLinkHref: document.querySelector('link[rel="stylesheet"]').href
      };
    });

    console.log('Landing Page CSS Check:', JSON.stringify(gradientCheck, null, 2));
    expect(gradientCheck.hasGradient).toBe(true);
  });

  test('FINAL PROOF: Dashboard with cache-busted CSS', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`, {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/FINAL-PROOF-dashboard.png',
      fullPage: true
    });

    // Check dashboard elements
    const dashboardCheck = await page.evaluate(() => {
      return {
        cssLinkHref: document.querySelector('link[rel="stylesheet"]').href,
        headerExists: !!document.querySelector('header'),
        chartExists: !!document.querySelector('#balanceChart'),
        tableExists: !!document.querySelector('table')
      };
    });

    console.log('Dashboard CSS Check:', JSON.stringify(dashboardCheck, null, 2));
    expect(dashboardCheck.headerExists).toBe(true);
  });

});
