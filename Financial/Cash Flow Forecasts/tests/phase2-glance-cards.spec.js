import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test('Phase 2: Glance Summary Cards - Visual Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`);
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({
        path: 'test-results/phase2-glance-cards-full.png',
        fullPage: true
    });

    // Take screenshot of top section with glance cards
    await page.screenshot({
        path: 'test-results/phase2-glance-cards-top.png',
        clip: {
            x: 0,
            y: 0,
            width: 1280,
            height: 600
        }
    });

    // Verify CSS is still loading (sticky navigation)
    const nav = page.locator('.top-nav');
    const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navPosition).toBe('sticky');

    // Verify glance summary section exists
    const glanceSummary = page.locator('.glance-summary');
    await expect(glanceSummary).toBeVisible();

    // Verify all 4 glance cards exist
    const glanceCards = page.locator('.glance-card');
    await expect(glanceCards).toHaveCount(4);

    // Verify Status card
    const statusCard = page.locator('#statusCard');
    await expect(statusCard).toBeVisible();
    const statusValue = await statusCard.locator('.value').textContent();
    expect(statusValue).toBe('HEALTHY');

    // Verify Next 30 Days card (caution card)
    const cautionCard = page.locator('.glance-card.caution');
    await expect(cautionCard).toBeVisible();
    const alertText = await cautionCard.textContent();
    expect(alertText).toContain('Alerts');

    // Verify Cash Runway card
    const runwayCard = page.locator('#runwayCard');
    await expect(runwayCard).toBeVisible();
    const runwayText = await runwayCard.textContent();
    expect(runwayText).toContain('days');

    // Verify runway bar exists
    const runwayBar = runwayCard.locator('.runway-bar');
    await expect(runwayBar).toBeVisible();
    const runwayFill = runwayCard.locator('.runway-fill');
    await expect(runwayFill).toBeVisible();

    // Verify Disposable Income card
    const savingsCard = page.locator('#savingsCard');
    await expect(savingsCard).toBeVisible();
    const savingsText = await savingsCard.textContent();
    expect(savingsText).toContain('%');

    // Verify the existing summary grid still exists below glance cards
    const summaryGrid = page.locator('.summary-grid');
    await expect(summaryGrid).toBeVisible();

    console.log('✅ Glance summary cards rendered correctly');
    console.log('✅ All 4 cards present (Status, Alerts, Runway, Disposable Income)');
    console.log('✅ CSS still loading (nav position:', navPosition, ')');
    console.log('✅ Runway progress bar rendered');
});
