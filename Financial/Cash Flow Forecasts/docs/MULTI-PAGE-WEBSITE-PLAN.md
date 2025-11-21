# Multi-Page Website Architecture Plan

**Version:** 1.0
**Date:** 2025-11-21
**Status:** Planning - Ready for User Approval
**Branch:** `feature/multi-page-website`

---

## 🎯 Goal

Transform the single-page cash flow application into a multi-page website with:
- **Page 1:** Cash Flow Dashboard (read-only forecast view)
- **Page 2:** Scenario Planner (interactive what-if analysis)
- Shared navigation, styling, and data sources
- Seamless user experience between pages

---

## 📐 Current Architecture (What We Built)

### Single-Page Implementation
**File:** `forecasts/dashboard.html` (18,542 lines)

**Contains:**
1. **Original Dashboard** (lines 1-700):
   - Emergency banner
   - Action center
   - Hero statistics (income, expenses, surplus, gauge)
   - Alert badges (critical/warning counts)
   - Critical alerts list
   - Forecast summary grid
   - Balance chart (Chart.js with annotations)
   - Transaction table with filters
   - Dark theme toggle

2. **Scenario Planner** (lines 700-18,542):
   - Left sidebar control panel (350px)
   - 46 expense checkboxes (Monthly, Biweekly, Recurring, Friday)
   - Search and filter
   - Preset buttons (Survival Mode, Aggressive Cutbacks)
   - Auto-parser for `cash-flow-data.md`
   - TransactionRuleEngine (42-day forecast calculations)
   - ComparisonCalculator (before/after metrics)
   - ScenarioManager (real-time updates, debouncing)
   - ScenarioStorage (localStorage persistence)
   - Comparison view cards
   - Chart switcher (Baseline vs Modified)

**Problem:** Everything is crammed into one massive HTML file with mixed concerns.

---

## 🏗️ Proposed Multi-Page Architecture

### New File Structure

```
forecasts/
├── index.html                    # Landing page / navigation hub
├── dashboard.html                # Cash Flow Dashboard (read-only)
├── scenario-planner.html         # Interactive Scenario Planner
├── css/
│   ├── shared.css                # Common styles (theme, typography, layout)
│   ├── dashboard.css             # Dashboard-specific styles
│   └── scenario-planner.css      # Scenario planner-specific styles
├── js/
│   ├── shared/
│   │   ├── theme-manager.js      # Dark theme toggle
│   │   ├── data-loader.js        # Fetch cash-flow-data.md
│   │   └── constants.js          # Shared constants/configs
│   ├── dashboard/
│   │   ├── dashboard-main.js     # Dashboard initialization
│   │   └── chart-renderer.js     # Chart.js setup
│   └── scenario-planner/
│       ├── parser.js             # Markdown parser
│       ├── transaction-engine.js # TransactionRuleEngine class
│       ├── comparison-calc.js    # ComparisonCalculator class
│       ├── scenario-manager.js   # ScenarioManager class
│       ├── scenario-storage.js   # ScenarioStorage class
│       └── ui-controller.js      # UI event handlers
├── data/
│   └── (already exists - cash-flow-data.md)
└── tests/
    ├── e2e/
    │   ├── navigation.spec.js           # NEW: Page navigation tests
    │   ├── dashboard.spec.js            # Dashboard tests
    │   └── scenario-planner.spec.js     # Scenario planner tests
    └── visual/
        ├── dashboard-visual.spec.js
        └── scenario-planner-visual.spec.js
```

---

## 📄 Page Breakdown

### Page 1: Landing/Navigation Hub (`index.html`)

**Purpose:** Entry point to the website

**Content:**
- Site title: "Cash Flow Management Suite"
- Brief description
- Two large navigation cards:
  - **Dashboard** → Go to `dashboard.html`
  - **Scenario Planner** → Go to `scenario-planner.html`
- Footer with last updated date

**Features:**
- Dark theme toggle (persists across pages via localStorage)
- Responsive grid layout
- Clean, minimal design

**Lines of Code:** ~200 lines

---

### Page 2: Cash Flow Dashboard (`dashboard.html`)

**Purpose:** Read-only forecast visualization

**Content:**
- Emergency banner (if negative balance within 7 days)
- Action center (recommended transfers)
- Alert badges (critical/warning counts)
- Hero statistics (income, expenses, surplus, gauge)
- Financial runway bar
- Critical alerts list (bullet format)
- Forecast summary grid
- Balance chart (Chart.js with annotations)
- Transaction table with filters (All/Flagged/Major)
- Dark theme toggle
- **NEW:** Navigation link to Scenario Planner

**Removed:**
- ❌ Expense control panel sidebar
- ❌ Scenario management features
- ❌ Comparison view
- ❌ Chart switcher (only shows actual forecast)

**Data Source:**
- Uses dashboard-updater agent output (existing workflow)
- Agents populate transactions array and chartData

**Features:**
- Fully static/read-only
- Fast load time
- Clean UI without clutter

**Lines of Code:** ~900 lines (down from 18,542)

---

### Page 3: Scenario Planner (`scenario-planner.html`)

**Purpose:** Interactive what-if analysis

**Content:**
- **Left Sidebar (350px):**
  - 46 expense checkboxes (organized by category)
  - Search box
  - Filter buttons (All, Monthly, Biweekly, etc.)
  - Preset buttons (Survival Mode, Aggressive Cutbacks, Minimal Living)
  - Reset button
  - Collapse/expand toggle
  - Scenario management panel (save/load/delete)

- **Main Content Area:**
  - Comparison cards (before/after metrics)
  - Delta badges (ending balance change, negative days reduction)
  - Removed expenses list
  - Chart switcher (Baseline vs Modified)
  - Balance chart (Chart.js with annotations)
  - Transaction table with filters
  - Export scenario button

- **Top Navigation Bar:**
  - Link to Dashboard
  - Dark theme toggle
  - Current scenario name

**Data Source:**
- Auto-parser reads `cash-flow-data.md` on page load
- TransactionRuleEngine runs calculations client-side
- localStorage for saved scenarios

**Features:**
- Fully interactive
- Real-time recalculation (<500ms with debouncing)
- Persistent scenarios across sessions
- Export/import functionality

**Lines of Code:** ~1,800 lines

---

## 🎨 Shared Components

### CSS Architecture

**`css/shared.css`** (400 lines):
- CSS variables for theming (light/dark)
- Typography (fonts, headings, body text)
- Layout utilities (flexbox, grid)
- Button styles
- Card styles
- Form elements (inputs, checkboxes)
- Alert/badge components
- Table styles
- Responsive breakpoints

**`css/dashboard.css`** (200 lines):
- Emergency banner
- Action center
- Hero statistics cards
- Gauge styling
- Chart container
- Alert list

**`css/scenario-planner.css`** (400 lines):
- Control panel sidebar
- Expense item layout
- Search/filter controls
- Preset buttons
- Comparison cards
- Delta badges
- Scenario management panel

---

### JavaScript Architecture

**`js/shared/theme-manager.js`** (100 lines):
```javascript
// Manages dark theme toggle across all pages
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.applyTheme();
  }

  applyTheme() {
    document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
    this.applyTheme();
  }
}
```

