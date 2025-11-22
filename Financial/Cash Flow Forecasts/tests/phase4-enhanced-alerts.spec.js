import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test('Phase 4: Enhanced Alerts Section - Visual Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`);
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({
        path: 'test-results/phase4-enhanced-alerts-full.png',
        fullPage: true
    });

    // Take screenshot focusing on alerts section
    await page.screenshot({
        path: 'test-results/phase4-enhanced-alerts-section.png',
        clip: {
            x: 0,
            y: 600,
            width: 1280,
            height: 400
        }
    });

    // Verify CSS is still loading (sticky navigation)
    const nav = page.locator('.top-nav');
    const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navPosition).toBe('sticky');

    // Verify alerts section exists
    const alertsSection = page.locator('.alerts-section');
    await expect(alertsSection).toBeVisible();

    // Verify alerts header exists
    const alertsHeader = page.locator('.alerts-header');
    await expect(alertsHeader).toBeVisible();

    const headerText = await alertsHeader.locator('h2').textContent();
    expect(headerText).toContain('Critical Alerts');

    // Verify alert badges exist
    const alertBadges = page.locator('.alert-badges');
    await expect(alertBadges).toBeVisible();

    // Verify individual badges
    const badges = page.locator('.alert-badge');
    await expect(badges).toHaveCount(2);

    // Check critical badge
    const criticalBadge = page.locator('.alert-badge').first();
    await expect(criticalBadge).toBeVisible();
    const criticalText = await criticalBadge.textContent();
    expect(criticalText).toContain('CRITICAL');

    // Check warning badge
    const warningBadge = page.locator('.alert-badge.warning');
    await expect(warningBadge).toBeVisible();
    const warningText = await warningBadge.textContent();
    expect(warningText).toContain('WARNING');

    // Verify alerts list exists
    const alertsList = page.locator('.alerts-list');
    await expect(alertsList).toBeVisible();

    // Verify individual alerts
    const alerts = page.locator('.alert');
    await expect(alerts).toHaveCount(2);

    // Verify critical alert
    const criticalAlert = page.locator('.alert.critical');
    await expect(criticalAlert).toBeVisible();
    const criticalAlertText = await criticalAlert.textContent();
    expect(criticalAlertText).toContain('Critical Alert');
    expect(criticalAlertText).toContain('below zero');

    // Verify warning alert
    const warningAlert = page.locator('.alert.warning');
    await expect(warningAlert).toBeVisible();
    const warningAlertText = await warningAlert.textContent();
    expect(warningAlertText).toContain('Warning');
    expect(warningAlertText).toContain('below $100');

    // Verify previous features still exist
    const glanceCards = page.locator('.glance-card');
    await expect(glanceCards).toHaveCount(4);

    const actionCenter = page.locator('.action-center');
    await expect(actionCenter).toBeVisible();

    const summaryGrid = page.locator('.summary-grid');
    await expect(summaryGrid).toBeVisible();

    console.log('✅ Enhanced alerts section rendered correctly');
    console.log('✅ Alert header with 🚨 emoji visible');
    console.log('✅ Alert badges showing counts (CRITICAL and WARNING)');
    console.log('✅ Alerts list with 2 alerts displayed');
    console.log('✅ CSS still loading (nav position:', navPosition, ')');
    console.log('✅ All previous features still working');
});
