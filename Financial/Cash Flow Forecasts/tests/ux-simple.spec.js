import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('UX Improvements - Basic Verification', () => {

  test('Navigation exists on all pages with screenshots', async ({ page }) => {
    // Landing page
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.locator('.top-nav')).toBeVisible();
    await expect(page.locator('.top-nav a.active')).toHaveText('Home');
    await page.screenshot({ path: 'test-results/UX-nav-landing.png', fullPage: true });

    // Dashboard
    await page.goto(`${BASE_URL}/dashboard-only.html`);
    await expect(page.locator('.top-nav')).toBeVisible();
    await expect(page.locator('.top-nav a.active')).toHaveText('Dashboard');
    await page.screenshot({ path: 'test-results/UX-nav-dashboard.png', fullPage: true });

    // Scenario planner
    await page.goto(`${BASE_URL}/scenario-planner.html`);
    await expect(page.locator('.top-nav')).toBeVisible();
    await expect(page.locator('.top-nav a.active')).toHaveText('Scenario Planner');
    await page.screenshot({ path: 'test-results/UX-nav-scenario.png', fullPage: true });
  });

  test('Summary card exists on dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    const summaryCard = page.locator('#summaryCard, .summary-card');
    await expect(summaryCard).toBeVisible();

    await page.screenshot({ path: 'test-results/UX-summary-card.png', fullPage: true });
  });

  test('Impact summary container exists on scenario planner', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-planner.html`);

    const impactSummary = page.locator('#impactSummary');
    await expect(impactSummary).toBeAttached();

    await page.screenshot({ path: 'test-results/UX-scenario-planner.png', fullPage: true });
  });

  test('Navigation is sticky on scroll', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    const nav = page.locator('.top-nav');
    const position = await nav.evaluate(el => window.getComputedStyle(el).position);
    const zIndex = await nav.evaluate(el => window.getComputedStyle(el).zIndex);

    expect(position).toBe('sticky');
    expect(parseInt(zIndex)).toBeGreaterThan(50);
  });

  test('CSS classes are applied correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard-only.html`);

    const summaryCard = page.locator('.summary-card');
    const hasClass = await summaryCard.evaluate(el =>
      el.classList.contains('critical') ||
      el.classList.contains('warning') ||
      el.classList.contains('safe')
    );

    expect(hasClass).toBe(true);
  });
});
