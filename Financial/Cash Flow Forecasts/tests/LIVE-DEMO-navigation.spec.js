import { test, expect } from '@playwright/test';

/**
 * LIVE DEMONSTRATION: Debt Strategy Navigation
 *
 * This test runs in HEADED mode (visible browser) to demonstrate
 * that clicking the Debt Strategy link successfully navigates to the page.
 *
 * Run with: npx playwright test tests/LIVE-DEMO-navigation.spec.js --headed
 */

test('LIVE DEMO: Click Debt Strategy link from Scenario Planner', async ({ context, page }) => {
    test.setTimeout(60000); // 60 seconds for demo

    console.log('\n🎬 STARTING LIVE DEMONSTRATION');
    console.log('=' .repeat(80));
    console.log('This test will open a visible browser and demonstrate the navigation.\n');

    // Step 1: Navigate to Scenario Planner
    console.log('📍 Step 1: Loading Scenario Planner page...');
    await page.goto('http://localhost:8080/scenario-planner.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Scenario Planner loaded');

    // Step 2: Take screenshot before clicking
    await page.screenshot({
        path: 'test-results/LIVE-01-scenario-planner-before-click.png',
        fullPage: true
    });
    console.log('📸 Screenshot 1: Scenario Planner page (before click)');

    // Step 3: Find and highlight the Debt Strategy link
    console.log('\n📍 Step 2: Locating Debt Strategy link...');
    const debtStrategyLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(debtStrategyLink).toBeVisible();

    const href = await debtStrategyLink.getAttribute('href');
    const target = await debtStrategyLink.getAttribute('target');
    console.log(`   Link href: ${href}`);
    console.log(`   Link target: ${target}`);

    // Highlight the link
    await debtStrategyLink.evaluate(el => {
        el.style.outline = '5px solid red';
        el.style.outlineOffset = '3px';
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
    });

    await page.screenshot({
        path: 'test-results/LIVE-02-link-highlighted.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 200 }
    });
    console.log('📸 Screenshot 2: Debt Strategy link highlighted');

    // Step 4: Wait a moment for visibility (demo purposes)
    console.log('\n⏳ Waiting 1 second before clicking...');
    await page.waitForTimeout(1000);

    // Step 5: Click the link and capture the new page
    console.log('\n📍 Step 3: Clicking Debt Strategy link...');
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        debtStrategyLink.click()
    ]);
    console.log('🖱️  Link clicked! New tab opened.');

    // Step 6: Wait for new page to load
    console.log('\n📍 Step 4: Waiting for Debt Strategy page to load...');
    await newPage.waitForLoadState('networkidle', { timeout: 10000 });

    const newUrl = newPage.url();
    console.log(`   New page URL: ${newUrl}`);

    // Verify we're on the correct page
    expect(newUrl).toBe('http://localhost:8000/debt-strategy-complete.html');
    console.log('✅ Navigated to correct URL');

    // Step 7: Wait for content to load
    console.log('\n📍 Step 5: Waiting for page content to load...');
    await newPage.waitForTimeout(2000);

    // Step 8: Take screenshot of the debt strategy page
    await newPage.screenshot({
        path: 'test-results/LIVE-03-debt-strategy-loaded.png',
        fullPage: true
    });
    console.log('📸 Screenshot 3: Debt Strategy page fully loaded');

    // Step 9: Verify page has content
    const heading = newPage.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    console.log(`   Page heading: "${headingText}"`);

    // Step 10: Take a zoomed screenshot of the top of the page
    await newPage.screenshot({
        path: 'test-results/LIVE-04-debt-strategy-header.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 600 }
    });
    console.log('📸 Screenshot 4: Debt Strategy page header section');

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ DEMONSTRATION COMPLETE');
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Started at: http://localhost:8080/scenario-planner.html`);
    console.log(`   ✅ Clicked: Debt Strategy link`);
    console.log(`   ✅ Navigated to: ${newUrl}`);
    console.log(`   ✅ Page loaded successfully with content`);
    console.log('\n📸 Screenshots saved:');
    console.log('   1. LIVE-01-scenario-planner-before-click.png');
    console.log('   2. LIVE-02-link-highlighted.png');
    console.log('   3. LIVE-03-debt-strategy-loaded.png');
    console.log('   4. LIVE-04-debt-strategy-header.png');
    console.log('\n🎉 Navigation is WORKING!\n');

    // Keep browser open for a moment to see the result
    await newPage.waitForTimeout(2000);

    await newPage.close();
});

test('LIVE DEMO: Click Debt Strategy card from Index page', async ({ context, page }) => {
    test.setTimeout(60000);

    console.log('\n🎬 STARTING SECOND DEMONSTRATION - Index Page Card');
    console.log('=' .repeat(80));

    // Navigate to Index
    console.log('📍 Loading Index page...');
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Index page loaded');

    await page.screenshot({
        path: 'test-results/LIVE-05-index-before-click.png',
        fullPage: true
    });
    console.log('📸 Screenshot 5: Index page (before click)');

    // Find the Debt Strategy card
    console.log('\n📍 Locating Debt Strategy card...');
    const cardLink = page.locator('.page-card:has-text("Debt Strategy")');
    await expect(cardLink).toBeVisible();

    // Highlight the card
    await cardLink.evaluate(el => {
        el.style.outline = '5px solid blue';
        el.style.outlineOffset = '5px';
        el.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
    });

    await page.screenshot({
        path: 'test-results/LIVE-06-card-highlighted.png',
        fullPage: false
    });
    console.log('📸 Screenshot 6: Debt Strategy card highlighted');

    console.log('\n⏳ Waiting 1 second before clicking...');
    await page.waitForTimeout(1000);

    // Click the card
    console.log('\n📍 Clicking Debt Strategy card...');
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        cardLink.click()
    ]);
    console.log('🖱️  Card clicked! New tab opened.');

    // Wait and verify
    await newPage.waitForLoadState('networkidle', { timeout: 10000 });
    const newUrl = newPage.url();
    console.log(`   New page URL: ${newUrl}`);
    expect(newUrl).toBe('http://localhost:8000/debt-strategy-complete.html');

    await newPage.waitForTimeout(2000);

    await newPage.screenshot({
        path: 'test-results/LIVE-07-debt-strategy-from-card.png',
        fullPage: true
    });
    console.log('📸 Screenshot 7: Debt Strategy page (opened from card)');

    console.log('\n✅ Card navigation WORKING!\n');

    await newPage.waitForTimeout(2000);
    await newPage.close();
});
