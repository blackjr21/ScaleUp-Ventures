import { test, expect } from '@playwright/test';

/**
 * Debt Strategy Link Verification Test
 *
 * This test verifies that all Debt Strategy links exist with correct href and target attributes
 * We don't click them in the test because cross-port navigation in Playwright can be tricky,
 * but we verify the links are properly configured for manual testing.
 */

test('PROOF: All pages have correct Debt Strategy links', async ({ page }) => {
    console.log('🧪 COMPREHENSIVE DEBT STRATEGY LINK VERIFICATION\n');
    console.log('=' .repeat(80));

    const testResults = [];

    // Test 1: Index Page - Nav Link
    console.log('\n📍 TEST 1: Index Page - Navigation Link');
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    const indexNavLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(indexNavLink).toBeVisible();
    const indexNavHref = await indexNavLink.getAttribute('href');
    const indexNavTarget = await indexNavLink.getAttribute('target');

    console.log(`   ✅ Link exists and is visible`);
    console.log(`   ✅ href: ${indexNavHref}`);
    console.log(`   ✅ target: ${indexNavTarget}`);

    expect(indexNavHref).toBe('http://localhost:8000/debt-strategy-complete.html');
    expect(indexNavTarget).toBe('_blank');
    testResults.push('Index Nav Link: PASS');

    // Test 2: Index Page - Card Link
    console.log('\n📍 TEST 2: Index Page - Card Link');
    const indexCardLink = page.locator('.page-card:has-text("Debt Strategy")');
    await expect(indexCardLink).toBeVisible();
    const indexCardHref = await indexCardLink.getAttribute('href');
    const indexCardTarget = await indexCardLink.getAttribute('target');

    console.log(`   ✅ Card exists and is visible`);
    console.log(`   ✅ href: ${indexCardHref}`);
    console.log(`   ✅ target: ${indexCardTarget}`);

    expect(indexCardHref).toBe('http://localhost:8000/debt-strategy-complete.html');
    expect(indexCardTarget).toBe('_blank');
    testResults.push('Index Card Link: PASS');

    // Highlight both links for screenshot
    await indexNavLink.evaluate(el => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
    });
    await indexCardLink.evaluate(el => {
        el.style.outline = '3px solid blue';
        el.style.outlineOffset = '4px';
    });

    await page.screenshot({
        path: 'test-results/PROOF-index-both-links.png',
        fullPage: false
    });
    console.log(`   📸 Screenshot saved: PROOF-index-both-links.png`);

    // Test 3: Dashboard Page
    console.log('\n📍 TEST 3: Dashboard Page - Navigation Link');
    await page.goto('http://localhost:8080/dashboard.html');
    await page.waitForLoadState('networkidle');

    const dashboardNavLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(dashboardNavLink).toBeVisible();
    const dashboardNavHref = await dashboardNavLink.getAttribute('href');
    const dashboardNavTarget = await dashboardNavLink.getAttribute('target');

    console.log(`   ✅ Link exists and is visible`);
    console.log(`   ✅ href: ${dashboardNavHref}`);
    console.log(`   ✅ target: ${dashboardNavTarget}`);

    expect(dashboardNavHref).toBe('http://localhost:8000/debt-strategy-complete.html');
    expect(dashboardNavTarget).toBe('_blank');
    testResults.push('Dashboard Nav Link: PASS');

    await dashboardNavLink.evaluate(el => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
    });

    await page.screenshot({
        path: 'test-results/PROOF-dashboard-link.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 150 }
    });
    console.log(`   📸 Screenshot saved: PROOF-dashboard-link.png`);

    // Test 4: Scenario Planner Page
    console.log('\n📍 TEST 4: Scenario Planner Page - Navigation Link');
    await page.goto('http://localhost:8080/scenario-planner.html');
    await page.waitForLoadState('networkidle');

    const scenarioNavLink = page.locator('.top-nav a:has-text("Debt Strategy")');
    await expect(scenarioNavLink).toBeVisible();
    const scenarioNavHref = await scenarioNavLink.getAttribute('href');
    const scenarioNavTarget = await scenarioNavLink.getAttribute('target');

    console.log(`   ✅ Link exists and is visible`);
    console.log(`   ✅ href: ${scenarioNavHref}`);
    console.log(`   ✅ target: ${scenarioNavTarget}`);

    expect(scenarioNavHref).toBe('http://localhost:8000/debt-strategy-complete.html');
    expect(scenarioNavTarget).toBe('_blank');
    testResults.push('Scenario Planner Nav Link: PASS');

    await scenarioNavLink.evaluate(el => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
    });

    await page.screenshot({
        path: 'test-results/PROOF-scenario-planner-link.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 150 }
    });
    console.log(`   📸 Screenshot saved: PROOF-scenario-planner-link.png`);

    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    testResults.forEach(result => console.log(`   ✅ ${result}`));
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('   All Debt Strategy links are correctly configured.');
    console.log('   Manual verification: Click any highlighted link to confirm it opens');
    console.log('   http://localhost:8000/debt-strategy-complete.html in a new tab.\n');
});

test('VISUAL PROOF: Highlight all Debt Strategy links on all pages', async ({ page }) => {
    console.log('🎨 Creating visual proof of all Debt Strategy links...\n');

    // Create a composite proof page by visiting all three pages
    const pages = [
        { url: 'http://localhost:8080/index.html', name: 'Index', hasCard: true },
        { url: 'http://localhost:8080/dashboard.html', name: 'Dashboard', hasCard: false },
        { url: 'http://localhost:8080/scenario-planner.html', name: 'Scenario Planner', hasCard: false }
    ];

    for (const pageInfo of pages) {
        console.log(`📸 Capturing ${pageInfo.name}...`);
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');

        // Highlight nav link
        const navLink = page.locator('.top-nav a:has-text("Debt Strategy")');
        await navLink.evaluate(el => {
            el.style.outline = '4px solid #ff0000';
            el.style.outlineOffset = '3px';
            el.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
        });

        // Highlight card link if exists
        if (pageInfo.hasCard) {
            const cardLink = page.locator('.page-card:has-text("Debt Strategy")');
            await cardLink.evaluate(el => {
                el.style.outline = '4px solid #0000ff';
                el.style.outlineOffset = '3px';
                el.style.backgroundColor = 'rgba(0, 0, 255, 0.05)';
            });
        }

        await page.screenshot({
            path: `test-results/PROOF-VISUAL-${pageInfo.name.toLowerCase().replace(' ', '-')}.png`,
            fullPage: true
        });
        console.log(`   ✅ Saved PROOF-VISUAL-${pageInfo.name.toLowerCase().replace(' ', '-')}.png`);
    }

    console.log('\n✅ Visual proof complete! Check test-results/ for screenshots.');
});
