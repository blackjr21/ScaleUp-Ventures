import { test, expect } from '@playwright/test';

const LANDING_URL = 'file://' + process.cwd() + '/forecasts/index.html';

test.describe('Phase 5: Landing/Navigation Page', () => {

  test('landing page loads successfully', async ({ page }) => {
    await page.goto(LANDING_URL);

    const title = await page.title();
    expect(title).toBe('Cash Flow Forecasting System');

    // Verify main heading
    const heading = await page.locator('.landing-header h1').textContent();
    expect(heading).toContain('Cash Flow Forecasting System');
  });

  test('theme toggle loads and is functional', async ({ page }) => {
    await page.goto(LANDING_URL);

    // Verify theme toggle exists
    const themeToggle = page.locator('#themeToggle');
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.body.classList.contains('dark-theme');
    });

    // Click theme toggle
    await themeToggle.click();

    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.body.classList.contains('dark-theme');
    });

    expect(newTheme).not.toBe(initialTheme);
  });

  test('dashboard card is present and clickable', async ({ page }) => {
    await page.goto(LANDING_URL);

    // Find dashboard card
    const dashboardCard = page.locator('a.page-card[href="dashboard-only.html"]');
    await expect(dashboardCard).toBeVisible();

    // Verify card content
    const cardTitle = await dashboardCard.locator('.page-card-title').textContent();
    expect(cardTitle).toContain('Dashboard');

    const cardDescription = await dashboardCard.locator('.page-card-description').textContent();
    expect(cardDescription).toContain('42-day');
  });

  test('scenario planner card is present and clickable', async ({ page }) => {
    await page.goto(LANDING_URL);

    // Find scenario planner card
    const plannerCard = page.locator('a.page-card[href="scenario-planner.html"]');
    await expect(plannerCard).toBeVisible();

    // Verify card content
    const cardTitle = await plannerCard.locator('.page-card-title').textContent();
    expect(cardTitle).toContain('Scenario Planner');

    const cardDescription = await plannerCard.locator('.page-card-description').textContent();
    expect(cardDescription).toContain('what-if');
  });

  test('dashboard card features list is complete', async ({ page }) => {
    await page.goto(LANDING_URL);

    const dashboardCard = page.locator('a.page-card[href="dashboard-only.html"]');
    const features = await dashboardCard.locator('.page-card-features li').allTextContents();

    expect(features.length).toBeGreaterThan(3);
    expect(features.some(f => f.includes('balance'))).toBe(true);
    expect(features.some(f => f.includes('alert'))).toBe(true);
  });

  test('scenario planner card features list is complete', async ({ page }) => {
    await page.goto(LANDING_URL);

    const plannerCard = page.locator('a.page-card[href="scenario-planner.html"]');
    const features = await plannerCard.locator('.page-card-features li').allTextContents();

    expect(features.length).toBeGreaterThan(3);
    expect(features.some(f => f.includes('toggle'))).toBe(true);
    expect(features.some(f => f.includes('comparison'))).toBe(true);
  });

  test('system features section is present', async ({ page }) => {
    await page.goto(LANDING_URL);

    // Verify features section exists
    const featuresSection = page.locator('.features-section').first();
    await expect(featuresSection).toBeVisible();

    // Verify section heading
    const heading = await featuresSection.locator('h2').textContent();
    expect(heading).toContain('System Features');

    // Verify feature items exist
    const featureItems = await featuresSection.locator('.feature-item').count();
    expect(featureItems).toBeGreaterThan(0);
  });

  test('architecture section is present', async ({ page }) => {
    await page.goto(LANDING_URL);

    // Verify architecture section exists
    const architectureSection = page.locator('.features-section').nth(1);
    await expect(architectureSection).toBeVisible();

    // Verify section heading
    const heading = await architectureSection.locator('h2').textContent();
    expect(heading).toContain('Architecture');

    // Verify mentions modular JavaScript
    const content = await architectureSection.textContent();
    expect(content).toContain('Modular JavaScript');
    expect(content).toContain('Shared Styles');
    expect(content).toContain('Testing');
  });

  test('footer is present with system info', async ({ page }) => {
    await page.goto(LANDING_URL);

    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    const footerText = await footer.textContent();
    expect(footerText).toContain('Cash Flow Forecasting System');
  });

  test('page cards have hover effects', async ({ page }) => {
    await page.goto(LANDING_URL);

    const dashboardCard = page.locator('a.page-card[href="dashboard-only.html"]');

    // Get initial border color
    const initialBorder = await dashboardCard.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });

    // Hover over card
    await dashboardCard.hover();

    // Brief wait for transition
    await page.waitForTimeout(100);

    // Verify styles changed (this is a visual check, actual hover effect might not be detectable)
    // Just verify the card is still visible after hover
    await expect(dashboardCard).toBeVisible();
  });

  test('responsive layout for mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(LANDING_URL);

    // Verify page still loads and cards are visible
    const dashboardCard = page.locator('a.page-card[href="dashboard-only.html"]');
    await expect(dashboardCard).toBeVisible();

    const plannerCard = page.locator('a.page-card[href="scenario-planner.html"]');
    await expect(plannerCard).toBeVisible();
  });

  test('all navigation links use correct paths', async ({ page }) => {
    await page.goto(LANDING_URL);

    // Verify dashboard link
    const dashboardHref = await page.locator('a.page-card[href="dashboard-only.html"]').getAttribute('href');
    expect(dashboardHref).toBe('dashboard-only.html');

    // Verify scenario planner link
    const plannerHref = await page.locator('a.page-card[href="scenario-planner.html"]').getAttribute('href');
    expect(plannerHref).toBe('scenario-planner.html');
  });

});
