import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test('Phase 3: Action Center Widget - Visual Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`);
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({
        path: 'test-results/phase3-action-center-full.png',
        fullPage: true
    });

    // Take screenshot of top section with action center
    await page.screenshot({
        path: 'test-results/phase3-action-center-top.png',
        clip: {
            x: 0,
            y: 0,
            width: 1280,
            height: 800
        }
    });

    // Verify CSS is still loading (sticky navigation)
    const nav = page.locator('.top-nav');
    const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navPosition).toBe('sticky');

    // Verify action center exists
    const actionCenter = page.locator('.action-center');
    await expect(actionCenter).toBeVisible();

    // Verify action header
    const actionHeader = page.locator('.action-header');
    await expect(actionHeader).toBeVisible();
    const headerText = await actionHeader.textContent();
    expect(headerText).toContain('Recommended Action');

    // Verify priority badge
    const priorityBadge = page.locator('.action-priority');
    await expect(priorityBadge).toBeVisible();
    expect(await priorityBadge.textContent()).toBe('High Priority');

    // Verify action title
    const actionTitle = page.locator('.action-title');
    await expect(actionTitle).toBeVisible();
    const titleText = await actionTitle.textContent();
    expect(titleText).toContain('Transfer');
    expect(titleText).toContain('December');

    // Verify action why (explanation)
    const actionWhy = page.locator('.action-why');
    await expect(actionWhy).toBeVisible();
    const whyText = await actionWhy.textContent();
    expect(whyText).toContain('Prevents');

    // Verify alternatives section exists
    const alternatives = page.locator('.action-alternatives');
    await expect(alternatives).toBeVisible();

    // Verify summary element exists
    const summary = page.locator('.action-alternatives summary');
    await expect(summary).toBeVisible();
    const summaryText = await summary.textContent();
    expect(summaryText).toContain('Alternative Options');

    // Test that alternatives can be expanded/collapsed
    await summary.click();
    await page.waitForTimeout(300);
    const isOpen = await alternatives.evaluate(el => el.hasAttribute('open'));
    expect(isOpen).toBe(true);

    // Click again to collapse
    await summary.click();
    await page.waitForTimeout(300);
    const isClosed = await alternatives.evaluate(el => !el.hasAttribute('open'));
    expect(isClosed).toBe(true);

    // Verify glance cards still exist
    const glanceCards = page.locator('.glance-card');
    await expect(glanceCards).toHaveCount(4);

    // Verify summary grid still exists
    const summaryGrid = page.locator('.summary-grid');
    await expect(summaryGrid).toBeVisible();

    console.log('✅ Action Center widget rendered correctly');
    console.log('✅ Action header, priority badge, title, and explanation visible');
    console.log('✅ Alternative options collapsible section working');
    console.log('✅ CSS still loading (nav position:', navPosition, ')');
    console.log('✅ Previous features (glance cards, summary grid) still working');
});
