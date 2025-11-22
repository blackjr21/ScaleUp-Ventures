import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test('Emergency Banner - Visual Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`);
    await page.waitForTimeout(1000);

    // Make the emergency banner visible for testing
    await page.evaluate(() => {
        const banner = document.getElementById('emergencyBanner');
        if (banner) {
            banner.style.display = 'flex';
        }
    });

    await page.waitForTimeout(500);

    // Take full page screenshot
    await page.screenshot({
        path: 'test-results/phase1-emergency-banner-full.png',
        fullPage: true
    });

    // Take screenshot of just the top with banner
    await page.screenshot({
        path: 'test-results/phase1-emergency-banner-top.png',
        clip: {
            x: 0,
            y: 0,
            width: 1280,
            height: 400
        }
    });

    // Verify CSS is still loading
    const nav = page.locator('.top-nav');
    const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navPosition).toBe('sticky');

    // Verify emergency banner exists and is visible
    const banner = page.locator('.emergency-banner');
    await expect(banner).toBeVisible();

    // Verify banner content
    const bannerText = await banner.textContent();
    expect(bannerText).toContain('URGENT');
    expect(bannerText).toContain('Negative balance');

    // Verify button exists
    const button = page.locator('.emergency-action');
    await expect(button).toBeVisible();

    console.log('✅ Emergency banner rendered correctly');
    console.log('✅ CSS still loading (nav position:', navPosition, ')');
    console.log('✅ Banner text:', bannerText.trim().substring(0, 50));
});
