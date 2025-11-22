import { test, expect } from '@playwright/test';

/**
 * Debt Strategy Navigation Proof Test
 *
 * This test verifies that:
 * 1. The navigation link to Debt Strategy exists and is clickable
 * 2. Clicking the link successfully navigates to the debt strategy page
 * 3. Screenshots are captured as proof
 */

test('Verify Debt Strategy navigation from Scenario Planner with screenshot proof', async ({ page }) => {
    console.log('🧪 Starting Debt Strategy navigation test from Scenario Planner...');

    // Step 1: Navigate to Scenario Planner
    await page.goto('http://localhost:8080/scenario-planner.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Loaded Scenario Planner page');

    // Step 2: Take screenshot of Scenario Planner showing the nav link
    await page.screenshot({
        path: 'test-results/debt-nav-01-scenario-planner-before.png',
        fullPage: false
    });
    console.log('📸 Screenshot 1: Scenario Planner with nav bar');

    // Step 3: Verify the Debt Strategy link exists
    const nav = page.locator('.top-nav');
    const debtStrategyLink = nav.locator('a:has-text("Debt Strategy")');
    await expect(debtStrategyLink).toBeVisible();
    console.log('✅ Debt Strategy link is visible');

    // Step 4: Get the href attribute to verify it's correct
    const href = await debtStrategyLink.getAttribute('href');
    console.log(`📍 Debt Strategy link href: ${href}`);
    expect(href).toBe('../../Debt Payoff/debt-strategy-complete.html');

    // Step 5: Highlight the link before clicking (for screenshot proof)
    await debtStrategyLink.evaluate(el => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
    });
    await page.screenshot({
        path: 'test-results/debt-nav-02-link-highlighted.png',
        fullPage: false
    });
    console.log('📸 Screenshot 2: Debt Strategy link highlighted');

    // Step 6: Click the Debt Strategy link
    await debtStrategyLink.click();
    console.log('🖱️  Clicked Debt Strategy link');

    // Step 7: Wait for navigation to complete
    await page.waitForURL('**/debt-strategy-complete.html', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully navigated to Debt Strategy page');

    // Step 8: Verify we're on the debt strategy page
    await expect(page).toHaveURL(/debt-strategy-complete\.html$/);

    // Step 9: Wait for the page content to load
    const pageTitle = page.locator('h1').first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    const titleText = await pageTitle.textContent();
    console.log(`📄 Page title: ${titleText}`);

    // Step 10: Take final screenshot as proof
    await page.screenshot({
        path: 'test-results/debt-nav-03-debt-strategy-loaded.png',
        fullPage: true
    });
    console.log('📸 Screenshot 3: Debt Strategy page fully loaded');

    console.log('✅ TEST PASSED: Debt Strategy navigation works correctly!');
});

test('Verify Debt Strategy navigation from Index page with screenshot proof', async ({ page }) => {
    console.log('🧪 Starting Debt Strategy navigation test from Index page...');

    // Step 1: Navigate to Index page
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Loaded Index page');

    // Step 2: Take screenshot of Index page
    await page.screenshot({
        path: 'test-results/debt-nav-04-index-before.png',
        fullPage: false
    });
    console.log('📸 Screenshot 4: Index page with nav bar');

    // Step 3: Verify the Debt Strategy link in nav
    const navLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(navLink).toBeVisible();

    // Step 4: Verify the Debt Strategy card link
    const cardLink = page.locator('.page-card:has-text("Debt Strategy")');
    await expect(cardLink).toBeVisible();
    console.log('✅ Both nav link and card link are visible');

    // Step 5: Verify href on both links
    const navHref = await navLink.getAttribute('href');
    const cardHref = await cardLink.getAttribute('href');
    console.log(`📍 Nav link href: ${navHref}`);
    console.log(`📍 Card link href: ${cardHref}`);
    expect(navHref).toBe('../../Debt Payoff/debt-strategy-complete.html');
    expect(cardHref).toBe('../../Debt Payoff/debt-strategy-complete.html');

    // Step 6: Click the card link (more prominent on index page)
    await cardLink.evaluate(el => {
        el.style.outline = '3px solid blue';
        el.style.outlineOffset = '2px';
    });
    await page.screenshot({
        path: 'test-results/debt-nav-05-card-highlighted.png',
        fullPage: false
    });
    console.log('📸 Screenshot 5: Debt Strategy card highlighted');

    await cardLink.click();
    console.log('🖱️  Clicked Debt Strategy card');

    // Step 7: Wait for navigation
    await page.waitForURL('**/debt-strategy-complete.html', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Successfully navigated to Debt Strategy page');

    // Step 8: Take final screenshot
    await page.screenshot({
        path: 'test-results/debt-nav-06-from-index-success.png',
        fullPage: true
    });
    console.log('📸 Screenshot 6: Debt Strategy page loaded from Index');

    console.log('✅ TEST PASSED: Debt Strategy navigation from Index works!');
});

test('Verify Debt Strategy navigation from Dashboard with screenshot proof', async ({ page }) => {
    console.log('🧪 Starting Debt Strategy navigation test from Dashboard...');

    // Step 1: Navigate to Dashboard
    await page.goto('http://localhost:8080/dashboard.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Loaded Dashboard page');

    // Step 2: Verify the Debt Strategy link
    const debtStrategyLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(debtStrategyLink).toBeVisible();

    const href = await debtStrategyLink.getAttribute('href');
    console.log(`📍 Debt Strategy link href: ${href}`);
    expect(href).toBe('../../Debt Payoff/debt-strategy-complete.html');

    // Step 3: Click and navigate
    await debtStrategyLink.click();
    await page.waitForURL('**/debt-strategy-complete.html', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Step 4: Verify successful navigation
    await expect(page).toHaveURL(/debt-strategy-complete\.html$/);

    await page.screenshot({
        path: 'test-results/debt-nav-07-from-dashboard-success.png',
        fullPage: true
    });
    console.log('📸 Screenshot 7: Debt Strategy page loaded from Dashboard');

    console.log('✅ TEST PASSED: Debt Strategy navigation from Dashboard works!');
});
