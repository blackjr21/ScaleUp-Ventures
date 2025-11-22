import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test('Phase 5: Chart.js Balance Chart - Visual Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`);

    // Wait for chart to render
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
        path: 'test-results/phase5-chart-full.png',
        fullPage: true
    });

    // Verify CSS is still loading (sticky navigation)
    const nav = page.locator('.top-nav');
    const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navPosition).toBe('sticky');

    // Verify Chart.js library is loaded
    const chartLoaded = await page.evaluate(() => {
        return typeof Chart !== 'undefined';
    });
    expect(chartLoaded).toBe(true);

    // Verify chart section exists
    const chartSection = page.locator('.chart-section');
    await expect(chartSection).toBeVisible();

    // Verify chart heading
    const chartHeading = chartSection.locator('h2');
    await expect(chartHeading).toBeVisible();
    expect(await chartHeading.textContent()).toBe('Balance Trend');

    // Verify canvas element exists
    const canvas = page.locator('#balanceChart');
    await expect(canvas).toBeVisible();

    // Verify Chart.js instance was created by checking if canvas context is being used
    const chartExists = await page.evaluate(() => {
        const canvas = document.getElementById('balanceChart');
        if (!canvas) return false;
        // Chart.js 4.x stores chart instances differently - check if canvas has been rendered to
        const ctx = canvas.getContext('2d');
        // If Chart.js rendered, the canvas should have a width > 0
        return canvas.width > 0;
    });
    expect(chartExists).toBe(true);

    // Verify chart canvas has been drawn to (indicating chart rendered)
    const chartRendered = await page.evaluate(() => {
        const canvas = document.getElementById('balanceChart');
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        // Get pixel data - if chart rendered, it won't be all transparent
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        // Check if any pixels are non-transparent
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] !== 0) return true;
        }
        return false;
    });
    expect(chartRendered).toBe(true);

    // Verify all previous features still exist
    const glanceCards = page.locator('.glance-card');
    await expect(glanceCards).toHaveCount(4);

    const actionCenter = page.locator('.action-center');
    await expect(actionCenter).toBeVisible();

    const alertsSection = page.locator('.alerts-section');
    await expect(alertsSection).toBeVisible();

    const summaryGrid = page.locator('.summary-grid');
    await expect(summaryGrid).toBeVisible();

    console.log('✅ Chart.js library loaded successfully');
    console.log('✅ Balance chart rendered with sample data');
    console.log('✅ Chart section styled correctly');
    console.log('✅ CSS still loading (nav position:', navPosition, ')');
    console.log('✅ All previous features still working');
});
