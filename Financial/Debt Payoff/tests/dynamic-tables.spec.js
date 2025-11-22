const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Test configuration
const HTML_FILE = path.join(__dirname, '..', 'dashboards', 'debt-strategy-final-2025-11-21.html');
const JSON_FILE = path.join(__dirname, '..', 'data', 'debt-inventory-current.json');
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');

test.describe('Dynamic Debt Dashboard - Monthly Payment Columns', () => {

    test.beforeEach(async ({ page }) => {
        // Load the JSON data
        const jsonData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

        // Navigate to the HTML file
        await page.goto(`file://${HTML_FILE}`);

        // Inject JSON data into page to bypass CORS issues with local files
        await page.evaluate((data) => {
            window.debtData = data;
            // Trigger the data loading with injected data
            if (typeof populatePromotionalTable === 'function') {
                populatePromotionalTable(data);
            }
            if (typeof populateVictoryPathTable === 'function') {
                populateVictoryPathTable(data);
            }
        }, jsonData);

        // Wait for tables to populate
        await page.waitForTimeout(1000);
    });

    test.describe('Promotional Balance Defense Table', () => {

        test('should display promotional table with monthly payment column', async ({ page }) => {
            const table = page.locator('#promotional-table');

            // Verify table exists
            await expect(table).toBeVisible();

            // Take screenshot of the table
            await table.screenshot({
                path: path.join(SCREENSHOT_DIR, 'promotional-table-full.png')
            });

            // Verify header columns
            const headers = table.locator('thead th');
            await expect(headers.nth(0)).toHaveText('Debt');
            await expect(headers.nth(1)).toHaveText('Balance');
            await expect(headers.nth(2)).toHaveText('Monthly Payment');
            await expect(headers.nth(3)).toHaveText('Deadline');
            await expect(headers.nth(4)).toHaveText('Days Left');
            await expect(headers.nth(5)).toHaveText('Deferred Interest');
            await expect(headers.nth(6)).toHaveText('Priority');

            console.log('✅ Promotional table headers verified');
        });

        test('should load promotional debts with correct monthly payments', async ({ page }) => {
            const tbody = page.locator('#promotional-table tbody');

            // Verify at least 6 promotional debts are loaded
            const rows = tbody.locator('tr').filter({ hasNot: page.locator('.success-row') });
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThanOrEqual(6);

            console.log(`✅ Found ${rowCount} promotional debts`);

            // Verify each row has monthly payment data
            for (let i = 0; i < rowCount; i++) {
                const row = rows.nth(i);
                const monthlyPayment = await row.locator('td').nth(2).textContent();

                // Monthly payment should be formatted as currency
                expect(monthlyPayment).toMatch(/\$\d+\.\d{2}/);
                console.log(`  Row ${i + 1} monthly payment: ${monthlyPayment}`);
            }
        });

        test('should calculate total monthly payment for promotional debts', async ({ page }) => {
            const tbody = page.locator('#promotional-table tbody');
            const totalRow = tbody.locator('.success-row');

            // Verify total row exists
            await expect(totalRow).toBeVisible();

            // Get total monthly payment
            const totalPayment = await totalRow.locator('td').nth(2).textContent();

            // Should show total with /mo suffix
            expect(totalPayment).toMatch(/\$\d+\.\d{2}\/mo/);

            console.log(`✅ Total promotional monthly payment: ${totalPayment}`);

            // Take screenshot of total row
            await totalRow.screenshot({
                path: path.join(SCREENSHOT_DIR, 'promotional-total-row.png')
            });
        });

        test('should display PayPal THORUM with correct data', async ({ page }) => {
            const tbody = page.locator('#promotional-table tbody');

            // Find PayPal THORUM row
            const thorumRow = tbody.locator('tr', { hasText: 'PayPal THORUM Promo' });
            await expect(thorumRow).toBeVisible();

            // Verify it has the critical-row class
            await expect(thorumRow).toHaveClass(/critical-row/);

            // Get monthly payment value
            const monthlyPayment = await thorumRow.locator('td').nth(2).textContent();
            console.log(`✅ PayPal THORUM monthly payment: ${monthlyPayment}`);

            // Take screenshot
            await thorumRow.screenshot({
                path: path.join(SCREENSHOT_DIR, 'promotional-thorum-row.png')
            });
        });

        test('should display Container Store with correct high deferred interest', async ({ page }) => {
            const tbody = page.locator('#promotional-table tbody');

            // Find Container Store row
            const containerRow = tbody.locator('tr', { hasText: 'Container Store' });
            await expect(containerRow).toBeVisible();

            // Get deferred interest
            const deferredInterest = await containerRow.locator('td').nth(5).textContent();

            // Container Store has the highest deferred interest (~$1,766)
            expect(deferredInterest).toMatch(/\$1,7\d{2}\.\d{2}/);

            console.log(`✅ Container Store deferred interest: ${deferredInterest}`);

            // Take screenshot
            await containerRow.screenshot({
                path: path.join(SCREENSHOT_DIR, 'promotional-container-store.png')
            });
        });
    });

    test.describe('Victory Path Table', () => {

        test('should display victory path table with monthly payment column', async ({ page }) => {
            const table = page.locator('#victory-path-table');

            // Verify table exists
            await expect(table).toBeVisible();

            // Take screenshot of full table
            await table.screenshot({
                path: path.join(SCREENSHOT_DIR, 'victory-path-table-full.png')
            });

            // Verify header columns
            const headers = table.locator('thead th');
            await expect(headers.nth(0)).toHaveText('Priority');
            await expect(headers.nth(1)).toHaveText('Debt');
            await expect(headers.nth(2)).toHaveText('Balance');
            await expect(headers.nth(3)).toHaveText('Monthly Payment');
            await expect(headers.nth(4)).toHaveText('APR');
            await expect(headers.nth(5)).toHaveText('Monthly Interest');
            await expect(headers.nth(6)).toHaveText('Est. Payoff');

            console.log('✅ Victory Path table headers verified with Monthly Payment column');
        });

        test('should load avalanche-ordered debts with monthly payments', async ({ page }) => {
            const tbody = page.locator('#victory-path-table tbody');

            // Get all data rows (excluding tier summary rows)
            const dataRows = tbody.locator('tr').filter({
                hasNot: page.locator('[style*="background: #e0e7ff"]')
            });

            const rowCount = await dataRows.count();
            expect(rowCount).toBeGreaterThanOrEqual(9);

            console.log(`✅ Found ${rowCount} debts in victory path`);

            // Verify each debt has monthly payment
            for (let i = 0; i < Math.min(3, rowCount); i++) {
                const row = dataRows.nth(i);
                const priority = await row.locator('td').nth(0).textContent();
                const debtName = await row.locator('td').nth(1).textContent();
                const monthlyPayment = await row.locator('td').nth(3).textContent();
                const apr = await row.locator('td').nth(4).textContent();

                expect(monthlyPayment).toMatch(/\$\d+\.\d{2}/);
                console.log(`  Priority ${priority}: ${debtName.substring(0, 30)}... - ${monthlyPayment}/mo @ ${apr}`);
            }
        });

        test('should display High APR (28%+) tier summary', async ({ page }) => {
            const tbody = page.locator('#victory-path-table tbody');

            // Find tier summary row for High APR
            const tierRow = tbody.locator('tr', { hasText: 'High APR (28%+) TIER' });
            await expect(tierRow).toBeVisible();

            // Verify styling
            await expect(tierRow).toHaveAttribute('style', /background: #e0e7ff/);

            // Get tier data
            const tierLabel = await tierRow.locator('td').nth(0).textContent();
            const tierBalance = await tierRow.locator('td').nth(1).textContent();
            const tierPayment = await tierRow.locator('td').nth(2).textContent();
            const tierInterest = await tierRow.locator('td').nth(3).textContent();

            // Verify formatting
            expect(tierBalance).toMatch(/\$\d+,?\d*\.\d{2}/);
            expect(tierPayment).toMatch(/\$\d+,?\d*\.\d{2}\/mo/);
            expect(tierInterest).toMatch(/\$\d+,?\d*\.\d{2}\/mo interest/);

            console.log('✅ High APR Tier Summary:');
            console.log(`  ${tierLabel}`);
            console.log(`  Balance: ${tierBalance}`);
            console.log(`  Monthly Payment: ${tierPayment}`);
            console.log(`  Monthly Interest: ${tierInterest}`);

            // Take screenshot
            await tierRow.screenshot({
                path: path.join(SCREENSHOT_DIR, 'tier-high-apr-summary.png')
            });
        });

        test('should display Medium APR (10-28%) tier summary', async ({ page }) => {
            const tbody = page.locator('#victory-path-table tbody');

            // Find tier summary row for Medium APR
            const tierRow = tbody.locator('tr', { hasText: 'Medium APR (10-28%) TIER' });
            await expect(tierRow).toBeVisible();

            // Get tier payment
            const tierPayment = await tierRow.locator('td').nth(2).textContent();
            expect(tierPayment).toMatch(/\$\d+,?\d*\.\d{2}\/mo/);

            console.log(`✅ Medium APR Tier Monthly Payment: ${tierPayment}`);

            // Take screenshot
            await tierRow.screenshot({
                path: path.join(SCREENSHOT_DIR, 'tier-medium-apr-summary.png')
            });
        });

        test('should display Low APR (<10%) tier summary', async ({ page }) => {
            const tbody = page.locator('#victory-path-table tbody');

            // Find tier summary row for Low APR
            const tierRow = tbody.locator('tr', { hasText: 'Low APR (<10%) TIER' });
            await expect(tierRow).toBeVisible();

            // Get tier data
            const tierPayment = await tierRow.locator('td').nth(2).textContent();

            console.log(`✅ Low APR Tier Monthly Payment: ${tierPayment}`);

            // Take screenshot
            await tierRow.screenshot({
                path: path.join(SCREENSHOT_DIR, 'tier-low-apr-summary.png')
            });
        });

        test('should display SoFi Personal Loan with critical highlighting', async ({ page }) => {
            const tbody = page.locator('#victory-path-table tbody');

            // Find SoFi row
            const sofiRow = tbody.locator('tr', { hasText: 'SoFi Personal Loan' });
            await expect(sofiRow).toBeVisible();

            // Should have critical-row class
            await expect(sofiRow).toHaveClass(/critical-row/);

            // Get data
            const balance = await sofiRow.locator('td').nth(2).textContent();
            const monthlyPayment = await sofiRow.locator('td').nth(3).textContent();
            const apr = await sofiRow.locator('td').nth(4).textContent();
            const monthlyInterest = await sofiRow.locator('td').nth(5).textContent();

            console.log('✅ SoFi Personal Loan:');
            console.log(`  Balance: ${balance}`);
            console.log(`  Monthly Payment: ${monthlyPayment}`);
            console.log(`  APR: ${apr}`);
            console.log(`  Monthly Interest: ${monthlyInterest}`);

            // Take screenshot
            await sofiRow.screenshot({
                path: path.join(SCREENSHOT_DIR, 'victory-sofi-loan.png')
            });
        });

        test('should display Johns Hopkins 401k Loan 2', async ({ page }) => {
            const tbody = page.locator('#victory-path-table tbody');

            // Find 401k Loan 2 row
            const loan2Row = tbody.locator('tr', { hasText: 'Johns Hopkins 401k Loan 2' });
            await expect(loan2Row).toBeVisible();

            // Get data
            const balance = await loan2Row.locator('td').nth(2).textContent();
            const monthlyPayment = await loan2Row.locator('td').nth(3).textContent();
            const apr = await loan2Row.locator('td').nth(4).textContent();

            // Verify APR is 8.50%
            expect(apr).toContain('8.50');

            console.log('✅ Johns Hopkins 401k Loan 2:');
            console.log(`  Balance: ${balance}`);
            console.log(`  Monthly Payment: ${monthlyPayment}`);
            console.log(`  APR: ${apr}`);

            // Take screenshot
            await loan2Row.screenshot({
                path: path.join(SCREENSHOT_DIR, 'victory-401k-loan2.png')
            });
        });
    });

    test.describe('Visual Regression - Full Page', () => {

        test('should capture full dashboard with both tables', async ({ page }) => {
            // Scroll to promotional table
            await page.locator('#promotional-table').scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);

            // Take screenshot of promotional section
            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, 'full-page-promotional-section.png'),
                fullPage: false
            });

            // Scroll to victory path table
            await page.locator('#victory-path-table').scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);

            // Take screenshot of victory path section
            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, 'full-page-victory-section.png'),
                fullPage: false
            });

            // Take full page screenshot
            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, 'full-dashboard-complete.png'),
                fullPage: true
            });

            console.log('✅ Full page screenshots captured');
        });
    });

    test.describe('Data Validation', () => {

        test('should verify all tier totals are calculated', async ({ page }) => {
            const tbody = page.locator('#victory-path-table tbody');

            // Find all tier summary rows
            const tierRows = tbody.locator('tr[style*="background: #e0e7ff"]');
            const tierCount = await tierRows.count();

            // Should have 3 tier summaries (High, Medium, Low)
            expect(tierCount).toBe(3);

            console.log(`✅ Found ${tierCount} tier summary rows`);

            // Verify each tier has non-zero payment
            for (let i = 0; i < tierCount; i++) {
                const tierRow = tierRows.nth(i);
                const tierName = await tierRow.locator('td').nth(0).textContent();
                const tierPayment = await tierRow.locator('td').nth(2).textContent();

                // Extract numeric value
                const paymentValue = parseFloat(tierPayment.replace(/[$,\/mo]/g, ''));
                expect(paymentValue).toBeGreaterThan(0);

                console.log(`  ${tierName}: ${tierPayment} (${paymentValue})`);
            }
        });

        test('should verify promotional total matches sum of individual payments', async ({ page }) => {
            const tbody = page.locator('#promotional-table tbody');

            // Get all data rows (excluding total)
            const dataRows = tbody.locator('tr').filter({ hasNot: page.locator('.success-row') });
            const rowCount = await dataRows.count();

            // Sum up individual payments
            let calculatedTotal = 0;
            for (let i = 0; i < rowCount; i++) {
                const paymentText = await dataRows.nth(i).locator('td').nth(2).textContent();
                const payment = parseFloat(paymentText.replace(/[$,]/g, ''));
                calculatedTotal += payment;
            }

            // Get displayed total
            const totalRow = tbody.locator('.success-row');
            const displayedTotalText = await totalRow.locator('td').nth(2).textContent();
            const displayedTotal = parseFloat(displayedTotalText.replace(/[$,\/mo]/g, ''));

            // Should match within a penny (accounting for rounding)
            expect(Math.abs(calculatedTotal - displayedTotal)).toBeLessThan(0.02);

            console.log(`✅ Promotional payments validation:`);
            console.log(`  Calculated sum: $${calculatedTotal.toFixed(2)}`);
            console.log(`  Displayed total: $${displayedTotal.toFixed(2)}`);
            console.log(`  Match: ${Math.abs(calculatedTotal - displayedTotal) < 0.02 ? 'YES' : 'NO'}`);
        });
    });
});
