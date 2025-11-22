import { test, expect } from '@playwright/test';

// Navigation validation tests - verify all 4 links on all 3 pages

test('Index page has all 4 navigation links', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
        path: 'test-results/navigation-index.png',
        fullPage: true
    });

    // Verify all 4 links exist
    const nav = page.locator('.top-nav');
    await expect(nav.locator('a:has-text("Home")')).toBeVisible();
    await expect(nav.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(nav.locator('a:has-text("Scenario Planner")')).toBeVisible();
    await expect(nav.locator('a:has-text("Debt Strategy")')).toBeVisible();

    // Verify active state
    await expect(nav.locator('a.active')).toHaveText('Home');

    console.log('✅ Index page navigation verified');
});

test('Dashboard page has all 4 navigation links', async ({ page }) => {
    await page.goto('http://localhost:8080/dashboard.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
        path: 'test-results/navigation-dashboard.png',
        fullPage: true
    });

    // Verify all 4 links exist
    const nav = page.locator('.top-nav');
    await expect(nav.locator('a:has-text("Home")')).toBeVisible();
    await expect(nav.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(nav.locator('a:has-text("Scenario Planner")')).toBeVisible();
    await expect(nav.locator('a:has-text("Debt Strategy")')).toBeVisible();

    // Verify active state
    await expect(nav.locator('a.active')).toHaveText('Dashboard');

    console.log('✅ Dashboard page navigation verified');
});

test('Scenario Planner page has all 4 navigation links', async ({ page }) => {
    await page.goto('http://localhost:8080/scenario-planner.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
        path: 'test-results/navigation-scenario-planner.png',
        fullPage: true
    });

    // Verify all 4 links exist
    const nav = page.locator('.top-nav');
    await expect(nav.locator('a:has-text("Home")')).toBeVisible();
    await expect(nav.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(nav.locator('a:has-text("Scenario Planner")')).toBeVisible();
    await expect(nav.locator('a:has-text("Debt Strategy")')).toBeVisible();

    // Verify active state
    await expect(nav.locator('a.active')).toHaveText('Scenario Planner');

    console.log('✅ Scenario Planner page navigation verified');
});

test('Navigation links work - from Index to Dashboard', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Click Dashboard link
    await page.click('.top-nav a:has-text("Dashboard")');

    // Wait for navigation
    await page.waitForURL('**/dashboard.html');
    await page.waitForLoadState('networkidle');

    // Verify active state changed
    const nav = page.locator('.top-nav');
    await expect(nav.locator('a.active')).toHaveText('Dashboard');

    console.log('✅ Index → Dashboard navigation works');
});

test('Navigation links work - from Dashboard to Scenario Planner', async ({ page }) => {
    await page.goto('http://localhost:8080/dashboard.html');
    await page.waitForLoadState('networkidle');

    // Click Scenario Planner link
    await page.click('.top-nav a:has-text("Scenario Planner")');

    // Wait for navigation
    await page.waitForURL('**/scenario-planner.html');
    await page.waitForLoadState('networkidle');

    // Verify active state changed
    const nav = page.locator('.top-nav');
    await expect(nav.locator('a.active')).toHaveText('Scenario Planner');

    console.log('✅ Dashboard → Scenario Planner navigation works');
});

test('Navigation links work - from Scenario Planner to Debt Strategy', async ({ page }) => {
    await page.goto('http://localhost:8080/scenario-planner.html');
    await page.waitForLoadState('networkidle');

    // Click Debt Strategy link
    await page.click('.top-nav a:has-text("Debt Strategy")');

    // Wait for navigation
    await page.waitForURL('**/debt-strategy-complete.html');
    await page.waitForLoadState('networkidle');

    // Take screenshot of debt strategy page
    await page.screenshot({
        path: 'test-results/navigation-to-debt-strategy.png',
        fullPage: true
    });

    // Verify active state
    const nav = page.locator('.top-nav');
    await expect(nav.locator('a.active')).toHaveText('Debt Strategy');

    console.log('✅ Scenario Planner → Debt Strategy navigation works');
});

test('Navigation links work - from Debt Strategy back to Home', async ({ page }) => {
    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await page.waitForFunction(() => {
        const element = document.querySelector('[data-metric="total-debt"]');
        return element && element.textContent !== 'Loading...';
    }, { timeout: 10000 });

    // Click Home link
    await page.click('.top-nav a:has-text("Home")');

    // Wait for navigation
    await page.waitForURL('**/index.html');
    await page.waitForLoadState('networkidle');

    // Verify active state
    const nav = page.locator('.top-nav');
    await expect(nav.locator('a.active')).toHaveText('Home');

    console.log('✅ Debt Strategy → Home navigation works');
});

test('All navigation links clickable on all pages', async ({ page }) => {
    const pages = [
        'http://localhost:8080/index.html',
        'http://localhost:8080/dashboard.html',
        'http://localhost:8080/scenario-planner.html'
    ];

    for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // Verify all links are clickable
        const links = await page.locator('.top-nav a').all();
        expect(links.length).toBe(4);

        for (const link of links) {
            await expect(link).toBeVisible();
            await expect(link).toBeEnabled();
        }
    }

    console.log('✅ All navigation links are clickable on all pages');
});
