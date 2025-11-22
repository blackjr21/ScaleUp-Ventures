import { test, expect } from '@playwright/test';

/**
 * Debt Strategy Navigation Final Proof Test
 *
 * This test verifies that the Debt Strategy link works correctly
 * by opening in a new tab/window to localhost:8000
 */

test('Verify Debt Strategy link from Scenario Planner opens correctly', async ({ context, page }) => {
    console.log('🧪 Testing Debt Strategy navigation from Scenario Planner...');

    // Step 1: Navigate to Scenario Planner
    await page.goto('http://localhost:8080/scenario-planner.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Loaded Scenario Planner page');

    // Step 2: Take screenshot showing the nav bar
    await page.screenshot({
        path: 'test-results/debt-final-01-scenario-planner.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 200 }
    });
    console.log('📸 Screenshot 1: Scenario Planner nav bar');

    // Step 3: Verify the Debt Strategy link exists and has correct attributes
    const debtStrategyLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(debtStrategyLink).toBeVisible();

    const href = await debtStrategyLink.getAttribute('href');
    const target = await debtStrategyLink.getAttribute('target');
    console.log(`📍 Debt Strategy link href: ${href}`);
    console.log(`📍 Debt Strategy link target: ${target}`);

    expect(href).toBe('http://localhost:8000/debt-strategy-complete.html');
    expect(target).toBe('_blank');

    // Step 4: Highlight the link
    await debtStrategyLink.evaluate(el => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
    });
    await page.screenshot({
        path: 'test-results/debt-final-02-link-highlighted.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 200 }
    });
    console.log('📸 Screenshot 2: Link highlighted');

    // Step 5: Click the link and wait for new page
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        debtStrategyLink.click()
    ]);
    console.log('🖱️  Clicked Debt Strategy link');

    // Step 6: Wait for the new page to load
    await newPage.waitForLoadState('networkidle');
    console.log('✅ New page opened');

    // Step 7: Verify the URL of the new page
    const newUrl = newPage.url();
    console.log(`📍 New page URL: ${newUrl}`);
    expect(newUrl).toBe('http://localhost:8000/debt-strategy-complete.html');

    // Step 8: Wait for content to load
    await newPage.waitForTimeout(2000); // Give it time to load data

    // Step 9: Take screenshot of the debt strategy page
    await newPage.screenshot({
        path: 'test-results/debt-final-03-debt-strategy-page.png',
        fullPage: true
    });
    console.log('📸 Screenshot 3: Debt Strategy page loaded');

    // Step 10: Verify page has expected content
    const heading = newPage.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    console.log(`📄 Page heading: ${headingText}`);

    // Step 11: Close the new page
    await newPage.close();

    console.log('✅ TEST PASSED: Debt Strategy navigation works correctly!');
});

test('Verify Debt Strategy card link from Index page', async ({ context, page }) => {
    console.log('🧪 Testing Debt Strategy card link from Index page...');

    // Navigate to Index
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Loaded Index page');

    // Find the Debt Strategy card
    const cardLink = page.locator('.page-card:has-text("Debt Strategy")');
    await expect(cardLink).toBeVisible();

    // Verify href and target
    const href = await cardLink.getAttribute('href');
    const target = await cardLink.getAttribute('target');
    console.log(`📍 Card link href: ${href}`);
    console.log(`📍 Card link target: ${target}`);

    expect(href).toBe('http://localhost:8000/debt-strategy-complete.html');
    expect(target).toBe('_blank');

    // Highlight the card
    await cardLink.evaluate(el => {
        el.style.outline = '4px solid blue';
        el.style.outlineOffset = '4px';
    });
    await page.screenshot({
        path: 'test-results/debt-final-04-card-highlighted.png',
        fullPage: false
    });
    console.log('📸 Screenshot 4: Debt Strategy card highlighted');

    // Click and verify new page opens
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        cardLink.click()
    ]);
    console.log('🖱️  Clicked Debt Strategy card');

    await newPage.waitForLoadState('networkidle');
    expect(newPage.url()).toBe('http://localhost:8000/debt-strategy-complete.html');

    await newPage.screenshot({
        path: 'test-results/debt-final-05-from-card.png',
        fullPage: true
    });
    console.log('📸 Screenshot 5: Opened from card link');

    await newPage.close();
    console.log('✅ TEST PASSED: Card link navigation works!');
});

test('Verify Debt Strategy link from Dashboard', async ({ context, page }) => {
    console.log('🧪 Testing Debt Strategy navigation from Dashboard...');

    await page.goto('http://localhost:8080/dashboard.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Loaded Dashboard page');

    const debtStrategyLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(debtStrategyLink).toBeVisible();

    const href = await debtStrategyLink.getAttribute('href');
    expect(href).toBe('http://localhost:8000/debt-strategy-complete.html');

    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        debtStrategyLink.click()
    ]);

    await newPage.waitForLoadState('networkidle');
    expect(newPage.url()).toBe('http://localhost:8000/debt-strategy-complete.html');

    await newPage.screenshot({
        path: 'test-results/debt-final-06-from-dashboard.png',
        fullPage: true
    });
    console.log('📸 Screenshot 6: Opened from Dashboard');

    await newPage.close();
    console.log('✅ TEST PASSED: Dashboard link navigation works!');
});

test('Visual proof - all three pages have working Debt Strategy links', async ({ page }) => {
    console.log('🧪 Creating visual proof composite...');

    const pages = [
        { url: 'http://localhost:8080/index.html', name: 'Index' },
        { url: 'http://localhost:8080/dashboard.html', name: 'Dashboard' },
        { url: 'http://localhost:8080/scenario-planner.html', name: 'Scenario Planner' }
    ];

    for (const pageInfo of pages) {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');

        // Highlight the Debt Strategy link
        const link = page.locator('.top-nav a:has-text("Debt Strategy")');
        await link.evaluate(el => {
            el.style.outline = '3px solid #00ff00';
            el.style.outlineOffset = '2px';
            el.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        });

        await page.screenshot({
            path: `test-results/debt-final-proof-${pageInfo.name.toLowerCase().replace(' ', '-')}.png`,
            fullPage: false,
            clip: { x: 0, y: 0, width: 1280, height: 250 }
        });
        console.log(`📸 Captured ${pageInfo.name} with highlighted link`);
    }

    console.log('✅ Visual proof complete for all three pages!');
});