**`js/shared/data-loader.js`** (50 lines):
```javascript
// Fetches cash-flow-data.md for parsing
async function fetchCashFlowData() {
  const response = await fetch('../data/cash-flow-data.md');
  if (!response.ok) throw new Error('Failed to load cash flow data');
  return await response.text();
}
```

**`js/shared/constants.js`** (50 lines):
```javascript
// Shared constants
const FORECAST_DAYS = 42;
const LOW_BALANCE_THRESHOLD = 500;
const DEBOUNCE_DELAY = 300;
```

**`js/scenario-planner/parser.js`** (300 lines):
- Auto-parser for cash-flow-data.md
- Extracts Monthly, Biweekly, Recurring, Friday transactions
- Validates data structure
- Returns TRANSACTION_RULES object

**`js/scenario-planner/transaction-engine.js`** (400 lines):
- TransactionRuleEngine class
- calculateDailyForecast() method
- isBiweeklyDue() method (modulo 14 math)
- getFlag() method (NEG/LOW)

**`js/scenario-planner/comparison-calc.js`** (200 lines):
- ComparisonCalculator class
- getTotalRemoved() method
- getEndingBalanceChange() method
- getNegativeDaysReduction() method

**`js/scenario-planner/scenario-manager.js`** (300 lines):
- ScenarioManager class
- toggleExpense() method
- debouncedRecalculate() method
- Event listener pattern

**`js/scenario-planner/scenario-storage.js`** (150 lines):
- ScenarioStorage class
- saveScenario() method
- loadScenario() method
- deleteScenario() method
- localStorage persistence

**`js/scenario-planner/ui-controller.js`** (400 lines):
- Event handlers for checkboxes, buttons, filters
- Chart switcher logic
- Comparison view updates
- Scenario panel interactions

---

## 🔄 Migration Strategy

### Phase-by-Phase Refactoring (Detailed Steps)

---

## PHASE 1: Extract Shared Styles & Scripts

**Goal:** Create reusable CSS and JavaScript modules that all pages will use

**Duration:** 1 day
**Tests:** 10 Playwright tests

### Step-by-Step Tasks:

#### 1.1 Create Folder Structure
```bash
mkdir -p "forecasts/css"
mkdir -p "forecasts/js/shared"
mkdir -p "forecasts/js/dashboard"
mkdir -p "forecasts/js/scenario-planner"
```

**Verify:** Folders exist with correct paths

---

#### 1.2 Extract Shared CSS (`css/shared.css`)

**What to Extract from current dashboard.html:**
- Lines 10-41: CSS custom properties (`:root` and `body.dark-theme`)
- Lines 45-57: Reset styles and body base styles
- Button styles (all `.btn-*` classes)
- Card styles (all `.card` classes)
- Form element styles (inputs, checkboxes, labels)
- Alert/badge styles (`.alert-item`, `.badge`)
- Table styles (`.transaction-table`)
- Utility classes (`.flex`, `.grid`, `.negative`, `.positive`)

**Action:**
1. Open current `forecasts/dashboard.html`
2. Copy all CSS from `<style>` tag matching above categories
3. Create new file `forecasts/css/shared.css`
4. Paste extracted CSS
5. Organize into sections with comments:
   ```css
   /* ==================== */
   /* Theme Variables      */
   /* ==================== */

   /* ==================== */
   /* Base Styles          */
   /* ==================== */

   /* ==================== */
   /* Button Components    */
   /* ==================== */
   ```

**Expected Output:** `css/shared.css` (~400 lines)

**Test:** Verify CSS is valid (no syntax errors)

---

#### 1.3 Create Theme Manager (`js/shared/theme-manager.js`)

**What to Extract:**
- Dark theme toggle functionality from dashboard.html
- localStorage read/write for theme persistence

**Code to Write:**
```javascript
/**
 * ThemeManager - Manages light/dark theme across all pages
 * Persists preference in localStorage
 */
class ThemeManager {
  constructor() {
    this.storageKey = 'cashflow-theme';
    this.currentTheme = this.loadTheme();
    this.applyTheme();
    this.setupToggleButton();
  }

  loadTheme() {
    const saved = localStorage.getItem(this.storageKey);
    return saved || 'light';
  }

  applyTheme() {
    if (this.currentTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(this.storageKey, this.currentTheme);
    this.applyTheme();
    this.updateToggleButton();
  }

  setupToggleButton() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
      this.updateToggleButton();
    }
  }

  updateToggleButton() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
      toggleBtn.setAttribute('aria-label',
        `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} mode`);
    }
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.themeManager = new ThemeManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
```

**Action:**
1. Create file `forecasts/js/shared/theme-manager.js`
2. Paste code above
3. Test by opening in browser console

**Expected Output:** `js/shared/theme-manager.js` (~100 lines)

**Test:**
- Toggle button switches theme
- Theme persists after page reload
- Works in both light and dark mode

---

#### 1.4 Create Data Loader (`js/shared/data-loader.js`)

**Purpose:** Fetch `cash-flow-data.md` for parsing

**Code to Write:**
```javascript
/**
 * DataLoader - Fetches cash flow data markdown file
 */
class DataLoader {
  constructor() {
    this.dataPath = '../data/cash-flow-data.md';
    this.cachedData = null;
  }

  async fetchCashFlowData() {
    // Return cached if available
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const response = await fetch(this.dataPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch cash flow data: ${response.status} ${response.statusText}`);
      }

      this.cachedData = await response.text();
      return this.cachedData;

    } catch (error) {
      console.error('DataLoader error:', error);
      throw new Error(`Cannot load cash flow data: ${error.message}`);
    }
  }

  clearCache() {
    this.cachedData = null;
  }
}

// Export
if (typeof window !== 'undefined') {
  window.DataLoader = DataLoader;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}
```

**Action:**
1. Create file `forecasts/js/shared/data-loader.js`
2. Paste code above

**Expected Output:** `js/shared/data-loader.js` (~50 lines)

**Test:**
- Can fetch cash-flow-data.md successfully
- Returns markdown text
- Caches result on second call

---

#### 1.5 Create Constants File (`js/shared/constants.js`)

**Purpose:** Shared configuration values

**Code to Write:**
```javascript
/**
 * Constants - Shared configuration across all pages
 */
const CONSTANTS = {
  // Forecast settings
  FORECAST_DAYS: 42,
  LOW_BALANCE_THRESHOLD: 500,
  EMERGENCY_WINDOW_DAYS: 7,

  // Performance settings
  DEBOUNCE_DELAY: 300,
  CHART_ANIMATION_DURATION: 500,

  // Storage keys
  STORAGE_KEY_THEME: 'cashflow-theme',
  STORAGE_KEY_SCENARIOS: 'cashflow-scenarios',
  STORAGE_KEY_PREFERENCES: 'cashflow-preferences',

  // Chart colors
  CHART_COLORS: {
    normal: '#667eea',
    low: '#f59e0b',
    negative: '#ef4444',
    baseline: '#94a3b8',
    modified: '#10b981',
    gridLines: '#e5e7eb'
  },

  // Date formats
  DATE_FORMAT_SHORT: 'MMM DD',
  DATE_FORMAT_LONG: 'YYYY-MM-DD',

  // Expense categories
  EXPENSE_CATEGORIES: {
    MONTHLY: 'monthly',
    BIWEEKLY: 'biweekly',
    WEEKDAY_RECURRING: 'weekday-recurring',
    FRIDAY_RECURRING: 'friday-recurring'
  }
};

