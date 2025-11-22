import { test, expect } from '@playwright/test';

// Test pages via HTTP server to verify CORS issues are resolved
const BASE_URL = 'http://localhost:8080';

test.describe('HTTP Server Visual Verification', () => {

  test('Landing page via HTTP - full verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/http-landing-page.png',
      fullPage: true
    });

    // Verify CSS loaded by checking computed styles
    const headerColor = await page.evaluate(() => {
      const h1 = document.querySelector('.landing-header h1');
      if (!h1) return null;
      return window.getComputedStyle(h1).background;
    });

    console.log('Header background:', headerColor);

    // Verify header exists
    await expect(page.locator('.landing-header h1')).toBeVisible();

    // Verify cards exist
    await expect(page.locator('.page-card[href="dashboard-only.html"]')).toBeVisible();
    await expect(page.locator('.page-card[href="scenario-planner.html"]')).toBeVisible();
  });

  test('Dashboard page via HTTP - full verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/http-dashboard-page.png',
      fullPage: true
    });

    // Verify key elements
    await expect(page.locator('header h1')).toBeVisible();
    await expect(page.locator('.glance-summary')).toBeVisible();
    await expect(page.locator('#balanceChart')).toBeVisible();

    // Check if CSS loaded by verifying element has styled colors
    const statusCardBg = await page.evaluate(() => {
      const card = document.querySelector('.glance-card');
      if (!card) return null;
      return window.getComputedStyle(card).backgroundColor;
    });

    console.log('Card background color:', statusCardBg);
    expect(statusCardBg).not.toBe('rgba(0, 0, 0, 0)'); // Should have background color
  });

  test('Scenario planner via HTTP - full verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-planner.html`);
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/http-scenario-planner.png',
      fullPage: true
    });

    // Verify control panel
    await expect(page.locator('.control-panel')).toBeVisible();

    // Verify tables
    const baselineRows = await page.locator('#baselineTableBody tr').count();
    const modifiedRows = await page.locator('#modifiedTableBody tr').count();

    console.log('Baseline rows:', baselineRows);
    console.log('Modified rows:', modifiedRows);

    expect(baselineRows).toBe(42);
    expect(modifiedRows).toBe(42);
  });

  test('CSS Loading Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // Check if CSS file was loaded successfully
    const cssLoaded = await page.evaluate(async () => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const results = [];

      for (const link of links) {
        const href = link.href;
        try {
          const response = await fetch(href);
          results.push({
            href: href,
            status: response.status,
            ok: response.ok
          });
        } catch (error) {
          results.push({
            href: href,
            error: error.message
          });
        }
      }

      return results;
    });

    console.log('CSS Load Results:', JSON.stringify(cssLoaded, null, 2));

    // Verify all CSS files loaded successfully
    for (const result of cssLoaded) {
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    }
  });

});
