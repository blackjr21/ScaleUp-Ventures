import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, '../forecasts/dashboard.html');
const dashboardUrl = `file://${dashboardPath}`;

async function captureScreenshots() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    await page.goto(dashboardUrl);
    await page.waitForSelector('.control-panel');
    await page.waitForTimeout(1000);

    console.log('📸 Capturing Phase 1 screenshots...\n');

    // 1. Full dashboard with sidebar
    console.log('1. Full dashboard with control panel...');
    await page.screenshot({
        path: path.join(__dirname, '../docs/screenshots/phase1-full-dashboard.png'),
        fullPage: false
    });

    // 2. Control panel close-up
    console.log('2. Control panel close-up...');
    const sidebar = await page.locator('.control-panel');
    await sidebar.screenshot({
        path: path.join(__dirname, '../docs/screenshots/phase1-control-panel.png')
    });

    // 3. Expense items with one unchecked
    console.log('3. Expense items (one unchecked)...');
    await page.locator('.expense-checkbox').first().uncheck();
    await page.waitForTimeout(300);
    const firstCategory = await page.locator('.expense-category').first();
    await firstCategory.screenshot({
        path: path.join(__dirname, '../docs/screenshots/phase1-expense-items.png')
    });

    // 4. Impact summary
    console.log('4. Impact summary card...');
    await page.locator('.expense-checkbox').nth(1).uncheck();
    await page.locator('.expense-checkbox').nth(2).uncheck();
    await page.waitForTimeout(300);
    const impactSummary = await page.locator('.impact-summary');
    await impactSummary.screenshot({
        path: path.join(__dirname, '../docs/screenshots/phase1-impact-summary.png')
    });

    // 5. Survival mode preset
    console.log('5. Survival mode preset...');
    await page.locator('#survivalBtn').click();
    await page.waitForTimeout(500);
    await page.screenshot({
        path: path.join(__dirname, '../docs/screenshots/phase1-survival-mode.png'),
        fullPage: false
    });

    // 6. Reset and aggressive mode
    console.log('6. Aggressive paydown preset...');
    await page.locator('#resetBtn').click();
    await page.waitForTimeout(300);
    await page.locator('#aggressiveBtn').click();
    await page.waitForTimeout(500);
    await page.screenshot({
        path: path.join(__dirname, '../docs/screenshots/phase1-aggressive-mode.png'),
        fullPage: false
    });

    // 7. Dark theme
    console.log('7. Dark theme view...');
    await page.locator('#resetBtn').click();
    await page.waitForTimeout(300);
    await page.locator('#themeToggle').click();
    await page.waitForTimeout(300);
    await page.screenshot({
        path: path.join(__dirname, '../docs/screenshots/phase1-dark-theme.png'),
        fullPage: false
    });

    await browser.close();
    console.log('\n✅ All screenshots captured successfully!');
    console.log('📁 Location: docs/screenshots/');
}

captureScreenshots().catch(console.error);