// Export
if (typeof window !== 'undefined') {
  window.CONSTANTS = CONSTANTS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
}
```

**Action:**
1. Create file `forecasts/js/shared/constants.js`
2. Paste code above

**Expected Output:** `js/shared/constants.js` (~60 lines)

**Test:** Import constants and verify values accessible

---

#### 1.6 Create Playwright Tests for Phase 1

**Create:** `tests/e2e/phase1-shared-modules.spec.js`

**Tests to Write:**

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 1: Shared Modules', () => {

  test('shared.css loads correctly', async ({ page }) => {
    // Create minimal test page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body>
        <button class="btn-primary">Test Button</button>
      </body>
      </html>
    `);

    // Check button has correct styles
    const button = page.locator('.btn-primary');
    await expect(button).toBeVisible();

    const bgColor = await button.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBeTruthy();
  });

  test('theme-manager.js toggles theme', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body>
        <button id="themeToggle">🌙</button>
        <script src="../forecasts/js/shared/theme-manager.js"></script>
      </body>
      </html>
    `);

    // Initial state: light theme
    let bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).not.toContain('dark-theme');

    // Click toggle
    await page.click('#themeToggle');

    // Should have dark theme
    bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark-theme');

    // Toggle button should show sun
    const btnText = await page.locator('#themeToggle').textContent();
    expect(btnText).toBe('☀️');
  });

  test('theme persists after page reload', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body>
        <button id="themeToggle">🌙</button>
        <script src="../forecasts/js/shared/theme-manager.js"></script>
      </body>
      </html>
    `);

    // Toggle to dark
    await page.click('#themeToggle');

    // Reload page
    await page.reload();

    // Should still be dark
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark-theme');
  });

  test('data-loader.js fetches cash-flow-data.md', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/forecasts/dashboard.html');

    const result = await page.evaluate(async () => {
      const loader = new DataLoader();
      const data = await loader.fetchCashFlowData();
      return {
        loaded: data.length > 0,
        hasMonthlyBills: data.includes('## OUTFLOWS - Monthly'),
        hasBiweeklyBills: data.includes('## OUTFLOWS - Biweekly')
      };
    });

    expect(result.loaded).toBe(true);
    expect(result.hasMonthlyBills).toBe(true);
    expect(result.hasBiweeklyBills).toBe(true);
  });

  test('constants.js exports all values', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <script src="../forecasts/js/shared/constants.js"></script>
      </body>
      </html>
    `);

    const constants = await page.evaluate(() => window.CONSTANTS);

    expect(constants.FORECAST_DAYS).toBe(42);
    expect(constants.LOW_BALANCE_THRESHOLD).toBe(500);
    expect(constants.DEBOUNCE_DELAY).toBe(300);
    expect(constants.CHART_COLORS.normal).toBe('#667eea');
  });

  test('CSS variables defined for light theme', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body></body>
      </html>
    `);

    const bgPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );

    expect(bgPrimary).toBe('#ffffff');
  });

  test('CSS variables update for dark theme', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../forecasts/css/shared.css">
      </head>
      <body class="dark-theme"></body>
      </html>
    `);

    const bgPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
    );

    expect(bgPrimary).toBe('#0f172a');
  });

});
```

**Action:**
1. Create file `tests/e2e/phase1-shared-modules.spec.js`
2. Paste tests above
3. Run: `npx playwright test phase1-shared-modules.spec.js`

**Expected Result:** 7/7 tests passing

---

#### 1.7 Git Commit

**Action:**
```bash
cd "/Users/calvinwilliamsjr/Personal AI Enablement/Personal/Financial/Cash Flow Forecasts"
git add forecasts/css/shared.css
git add forecasts/js/shared/
git add tests/e2e/phase1-shared-modules.spec.js
git commit -m "Phase 1: Extract shared styles and JavaScript modules

- Create css/shared.css with theme variables and common styles
- Create js/shared/theme-manager.js for dark theme toggle
- Create js/shared/data-loader.js for fetching cash-flow-data.md
- Create js/shared/constants.js for shared configuration
- Add 7 Playwright tests for shared modules
- All tests passing (7/7)

Files created:
- forecasts/css/shared.css (400 lines)
- forecasts/js/shared/theme-manager.js (100 lines)
- forecasts/js/shared/data-loader.js (50 lines)
- forecasts/js/shared/constants.js (60 lines)
- tests/e2e/phase1-shared-modules.spec.js (120 lines)"
```

**Verify:** Commit appears in git log

---

### Phase 1 Completion Checklist

- [ ] Folder structure created (css/, js/shared/)
- [ ] shared.css extracted and organized (~400 lines)
- [ ] theme-manager.js created and tested (~100 lines)
- [ ] data-loader.js created and tested (~50 lines)
- [ ] constants.js created (~60 lines)
- [ ] 7 Playwright tests written and passing
- [ ] Git commit created with clear message
- [ ] No console errors when testing
- [ ] Theme toggle works in test page
- [ ] Data loader successfully fetches cash-flow-data.md

---

## PHASE 2: Split Dashboard Page

**Goal:** Create standalone dashboard.html (read-only, no scenario planner features)

**Duration:** 2 days
**Tests:** 25 Playwright tests

### Step-by-Step Tasks:

#### 2.1 Backup Original Dashboard

**Action:**
```bash
cd "/Users/calvinwilliamsjr/Personal AI Enablement/Personal/Financial/Cash Flow Forecasts"
cp forecasts/dashboard.html forecasts/dashboard-ORIGINAL-BACKUP.html
```

**Verify:** Backup file exists and is 18,542 lines

---

#### 2.2 Identify Code Sections to Remove

**Open:** `forecasts/dashboard.html`

**Sections to REMOVE (mark with comments first):**

1. **Control Panel Sidebar** (lines ~60-200):
   ```html
   <!-- REMOVE: Control panel for scenario planner -->
   <div class="control-panel" id="expenseControlPanel">
   ...
   </div>
   ```

2. **Scenario Planner CSS** (lines ~200-600):
   ```css
   /* REMOVE: Control panel styles */
   .control-panel { ... }
   .expense-item { ... }
   .preset-button { ... }
   .scenario-storage-panel { ... }
   ```

3. **Comparison View Section** (lines ~800-1000):
   ```html
   <!-- REMOVE: Comparison cards -->
   <div class="comparison-section">
   ...
   </div>
   ```

4. **Chart Switcher** (lines ~1100-1200):
   ```html
   <!-- REMOVE: Baseline vs Modified toggle -->
   <div class="chart-view-switcher">
   ...
   </div>
   ```

5. **Scenario Planner JavaScript** (lines ~1500-18,000):
   ```javascript
   // REMOVE: Parser, engine, calculator, manager classes
   class TransactionRuleEngine { ... }
   class ComparisonCalculator { ... }
   class ScenarioManager { ... }
   class ScenarioStorage { ... }
   ```

**Action:**
1. Read through dashboard.html
2. Add `<!-- REMOVE -->` comments around sections above
3. Do NOT delete yet - just mark for removal

---

#### 2.3 Extract Dashboard-Specific CSS

**Create:** `forecasts/css/dashboard.css`

**CSS to Extract (keep in dashboard.html for now):**
- Emergency banner styles (`.emergency-banner`)
- Action center styles (`.action-center`)
- Hero card styles (`.hero-card`, `.hero-stats`)
- Gauge styles (`.gauge-container`, `.gauge-fill`)
- Alert list styles (`.alert-list`, `.alert-item`)
- Forecast summary grid styles (`.forecast-summary`)
- Chart container styles (`.chart-container`)

**Action:**
1. Copy above CSS from dashboard.html `<style>` tag
2. Create new file `forecasts/css/dashboard.css`
3. Paste CSS
4. Organize with section comments

**Expected Output:** `css/dashboard.css` (~200 lines)

---

#### 2.4 Remove Scenario Planner Code

**Action:**
1. Delete all sections marked with `<!-- REMOVE -->` comments
2. Delete scenario planner CSS classes
3. Delete scenario planner JavaScript classes
4. Keep only dashboard features:
   - Emergency banner
   - Action center
   - Hero statistics
   - Alert badges
   - Critical alerts list
   - Forecast summary grid
   - Balance chart
   - Transaction table

**Expected Result:** File size reduces from 18,542 lines to ~900 lines

---

#### 2.5 Link Shared CSS and JS

**In dashboard.html `<head>` section, add:**

```html
<!-- Shared Styles -->
<link rel="stylesheet" href="css/shared.css">
<link rel="stylesheet" href="css/dashboard.css">

<!-- Shared Scripts -->
<script src="js/shared/constants.js"></script>
<script src="js/shared/theme-manager.js"></script>
```

**Remove old inline styles:**
- Delete `<style>` tag contents that are now in shared.css and dashboard.css
- Keep only page-specific inline styles if any

---

#### 2.6 Add Navigation to Scenario Planner

**In dashboard.html, add top-right navigation:**

```html
<body>
  <div class="page-header">
    <div class="header-left">
      <h1>Cash Flow Dashboard</h1>
    </div>
    <div class="header-right">
      <a href="scenario-planner.html" class="nav-link">
        📊 Scenario Planner
      </a>
      <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme">🌙</button>
    </div>
  </div>

  <!-- Rest of dashboard content -->
  ...
</body>
```

**Add CSS for navigation:**

```css
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: var(--bg-card);
  border-bottom: 2px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}
```

---

#### 2.7 Test Dashboard Page Loads

**Action:**
1. Open `forecasts/dashboard.html` in Chrome
2. Check for console errors (should be none)
3. Verify all sections render:
   - Emergency banner (if applicable)
   - Hero statistics
   - Alerts
   - Chart
   - Table
4. Test dark theme toggle
5. Test navigation link to scenario-planner.html (won't work yet - expected)

---

#### 2.8 Create Playwright Tests for Dashboard

**Create:** `tests/e2e/phase2-dashboard.spec.js`

**Tests to Write:**

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 2: Dashboard Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/forecasts/dashboard.html');
  });

  test('dashboard page loads successfully', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Cash Flow Dashboard');
  });

  test('emergency banner shows when negative within 7 days', async ({ page }) => {
    const banner = page.locator('.emergency-banner');

    // Check if visible (depends on data)
    const isVisible = await banner.isVisible().catch(() => false);

    if (isVisible) {
      await expect(banner).toContainText('ALERT');
    }
  });

  test('hero statistics cards render', async ({ page }) => {
    const incomeCard = page.locator('.hero-card.income');
    const expenseCard = page.locator('.hero-card.expense');
    const surplusCard = page.locator('.hero-card.surplus');

    await expect(incomeCard).toBeVisible();
    await expect(expenseCard).toBeVisible();
    await expect(surplusCard).toBeVisible();

    // Should show dollar values
    await expect(incomeCard).toContainText('$');
    await expect(expenseCard).toContainText('$');
  });

  test('spending gauge renders correctly', async ({ page }) => {
    const gauge = page.locator('.gauge-container');
    await expect(gauge).toBeVisible();

    const gaugeFill = page.locator('.gauge-fill');
    const width = await gaugeFill.getAttribute('style');
    expect(width).toContain('width:');
  });

  test('alert badges show counts', async ({ page }) => {
    const criticalBadge = page.locator('.alert-badge.critical');
    const warningBadge = page.locator('.alert-badge.warning');

    // Should show numbers
    const criticalText = await criticalBadge.textContent();
    const warningText = await warningBadge.textContent();

    expect(criticalText).toMatch(/\d+/);
    expect(warningText).toMatch(/\d+/);
  });

  test('critical alerts list renders', async ({ page }) => {
    const alertsList = page.locator('.alerts-list');
    await expect(alertsList).toBeVisible();

    const alertItems = page.locator('.alert-item');
    const count = await alertItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('forecast summary grid shows values', async ({ page }) => {
    const summary = page.locator('.forecast-summary');
    await expect(summary).toBeVisible();

    // Should show starting balance
    await expect(summary).toContainText('Starting Balance');
    await expect(summary).toContainText('$');

    // Should show ending balance
    await expect(summary).toContainText('Ending Balance');
  });

  test('balance chart renders', async ({ page }) => {
    const chart = page.locator('canvas#balanceChart');
    await expect(chart).toBeVisible();

    // Wait for Chart.js to render
    await page.waitForTimeout(1000);

    // Check canvas has content
    const hasContent = await chart.evaluate((canvas) => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return imageData.data.some(pixel => pixel !== 0);
    });

    expect(hasContent).toBe(true);
  });

  test('transaction table renders with data', async ({ page }) => {
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();

    const rows = page.locator('.transaction-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // First row should have date
    const firstRow = rows.first();
    await expect(firstRow).toContainText(/\d{4}-\d{2}-\d{2}/);
  });

  test('table filter buttons work', async ({ page }) => {
    const allButton = page.locator('button[data-filter="all"]');
    const flaggedButton = page.locator('button[data-filter="flagged"]');

    await allButton.click();

    let rows = page.locator('.transaction-table tbody tr:visible');
    const allCount = await rows.count();

    await flaggedButton.click();

    rows = page.locator('.transaction-table tbody tr:visible');
    const flaggedCount = await rows.count();

    expect(flaggedCount).toBeLessThanOrEqual(allCount);
  });

  test('dark theme toggle works', async ({ page }) => {
    const toggle = page.locator('#themeToggle');
    await expect(toggle).toBeVisible();

    // Initial: light theme
    let bodyClass = await page.locator('body').getAttribute('class');
    const initialDark = bodyClass?.includes('dark-theme') || false;

    // Toggle
    await toggle.click();

    bodyClass = await page.locator('body').getAttribute('class');
    const afterToggleDark = bodyClass?.includes('dark-theme') || false;

    expect(afterToggleDark).toBe(!initialDark);
  });

  test('navigation link to scenario planner exists', async ({ page }) => {
    const navLink = page.locator('a[href="scenario-planner.html"]');
    await expect(navLink).toBeVisible();
    await expect(navLink).toContainText('Scenario Planner');
  });

  test('no control panel sidebar present', async ({ page }) => {
    const controlPanel = page.locator('.control-panel');
    expect(await controlPanel.count()).toBe(0);
  });

  test('no comparison view present', async ({ page }) => {
    const comparisonSection = page.locator('.comparison-section');
    expect(await comparisonSection.count()).toBe(0);
  });

  test('no chart switcher present', async ({ page }) => {
    const switcher = page.locator('.chart-view-switcher');
    expect(await switcher.count()).toBe(0);
  });

  test('no expense checkboxes present', async ({ page }) => {
    const checkboxes = page.locator('.expense-checkbox');
    expect(await checkboxes.count()).toBe(0);
  });

  test('transactions array populated', async ({ page }) => {
    const hasData = await page.evaluate(() => {
      return window.transactions && window.transactions.length > 0;
    });

    expect(hasData).toBe(true);
  });

  test('chartData object exists', async ({ page }) => {
    const hasChart = await page.evaluate(() => {
      return window.chartData &&
             window.chartData.labels &&
             window.chartData.labels.length > 0;
    });

    expect(hasChart).toBe(true);
  });

  test('no console errors on page load', async ({ page }) => {
    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    expect(errors.length).toBe(0);
  });

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle('Cash Flow Dashboard');
  });

  test('responsive layout on smaller screens', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Chart should still be visible
    const chart = page.locator('canvas#balanceChart');
    await expect(chart).toBeVisible();
  });

  test('visual snapshot - light theme', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-light.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('visual snapshot - dark theme', async ({ page }) => {
    const toggle = page.locator('#themeToggle');
    await toggle.click();
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('dashboard-dark.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

});
```

**Action:**
1. Create file `tests/e2e/phase2-dashboard.spec.js`
2. Paste tests above
3. Run: `npx playwright test phase2-dashboard.spec.js`

**Expected Result:** 23/23 tests passing (2 visual snapshots baseline created)

---

#### 2.9 Git Commit

**Action:**
```bash
git add forecasts/dashboard.html
git add forecasts/dashboard-ORIGINAL-BACKUP.html
git add forecasts/css/dashboard.css
git add tests/e2e/phase2-dashboard.spec.js
git commit -m "Phase 2: Create standalone dashboard page (read-only)

- Remove all scenario planner features from dashboard.html
- Extract dashboard-specific CSS to css/dashboard.css
- Link shared CSS and JS modules
- Add navigation link to scenario planner
- Reduce file size from 18,542 to ~900 lines
- Add 23 Playwright tests for dashboard
- All tests passing (23/23)

Removed features:
- Control panel sidebar
- Expense checkboxes
- Comparison view
- Chart switcher
- Scenario management

Files modified:
- forecasts/dashboard.html (now 900 lines)
- forecasts/css/dashboard.css (200 lines, new)
- tests/e2e/phase2-dashboard.spec.js (380 lines, new)

Backup:
- forecasts/dashboard-ORIGINAL-BACKUP.html (18,542 lines)"
```

---

### Phase 2 Completion Checklist

- [ ] Original dashboard backed up
- [ ] Scenario planner code removed (17,600+ lines deleted)
- [ ] dashboard.css extracted (~200 lines)
- [ ] Shared CSS/JS linked correctly
- [ ] Navigation header added with link to scenario planner
- [ ] Dashboard renders correctly in Chrome
- [ ] No console errors
- [ ] 23 Playwright tests passing
- [ ] Visual snapshots captured (light + dark theme)
- [ ] Git commit created
- [ ] File size reduced to ~900 lines

---

## PHASE 3: Extract Scenario Planner JavaScript Classes

**Goal:** Modularize scenario planner logic into separate JS files

**Duration:** 2 days
**Tests:** 40 Playwright tests

### Step-by-Step Tasks:

#### 3.1 Analyze Current Scenario Planner Code Structure

**Open:** `forecasts/dashboard-ORIGINAL-BACKUP.html`

**Identify JavaScript Classes to Extract:**

1. **Parser** (lines ~1500-1800)
   - Function: `parseMarkdownCashFlowData()`
   - Parses `cash-flow-data.md` into TRANSACTION_RULES object

2. **TransactionRuleEngine** (lines ~1800-2500)
   - Class: `TransactionRuleEngine`
   - Methods: `calculateDailyForecast()`, `isBiweeklyDue()`, `getFlag()`

3. **ComparisonCalculator** (lines ~2500-2800)
   - Class: `ComparisonCalculator`
   - Methods: `getTotalRemoved()`, `getEndingBalanceChange()`, `getNegativeDaysReduction()`

4. **ScenarioManager** (lines ~2800-3500)
   - Class: `ScenarioManager`
   - Methods: `toggleExpense()`, `debouncedRecalculate()`, `addListener()`, `notifyListeners()`

5. **ScenarioStorage** (lines ~3500-3800)
   - Class: `ScenarioStorage`
   - Methods: `saveScenario()`, `loadScenario()`, `deleteScenario()`, `listScenarios()`

6. **UI Controller** (lines ~3800-5000)
   - Functions: Event handlers for checkboxes, buttons, filters
   - Methods: `initializeExpensePanel()`, `setupEventListeners()`, `updateComparisonView()`

---

#### 3.2 Extract Parser Module

**Create:** `forecasts/js/scenario-planner/parser.js`

**Code Structure:**

```javascript
/**
 * Parser - Parses cash-flow-data.md into transaction rules
 *
 * Extracts:
 * - Monthly bills (by day of month)
 * - Biweekly bills (with anchor dates)
 * - Weekday recurring expenses
 * - Friday allocations
 * - Inflows (paychecks, rent)
 */

class CashFlowParser {
  constructor() {
    this.rules = {
      monthly: [],
      biweekly: [],
      weekdayRecurring: [],
      fridayRecurring: [],
      inflows: []
    };
  }

  /**
   * Parse markdown text into transaction rules
   * @param {string} markdownText - Content of cash-flow-data.md
   * @returns {Object} Parsed transaction rules
   */
  parse(markdownText) {
    const lines = markdownText.split('\n');
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect section headers
      if (line.includes('## OUTFLOWS - Monthly')) {
        currentSection = 'monthly';
        continue;
      } else if (line.includes('## OUTFLOWS - Biweekly')) {
        currentSection = 'biweekly';
        continue;
      } else if (line.includes('## OUTFLOWS - Weekday Recurring')) {
        currentSection = 'weekdayRecurring';
        continue;
      } else if (line.includes('## OUTFLOWS - Friday Recurring')) {
        currentSection = 'fridayRecurring';
        continue;
      } else if (line.includes('## INFLOWS')) {
        currentSection = 'inflows';
        continue;
      }

      // Parse transactions based on current section
      if (currentSection && line.startsWith('- ')) {
        const transaction = this.parseTransactionLine(line, currentSection);
        if (transaction) {
          this.rules[currentSection].push(transaction);
        }
      }
    }

    return this.rules;
  }

  /**
   * Parse individual transaction line
   * @param {string} line - Single line from markdown
   * @param {string} section - Current section type
   * @returns {Object|null} Parsed transaction or null
   */
  parseTransactionLine(line, section) {
    // Remove leading "- " and trim
    line = line.substring(2).trim();

    if (section === 'monthly') {
      // Format: "Day X: Name $amount; Name $amount"
      const dayMatch = line.match(/Day (\d+):\s*(.+)/);
      if (!dayMatch) return null;

      const day = parseInt(dayMatch[1]);
      const expensesText = dayMatch[2];

      // Parse multiple expenses on same day
      const expenses = [];
      const expensePattern = /([^$;]+)\$([0-9,]+\.?\d*)/g;
      let match;

      while ((match = expensePattern.exec(expensesText)) !== null) {
        const name = match[1].trim();
        const amount = parseFloat(match[2].replace(/,/g, ''));

        expenses.push({
          id: this.generateId(name),
          name: name,
          amount: amount,
          day: day,
          category: 'monthly'
        });
      }

      return expenses.length > 0 ? expenses : null;

    } else if (section === 'biweekly') {
      // Format: "Name: $amount | Anchor: YYYY-MM-DD"
      const match = line.match(/(.+):\s*\$([0-9,]+\.?\d*)\s*\|\s*Anchor:\s*(\d{4}-\d{2}-\d{2})/);
      if (!match) return null;

      return {
        id: this.generateId(match[1]),
        name: match[1].trim(),
        amount: parseFloat(match[2].replace(/,/g, '')),
        anchor: match[3],
        category: 'biweekly'
      };

    } else if (section === 'weekdayRecurring') {
      // Format: "Name: $amount every weekday"
      const match = line.match(/(.+):\s*\$([0-9,]+\.?\d*)/);
      if (!match) return null;

      return {
        id: this.generateId(match[1]),
        name: match[1].trim(),
        amount: parseFloat(match[2].replace(/,/g, '')),
        category: 'weekday-recurring'
      };

    } else if (section === 'fridayRecurring') {
      // Format: "Name: $amount"
      const match = line.match(/(.+):\s*\$([0-9,]+\.?\d*)/);
      if (!match) return null;

      return {
        id: this.generateId(match[1]),
        name: match[1].trim(),
        amount: parseFloat(match[2].replace(/,/g, '')),
        category: 'friday-recurring'
      };

    } else if (section === 'inflows') {
      // Format: "Name: $amount | Frequency: [details]"
      const match = line.match(/(.+):\s*\$([0-9,]+\.?\d*)\s*\|\s*(.+)/);
      if (!match) return null;

      const frequencyText = match[3];
      let frequency = { type: 'monthly', value: 1 };

      if (frequencyText.includes('Biweekly')) {
        const anchorMatch = frequencyText.match(/Anchor:\s*(\d{4}-\d{2}-\d{2})/);
        frequency = {
          type: 'biweekly',
          anchor: anchorMatch ? anchorMatch[1] : null
        };
      }

      return {
        id: this.generateId(match[1]),
        name: match[1].trim(),
        amount: parseFloat(match[2].replace(/,/g, '')),
        frequency: frequency,
        category: 'inflow'
      };
    }

    return null;
  }

  /**
   * Generate unique ID from name
   * @param {string} name - Transaction name
   * @returns {string} Unique ID
   */
  generateId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Flatten rules for easier access
   * @returns {Object} Flattened rules by ID
   */
  flatten() {
    const flattened = {};

    // Flatten monthly (may have multiple per day)
    this.rules.monthly.forEach(dayExpenses => {
      if (Array.isArray(dayExpenses)) {
        dayExpenses.forEach(expense => {
          flattened[expense.id] = expense;
        });
      }
    });

    // Add other categories
    ['biweekly', 'weekdayRecurring', 'fridayRecurring', 'inflows'].forEach(category => {
      this.rules[category].forEach(item => {
        flattened[item.id] = item;
      });
    });

    return flattened;
  }
}

// Export
if (typeof window !== 'undefined') {
  window.CashFlowParser = CashFlowParser;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CashFlowParser;
}
```

**Action:**
1. Create file `forecasts/js/scenario-planner/parser.js`
2. Copy parser code from dashboard-ORIGINAL-BACKUP.html
3. Refactor into CashFlowParser class structure above
4. Test in browser console

**Expected Output:** `js/scenario-planner/parser.js` (~300 lines)

---

#### 3.3 Extract TransactionRuleEngine Module

**Create:** `forecasts/js/scenario-planner/transaction-engine.js`

**Code Structure:**

```javascript
/**
 * TransactionRuleEngine - Calculates daily cash flow forecast
 *
 * Takes transaction rules and generates 42-day forecast with:
 * - Daily debits and credits
 * - Running balance
 * - Flags (NEG for negative, LOW for < $500)
 */

class TransactionRuleEngine {
  constructor(rules, startDate, startBalance) {
    this.rules = rules; // Flattened rules object by ID
    this.startDate = new Date(startDate);
    this.startBalance = startBalance;
    this.forecastDays = window.CONSTANTS ? window.CONSTANTS.FORECAST_DAYS : 42;
    this.lowThreshold = window.CONSTANTS ? window.CONSTANTS.LOW_BALANCE_THRESHOLD : 500;
  }

  /**
   * Calculate 42-day forecast
   * @param {Set} disabledExpenses - Set of expense IDs to exclude
   * @returns {Array} Daily forecast array
   */
  calculateDailyForecast(disabledExpenses = new Set()) {
    const forecast = [];
    let balance = this.startBalance;
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.forecastDays - 1);

    for (let date = new Date(this.startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayTransactions = this.getTransactionsForDay(new Date(date), disabledExpenses);

      const debits = dayTransactions.debits.reduce((sum, t) => sum + t.amount, 0);
      const credits = dayTransactions.credits.reduce((sum, t) => sum + t.amount, 0);

      balance = balance + credits - debits;

      forecast.push({
        date: this.formatDate(date),
        debits: debits,
        credits: credits,
        endBalance: balance,
        flag: this.getFlag(balance),
        debitNames: dayTransactions.debits.map(t => t.name).join(', '),
        creditNames: dayTransactions.credits.map(t => t.name).join(', ')
      });
    }

    return forecast;
  }

  /**
   * Get all transactions for specific day
   * @param {Date} date - Target date
   * @param {Set} disabledExpenses - Disabled expense IDs
   * @returns {Object} {debits: [], credits: []}
   */
  getTransactionsForDay(date, disabledExpenses) {
    const debits = [];
    const credits = [];

    Object.values(this.rules).forEach(rule => {
      // Skip if disabled
      if (disabledExpenses.has(rule.id)) return;

      if (rule.category === 'monthly') {
        // Monthly bills on specific day
        if (date.getDate() === rule.day) {
          debits.push(rule);
        }

      } else if (rule.category === 'biweekly') {
        // Biweekly bills using modulo 14 math
        if (this.isBiweeklyDue(date, rule.anchor)) {
          debits.push(rule);
        }

      } else if (rule.category === 'weekday-recurring') {
        // Every weekday (Mon-Fri)
        const dayOfWeek = date.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          debits.push(rule);
        }

      } else if (rule.category === 'friday-recurring') {
        // Every Friday
        if (date.getDay() === 5) {
          debits.push(rule);
        }

      } else if (rule.category === 'inflow') {
        // Inflows (paychecks)
        if (rule.frequency.type === 'biweekly' && rule.frequency.anchor) {
          if (this.isBiweeklyDue(date, rule.frequency.anchor)) {
            credits.push(rule);
          }
        } else if (rule.frequency.type === 'monthly') {
          // Monthly on day 1
          if (date.getDate() === 1) {
            credits.push(rule);
          }
        }
      }
    });

    return { debits, credits };
  }

  /**
   * Check if biweekly transaction is due
   * @param {Date} date - Date to check
   * @param {string} anchorString - Anchor date (YYYY-MM-DD)
   * @returns {boolean} True if due
   */
  isBiweeklyDue(date, anchorString) {
    const anchor = new Date(anchorString);
    const daysDiff = Math.floor((date - anchor) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff % 14 === 0;
  }

  /**
   * Get balance flag
   * @param {number} balance - Current balance
   * @returns {string} 'NEG', 'LOW', or ''
   */
  getFlag(balance) {
    if (balance < 0) return 'NEG';
    if (balance < this.lowThreshold) return 'LOW';
    return '';
  }

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// Export
if (typeof window !== 'undefined') {
  window.TransactionRuleEngine = TransactionRuleEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransactionRuleEngine;
}
```

**Expected Output:** `js/scenario-planner/transaction-engine.js` (~200 lines)

---

#### 3.4 Extract ComparisonCalculator Module

**Create:** `forecasts/js/scenario-planner/comparison-calc.js`

*Due to length constraints, I'll continue with summary format for remaining phases. Each step will follow the same detailed pattern established above.*

**Expected Output:** `js/scenario-planner/comparison-calc.js` (~150 lines)

---

#### 3.5 Extract ScenarioManager Module

**Expected Output:** `js/scenario-planner/scenario-manager.js` (~250 lines)

---

#### 3.6 Extract ScenarioStorage Module

**Expected Output:** `js/scenario-planner/scenario-storage.js` (~150 lines)

---

#### 3.7 Extract UI Controller Module

**Expected Output:** `js/scenario-planner/ui-controller.js` (~400 lines)

---

#### 3.8 Create Playwright Tests for Phase 3

**Create:** `tests/e2e/phase3-modules.spec.js`

**40 tests covering:**
- Parser correctly extracts monthly bills
- Parser correctly extracts biweekly bills
- TransactionRuleEngine calculates 42-day forecast
- Biweekly date math (modulo 14) works
- ComparisonCalculator computes deltas correctly
- ScenarioManager debounces recalculations
- ScenarioStorage persists to localStorage
- UI Controller wires events correctly

**Expected Result:** 40/40 tests passing

---

#### 3.9 Git Commit

**Message:** "Phase 3: Modularize scenario planner JavaScript"

---

### Phase 3 Completion Checklist

- [ ] All 6 JS modules extracted
- [ ] ES6 import/export working
- [ ] 40 Playwright tests passing
- [ ] No circular dependencies
- [ ] Git commit created

---

## PHASE 4: Create Scenario Planner Page

*(Detailed steps following same pattern)*

**Key Tasks:**
- Create scenario-planner.html structure
- Link all CSS and JS modules
- Build left sidebar HTML
- Build main content area HTML
- Wire up event listeners
- Test full interactive workflow

**Expected Output:** scenario-planner.html (~1,800 lines)
**Tests:** 50 Playwright tests

---

## PHASE 5: Create Landing/Navigation Page

*(Detailed steps following same pattern)*

**Key Tasks:**
- Create index.html with navigation cards
- Link shared CSS and theme manager
- Add footer with last updated date
- Test navigation to both pages

**Expected Output:** index.html (~200 lines)
**Tests:** 15 Playwright tests

---

## PHASE 6: Update Tests for Multi-Page Architecture

*(Detailed steps following same pattern)*

**Key Tasks:**
- Create navigation.spec.js
- Refactor dashboard.spec.js
- Create scenario-planner.spec.js
- Create visual regression tests
- Update playwright.config.js

**Expected Output:** 100 comprehensive tests
**Tests:** 100/100 passing

---

## PHASE 7: Agent Integration & Documentation

*(Detailed steps following same pattern)*

**Key Tasks:**
- Update dashboard-updater agent
- Create MULTI-PAGE-ARCHITECTURE.md
- Update cash-flow-guide.md
- Test agent workflow end-to-end
- Create PR to main

**Expected Output:** Updated agents + docs
**Tests:** Agent integration passing

---

## 📊 Comparison: Before vs After

### Before (Single Page)
```
forecasts/
└── dashboard.html    18,542 lines
```

**Problems:**
- ❌ Massive file size (hard to maintain)
- ❌ Mixed concerns (dashboard + scenario planner)
- ❌ Slow load time (loads everything at once)
- ❌ Confusing UX (everything visible at once)
- ❌ Hard to test (all tests in one file)

---

### After (Multi-Page)
```
forecasts/
├── index.html                       200 lines
├── dashboard.html                   900 lines
├── scenario-planner.html          1,800 lines
├── css/
│   ├── shared.css                   400 lines
│   ├── dashboard.css                200 lines
│   └── scenario-planner.css         400 lines
├── js/
│   ├── shared/                      200 lines
│   ├── dashboard/                   150 lines
│   └── scenario-planner/          1,750 lines
└── tests/
    ├── e2e/
    │   ├── navigation.spec.js        15 tests
    │   ├── dashboard.spec.js         25 tests
    │   └── scenario-planner.spec.js  50 tests
    └── visual/                       25 screenshots
```

**Benefits:**
- ✅ Modular architecture (easy to maintain)
- ✅ Separation of concerns (clear page purposes)
- ✅ Fast load time (only load what you need)
- ✅ Intuitive UX (navigate between features)
- ✅ Easy to test (focused test suites per page)
- ✅ Scalable (easy to add new pages/features)

---

## 🎯 Success Criteria

### Per Phase
- ✅ All code modularized and well-organized
- ✅ All Playwright tests passing (100%)
- ✅ No console errors in browser
- ✅ Dark theme works across all pages
- ✅ Navigation works seamlessly
- ✅ Agent workflow still functional

### Overall Project
- ✅ 3 pages (index, dashboard, scenario-planner)
- ✅ 10 CSS/JS module files
- ✅ 100 Playwright tests passing
- ✅ Clean, maintainable codebase
- ✅ Fast page load times (<2 seconds)
- ✅ Responsive design (desktop focus)
- ✅ All existing features preserved
- ✅ User approval for final merge

---

## 🚀 Implementation Timeline

| Phase | Description | Duration | Deliverable |
|-------|-------------|----------|-------------|
| Phase 1 | Extract Shared Styles & Scripts | 1 day | 4 shared files |
| Phase 2 | Split Dashboard Page | 2 days | Clean dashboard.html |
| Phase 3 | Extract Scenario JS Classes | 2 days | 6 JS modules |
| Phase 4 | Create Scenario Planner Page | 3 days | scenario-planner.html |
| Phase 5 | Create Landing/Navigation Page | 1 day | index.html |
| Phase 6 | Update Tests for Multi-Page | 2 days | 100 tests passing |
| Phase 7 | Agent Integration & Docs | 1 day | Updated agents |
| **Total** | | **12 days** | **Multi-page website** |

---

## 🔧 Technical Approach (Based on Previous Work)

### Following the Same Proven Pattern

**What Worked Well in Previous Implementation:**
1. ✅ **Playwright-only testing** - No Jest, all tests via Playwright
2. ✅ **Automated workflow** - No approval gates between phases
3. ✅ **Phase-by-phase commits** - Commit after each phase completion
4. ✅ **Feature branch** - Work in isolation from main
5. ✅ **Comprehensive testing** - E2E + visual regression
6. ✅ **Chrome desktop focus** - No mobile optimization for v1
7. ✅ **ES6+ JavaScript** - No transpilation needed
8. ✅ **CSS custom properties** - Theme variables for light/dark
9. ✅ **Auto-parser approach** - Dynamic markdown parsing

**Apply Same Approach to Multi-Page Migration:**
- ✅ Use Playwright for all testing (navigation, functionality, visual)
- ✅ Build all 7 phases automatically without approval gates
- ✅ Commit after each phase with clear commit messages
- ✅ Work on `feature/multi-page-website` branch
- ✅ Run tests after each phase - only proceed if passing
- ✅ Target Chrome desktop only
- ✅ Use ES6 modules (import/export)
- ✅ Maintain dark theme with CSS variables
- ✅ Keep auto-parser for cash-flow-data.md

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Backup current dashboard.html to `dashboard-ORIGINAL-BACKUP.html`
- [ ] Create new branch: `feature/multi-page-website`
- [ ] Install any missing dependencies
- [ ] Verify all current tests passing (132/134)

### Phase 1: Shared Modules
- [ ] Create `css/shared.css` with theme variables
- [ ] Create `js/shared/theme-manager.js`
- [ ] Create `js/shared/data-loader.js`
- [ ] Create `js/shared/constants.js`
- [ ] Run 10 Playwright tests for theme manager
- [ ] Commit: "Phase 1: Extract shared styles and scripts"

### Phase 2: Dashboard Page
- [ ] Remove scenario planner code from dashboard.html
- [ ] Link shared CSS and JS
- [ ] Add navigation link to scenario planner
- [ ] Run 25 Playwright tests for dashboard
- [ ] Commit: "Phase 2: Create standalone dashboard page"

### Phase 3: Scenario JS Modules
- [ ] Extract parser to `js/scenario-planner/parser.js`
- [ ] Extract TransactionRuleEngine to `transaction-engine.js`
- [ ] Extract ComparisonCalculator to `comparison-calc.js`
- [ ] Extract ScenarioManager to `scenario-manager.js`
- [ ] Extract ScenarioStorage to `scenario-storage.js`
- [ ] Extract UI controllers to `ui-controller.js`
- [ ] Run 40 Playwright tests for modules
- [ ] Commit: "Phase 3: Modularize scenario planner JavaScript"

### Phase 4: Scenario Planner Page
- [ ] Create `scenario-planner.html` structure
- [ ] Link all CSS and JS modules
- [ ] Wire up event handlers
- [ ] Run 50 Playwright tests for scenario planner
- [ ] Commit: "Phase 4: Create standalone scenario planner page"

### Phase 5: Landing Page
- [ ] Create `index.html` with navigation cards
- [ ] Link shared CSS and theme manager
- [ ] Run 15 Playwright tests for navigation
- [ ] Commit: "Phase 5: Create landing page"

### Phase 6: Test Suite Update
- [ ] Create `tests/e2e/navigation.spec.js`
- [ ] Refactor `tests/e2e/dashboard.spec.js`
- [ ] Create `tests/e2e/scenario-planner.spec.js`
- [ ] Create visual regression tests
- [ ] Run all 100 tests - verify 100% pass rate
- [ ] Commit: "Phase 6: Update test suite for multi-page architecture"

### Phase 7: Agent Integration
- [ ] Update `.claude/agents/dashboard-updater.md`
- [ ] Create `docs/MULTI-PAGE-ARCHITECTURE.md`
- [ ] Update `docs/cash-flow-guide.md`
- [ ] Test agent workflow end-to-end
- [ ] Commit: "Phase 7: Update agents and documentation"

### Post-Migration
- [ ] Delete `dashboard-ORIGINAL-BACKUP.html` (if all tests pass)
- [ ] Create PR to main branch
- [ ] Run full test suite one final time
- [ ] User review and approval
- [ ] Merge to main

---

## 🚨 Risk Mitigation

### Potential Issues & Solutions

**Issue 1: Breaking existing agent workflow**
- **Risk:** dashboard-updater agent might fail with new file structure
- **Mitigation:**
  - Keep dashboard.html path the same
  - Test agent after Phase 2 completion
  - Update agent file references if needed

**Issue 2: Theme state not persisting across pages**
- **Risk:** Dark theme resets when navigating
- **Mitigation:**
  - Use localStorage to store theme preference
  - Apply theme on page load via theme-manager.js
  - Test navigation between all 3 pages

**Issue 3: JavaScript module import/export errors**
- **Risk:** ES6 modules might not load correctly
- **Mitigation:**
  - Use `type="module"` in script tags
  - Test each module independently
  - Add error handling for failed imports

**Issue 4: Chart.js not loading on scenario planner page**
- **Risk:** Chart annotations might break when split across pages
- **Mitigation:**
  - Include Chart.js CDN on both dashboard and scenario planner
  - Test chart rendering on both pages
  - Verify annotation plugin loads correctly

**Issue 5: localStorage conflicts between pages**
- **Risk:** Saved scenarios might not load correctly
- **Mitigation:**
  - Use consistent localStorage keys
  - Test save/load across page reloads
  - Clear localStorage between test runs

---

## 📝 Notes

### Key Design Decisions

1. **Why 3 pages instead of 2?**
   - Landing page provides clear entry point
   - Allows for future expansion (reports, settings, etc.)
   - Professional multi-page website feel

2. **Why keep scenario planner separate from dashboard?**
   - Dashboard is read-only (view forecast)
   - Scenario planner is interactive (explore what-ifs)
   - Clear mental model for users
   - Faster load times (only load what you need)

3. **Why not use a JavaScript framework (React, Vue)?**
   - Current implementation is vanilla JS
   - No build step required
   - Simpler to maintain
   - Chrome-only target means ES6+ is fine
   - User prefers minimal dependencies

4. **Why modularize JavaScript classes?**
   - Easier to test individual components
   - Reusable across pages if needed
   - Cleaner code organization
   - Follows Single Responsibility Principle

5. **Why Playwright-only testing?**
   - User explicitly requested this approach
   - Proven to work well in previous implementation
   - Can test everything (E2E, visual, functional)
   - Single testing framework = simpler setup

---

## ✅ Ready to Build

This plan follows the exact same proven approach from the interactive scenario planner implementation:
- Playwright-only testing
- Automated phase-by-phase workflow
- Feature branch isolation
- Chrome desktop focus
- ES6+ JavaScript with no transpilation
- Comprehensive testing after each phase

**Next Step:** User approval, then begin Phase 1 - Extract shared styles and scripts

---

## 🤔 User Decision Required

Before starting implementation, please confirm:

1. **Do you approve the 3-page structure?** (index → dashboard → scenario-planner)
2. **Should we follow the same automated workflow?** (build all phases, test after each, no approval gates)
3. **Any changes to the proposed file structure?**
4. **Any additional features you want on the landing page?**

Once approved, I'll begin Phase 1 immediately and work through all 7 phases automatically, messaging you when complete.
