const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Helper function to parse currency amounts
function parseAmount(text) {
    return parseFloat(text.replace(/[$,KM]/g, ''));
}

// Helper function to load JSON files
function loadJSON(filename) {
    const filePath = path.join(__dirname, '..', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// =============================================================================
// TEST 1: Verify all sections render with current data
// =============================================================================
test('Complete strategy dashboard renders all expected sections', async ({ page }) => {
    const inventory = loadJSON('debt-inventory.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');

    // Wait for data to load
    await page.waitForSelector('#hero-stats', { timeout: 5000 });

    // Take full page screenshot
    await page.screenshot({
        path: 'test-results/full-dashboard.png',
        fullPage: true
    });

    // Verify core sections always exist
    await expect(page.locator('#hero-stats')).toBeVisible();
    await expect(page.locator('#recommended-strategy-section')).toBeVisible();
    await expect(page.locator('#payoff-order-container')).toBeVisible();
    await expect(page.locator('#execution-timeline-container')).toBeVisible();
    await expect(page.locator('#next-actions-checklist')).toBeVisible();
    await expect(page.locator('#debts-table')).toBeVisible();

    console.log('✅ All core sections rendered');

    // Conditional sections based on data
    const hasMortgages = inventory.debts.some(d => d.accountType === 'mortgage');
    const hasPromos = inventory.debts.some(d => d.promotionalAPR);

    if (hasMortgages) {
        await expect(page.locator('#mortgage-strategy-section')).toBeVisible();
        console.log('✅ Mortgage section rendered (mortgages exist)');
    } else {
        await expect(page.locator('#mortgage-strategy-section')).not.toBeVisible();
        console.log('✅ Mortgage section hidden (no mortgages)');
    }

    if (hasPromos) {
        await expect(page.locator('#promotional-deadlines-alert')).toBeVisible();
        console.log('✅ Promotional alert rendered (promos exist)');
    } else {
        await expect(page.locator('#promotional-deadlines-alert')).not.toBeVisible();
        console.log('✅ Promotional alert hidden (no promos)');
    }
});

// =============================================================================
// TEST 2: Verify hero stats match phase1 JSON data
// =============================================================================
test('Hero stats match phase1-debt-analysis.json', async ({ page }) => {
    const phase1 = loadJSON('phase1-debt-analysis-current.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForSelector('#hero-stats');

    // Screenshot hero stats section
    await page.locator('#hero-stats').screenshot({
        path: 'test-results/hero-stats.png'
    });

    // Extract and verify total debt
    const totalDebtText = await page.locator('[data-metric="total-debt"]').textContent();
    const displayedTotalDebt = parseAmount(totalDebtText);
    const expectedTotalDebt = parseAmount(String(phase1.summary.totalDebt));
    expect(Math.abs(displayedTotalDebt - expectedTotalDebt)).toBeLessThan(1); // Allow for rounding

    // Extract and verify DTI
    const dtiText = await page.locator('[data-metric="dti"]').textContent();
    const displayedDTI = parseFloat(dtiText);
    expect(displayedDTI).toBeCloseTo(phase1.summary.debtToIncomeRatio, 1);

    // Extract and verify debt count
    const debtCountText = await page.locator('[data-metric="debt-count"]').textContent();
    const displayedDebtCount = parseInt(debtCountText);
    expect(displayedDebtCount).toBe(phase1.summary.debtCount);

    // Extract and verify monthly interest
    const monthlyInterestText = await page.locator('[data-metric="monthly-interest"]').textContent();
    const displayedMonthlyInterest = parseAmount(monthlyInterestText);
    expect(displayedMonthlyInterest).toBeCloseTo(phase1.summary.totalMonthlyInterest, 2);

    console.log(`✅ Hero stats verified:`);
    console.log(`   Total Debt: $${displayedTotalDebt}`);
    console.log(`   DTI: ${displayedDTI}%`);
    console.log(`   Debt Count: ${displayedDebtCount}`);
    console.log(`   Monthly Interest: $${displayedMonthlyInterest}`);
});

// =============================================================================
// TEST 3: Verify recommended strategy matches phase2 JSON
// =============================================================================
test('Recommended strategy matches phase2-strategy-comparison.json', async ({ page }) => {
    const phase2 = loadJSON('phase2-strategy-comparison-current.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForSelector('#recommended-strategy-section');

    // Screenshot strategy section
    await page.locator('#recommended-strategy-section').screenshot({
        path: 'test-results/recommended-strategy.png'
    });

    // Verify strategy name
    const strategyName = await page.locator('[data-field="strategy-name"]').textContent();
    expect(strategyName).toContain(phase2.recommendation.primaryStrategy);

    // Verify debt-free date
    const debtFreeDate = await page.locator('[data-field="debt-free-date"]').textContent();
    expect(debtFreeDate).toBe(phase2.recommendation.expectedResults.debtFreeDate);

    // Verify total interest paid
    const totalInterest = await page.locator('[data-field="total-interest"]').textContent();
    const displayedInterest = parseAmount(totalInterest);
    expect(displayedInterest).toBeCloseTo(phase2.recommendation.expectedResults.totalInterestPaid, 2);

    // Verify interest saved vs alternative
    if (phase2.recommendation.expectedResults.interestSavedVsSnowball) {
        const savedAmount = await page.locator('[data-field="interest-saved"]').textContent();
        const displayedSaved = parseAmount(savedAmount);
        expect(displayedSaved).toBeCloseTo(phase2.recommendation.expectedResults.interestSavedVsSnowball, 2);
    }

    console.log(`✅ Strategy verified:`);
    console.log(`   Strategy: ${strategyName}`);
    console.log(`   Debt-Free Date: ${debtFreeDate}`);
    console.log(`   Total Interest: $${displayedInterest}`);
});

// =============================================================================
// TEST 4: Verify mortgage section conditional rendering
// =============================================================================
test('Mortgage section renders dynamically based on data', async ({ page }) => {
    const inventory = loadJSON('debt-inventory.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForTimeout(2000); // Wait for dynamic content

    const mortgages = inventory.debts.filter(d => d.accountType === 'mortgage');
    const mortgageSection = page.locator('#mortgage-strategy-section');

    if (mortgages.length === 0) {
        // No mortgages - section should be empty
        const content = await mortgageSection.textContent();
        expect(content.trim()).toBe('');
        console.log(`✅ Mortgage section correctly hidden (0 mortgages)`);
        return;
    }

    // Mortgages exist - section must be visible
    await expect(mortgageSection).toBeVisible();
    await mortgageSection.screenshot({
        path: 'test-results/mortgage-section.png'
    });

    console.log(`✅ Found ${mortgages.length} mortgage(s) in JSON`);

    // Verify each mortgage displays correctly
    for (const mortgage of mortgages) {
        const mortgageRow = page.locator(`[data-mortgage="${mortgage.creditorName}"]`);
        await expect(mortgageRow).toBeVisible();

        // Verify balance
        const balanceText = await mortgageRow.locator('[data-field="balance"]').textContent();
        const displayedBalance = parseAmount(balanceText);
        expect(displayedBalance).toBeCloseTo(mortgage.currentBalance, 2);

        // Verify APR
        const aprText = await mortgageRow.locator('[data-field="apr"]').textContent();
        const displayedAPR = parseFloat(aprText);
        expect(displayedAPR).toBeCloseTo(mortgage.apr, 2);

        // Verify monthly payment
        const paymentText = await mortgageRow.locator('[data-field="payment"]').textContent();
        const displayedPayment = parseAmount(paymentText);
        expect(displayedPayment).toBeCloseTo(mortgage.minimumPayment, 2);

        console.log(`✅ ${mortgage.creditorName}: $${displayedBalance} @ ${displayedAPR}%, $${displayedPayment}/mo`);
    }

    // Verify total mortgage balance
    const totalMortgageBalance = mortgages.reduce((sum, m) => sum + m.currentBalance, 0);
    const displayedTotal = await page.locator('[data-field="total-mortgage-balance"]').textContent();
    const parsedTotal = parseAmount(displayedTotal);
    expect(Math.abs(parsedTotal - totalMortgageBalance)).toBeLessThan(1000); // Allow for K/M formatting

    console.log(`✅ Total mortgage balance: $${totalMortgageBalance}`);
});

// =============================================================================
// TEST 5: Verify ALL promotional deadlines display dynamically
// =============================================================================
test('All promotional deadlines display correctly from JSON data', async ({ page }) => {
    const inventory = loadJSON('debt-inventory.json');

    // Find ALL debts with promotional APR
    const promoDebts = inventory.debts.filter(d => d.promotionalAPR);

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForTimeout(2000);

    if (promoDebts.length === 0) {
        // No promotional debts - section should be empty
        const alertSection = page.locator('#promotional-deadlines-alert');
        const content = await alertSection.textContent();
        expect(content.trim()).toBe('');
        console.log('✅ No promotional debts - section correctly hidden');
        return;
    }

    // Promotional debts exist - section must be visible
    await page.waitForSelector('#promotional-deadlines-alert');

    // Screenshot promotional section
    await page.locator('#promotional-deadlines-alert').screenshot({
        path: 'test-results/promotional-deadlines.png'
    });

    console.log(`✅ Found ${promoDebts.length} promotional debt(s) in JSON`);

    // Verify EACH promotional debt appears in the table
    for (const debt of promoDebts) {
        const row = page.locator(`[data-promo-debt="${debt.creditorName}"]`);
        await expect(row).toBeVisible();

        // Verify balance
        const balanceText = await row.locator('[data-field="balance"]').textContent();
        const displayedBalance = parseAmount(balanceText);
        expect(displayedBalance).toBeCloseTo(debt.currentBalance, 2);

        // Verify expiration date
        const expirationText = await row.locator('[data-field="expiration"]').textContent();
        expect(expirationText).toBe(debt.promotionalAPR.expirationDate);

        // Verify deferred interest at risk
        const riskText = await row.locator('[data-field="deferred-interest"]').textContent();
        const displayedRisk = parseAmount(riskText);
        expect(displayedRisk).toBeCloseTo(debt.promotionalAPR.deferredInterestAtRisk, 2);

        console.log(`✅ ${debt.creditorName}: $${displayedBalance}, expires ${expirationText}, risk $${displayedRisk}`);
    }

    // Verify total deferred interest at risk
    const totalRisk = promoDebts.reduce((sum, d) => sum + d.promotionalAPR.deferredInterestAtRisk, 0);
    const totalRiskText = await page.locator('[data-field="total-deferred-interest"]').textContent();
    const displayedTotalRisk = parseAmount(totalRiskText);
    expect(displayedTotalRisk).toBeCloseTo(totalRisk, 2);

    console.log(`✅ Total deferred interest at risk: $${totalRisk}`);
});

// =============================================================================
// TEST 6: Verify payoff order matches phase3 JSON exactly
// =============================================================================
test('Payoff order table matches phase3-payoff-roadmap.json', async ({ page }) => {
    const phase3 = loadJSON('phase3-payoff-roadmap-current.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForSelector('#payoff-order-container');

    // Screenshot payoff order
    await page.locator('#payoff-order-container').screenshot({
        path: 'test-results/payoff-order.png'
    });

    console.log(`✅ Verifying ${phase3.payoffOrder.length} debts in payoff order`);

    // Verify first 10 debts in order (or all if less than 10)
    const checkCount = Math.min(10, phase3.payoffOrder.length);

    for (let i = 0; i < checkCount; i++) {
        const expectedDebt = phase3.payoffOrder[i];
        const row = page.locator(`#payoff-order-container table tbody tr:nth-child(${i + 1})`);

        // Verify order number
        const orderNum = await row.locator('td:nth-child(1)').textContent();
        expect(parseInt(orderNum)).toBe(i + 1);

        // Verify creditor name
        const creditorName = await row.locator('td:nth-child(2)').textContent();
        expect(creditorName).toContain(expectedDebt.creditorName);

        // Verify balance
        const balanceText = await row.locator('td:nth-child(3)').textContent();
        const displayedBalance = parseAmount(balanceText);
        expect(displayedBalance).toBeCloseTo(expectedDebt.currentBalance, 2);

        if (i < 5) { // Log first 5 for readability
            console.log(`✅ Order #${i + 1}: ${creditorName} ($${displayedBalance})`);
        }
    }

    console.log(`✅ All ${checkCount} debts verified in correct order`);
});

// =============================================================================
// TEST 7: Verify next actions checklist matches phase4c
// =============================================================================
test('Next actions checklist matches phase4c-monitoring-protocol.json', async ({ page }) => {
    const phase4c = loadJSON('phase4c-monitoring-protocol-current.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForSelector('#next-actions-checklist');

    // Screenshot next actions
    await page.locator('#next-actions-checklist').screenshot({
        path: 'test-results/next-actions.png'
    });

    // The HTML should display the first N actions (typically 3-5)
    const displayedActions = await page.locator('#next-actions-checklist .checklist-section').count();

    console.log(`✅ Verifying ${displayedActions} action items displayed`);

    // Verify each displayed action matches phase4c data
    for (let i = 0; i < displayedActions && i < phase4c.nextActions.length; i++) {
        const expectedAction = phase4c.nextActions[i];
        const actionItem = page.locator(`#next-actions-checklist .checklist-section:nth-child(${i + 1})`);

        // Verify action description
        const actionText = await actionItem.locator('[data-field="description"]').textContent();
        expect(actionText).toContain(expectedAction.description);

        // Verify priority badge if exists
        if (expectedAction.priority) {
            const priorityBadge = await actionItem.locator('[data-field="priority"]').textContent();
            expect(priorityBadge.toLowerCase()).toContain(expectedAction.priority.toLowerCase());
        }

        console.log(`✅ Action #${i + 1}: ${expectedAction.description.substring(0, 60)}...`);
    }
});

// =============================================================================
// TEST 8: Verify acceleration scenarios match phase4b
// =============================================================================
test('Acceleration scenarios match phase4b-acceleration-optimizer.json', async ({ page }) => {
    const phase4b = loadJSON('phase4b-acceleration-optimizer-current.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForSelector('#scenarios-section');

    // Screenshot scenarios section
    await page.locator('#scenarios-section').screenshot({
        path: 'test-results/acceleration-scenarios.png'
    });

    console.log(`✅ Verifying ${phase4b.scenarios.length} acceleration scenarios`);

    // Verify each scenario
    for (let i = 0; i < phase4b.scenarios.length; i++) {
        const expectedScenario = phase4b.scenarios[i];
        const scenarioRow = page.locator(`[data-scenario="${expectedScenario.extraPayment}"]`);

        await expect(scenarioRow).toBeVisible();

        // Verify extra payment amount
        const paymentText = await scenarioRow.locator('[data-field="extra-payment"]').textContent();
        const displayedPayment = parseAmount(paymentText);
        expect(displayedPayment).toBe(expectedScenario.extraPayment);

        // Verify payoff timeline
        const timelineText = await scenarioRow.locator('[data-field="timeline"]').textContent();
        expect(timelineText).toContain(expectedScenario.monthsToPayoff.toString());

        // Verify total interest
        const interestText = await scenarioRow.locator('[data-field="total-interest"]').textContent();
        const displayedInterest = parseAmount(interestText);
        expect(displayedInterest).toBeCloseTo(expectedScenario.totalInterestPaid, 2);

        console.log(`✅ Scenario: +$${expectedScenario.extraPayment}/mo → ${expectedScenario.monthsToPayoff} months, $${expectedScenario.totalInterestPaid.toFixed(2)} interest`);
    }
});

// =============================================================================
// TEST 9: Verify milestones match phase4a
// =============================================================================
test('Milestones match phase4a-motivation-plan.json', async ({ page }) => {
    const phase4a = loadJSON('phase4a-motivation-plan-current.json');

    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForSelector('#milestones-container');

    // Screenshot milestones
    await page.locator('#milestones-container').screenshot({
        path: 'test-results/milestones.png'
    });

    console.log(`✅ Verifying ${phase4a.milestones.length} milestones`);

    // Verify each milestone
    for (let i = 0; i < phase4a.milestones.length; i++) {
        const expectedMilestone = phase4a.milestones[i];
        const milestoneItem = page.locator(`[data-milestone-id="${i}"]`);

        await expect(milestoneItem).toBeVisible();

        // Verify milestone name
        const nameText = await milestoneItem.locator('[data-field="name"]').textContent();
        expect(nameText).toContain(expectedMilestone.name);

        // Verify celebration
        const celebrationText = await milestoneItem.locator('[data-field="celebration"]').textContent();
        expect(celebrationText).toContain(expectedMilestone.celebration);

        console.log(`✅ Milestone ${i + 1}: ${expectedMilestone.name}`);
    }
});

// =============================================================================
// TEST 10: Visual regression - Compare against baseline
// =============================================================================
test('Visual regression check against baseline', async ({ page }) => {
    await page.goto('http://localhost:8000/debt-strategy-complete.html');
    await page.waitForSelector('#hero-stats', { timeout: 5000 });

    // Wait for all dynamic content to load
    await page.waitForTimeout(3000);

    // Take screenshot for visual comparison
    const screenshot = await page.screenshot({ fullPage: true });

    // Compare with baseline (on first run, this creates baseline)
    expect(screenshot).toMatchSnapshot('debt-strategy-baseline.png', {
        threshold: 0.2, // Allow 20% difference (accounts for dates/amounts changing)
        maxDiffPixels: 100
    });

    console.log('✅ Visual regression check complete');
});
