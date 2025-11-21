# Testing Strategy - FINAL DECISION

**Version:** 2.0
**Date:** 2025-11-21
**Status:** APPROVED - Use Playwright for Everything

---

## 🎯 Final Decision: Playwright for All Testing

**User Requirement:**
> "You do all of the testing w/ playwright, scripts and screenshots, add that to the plan and you do that. You test everything in that fashion"

---

## Testing Approach

### Primary Tool: Playwright
- **All E2E tests** - User interactions, workflows
- **All visual regression tests** - Screenshot comparisons
- **All functional tests** - Verify features work
- **Scripts to automate** - Run tests, capture screenshots
- **Full coverage** - Every feature, every interaction

### No Jest Unit Tests
- ❌ Skip pure unit tests (not required)
- ✅ Use Playwright for everything instead
- ✅ Playwright can test calculations, UI, interactions, visuals

---

## Playwright Test Structure

### Per Phase Testing:

```
tests/
├── e2e/
│   ├── phase1-ui.spec.js           # UI rendering & interactions
│   ├── phase2-calculations.spec.js  # Forecast accuracy
│   ├── phase3-comparison.spec.js    # Comparison metrics
│   ├── phase4-realtime.spec.js      # Live updates
│   └── phase5-scenarios.spec.js     # Save/load workflows
├── visual/
│   ├── phase1-visual.spec.js        # Screenshot baselines
│   ├── phase2-visual.spec.js
│   ├── phase3-visual.spec.js
│   ├── phase4-visual.spec.js
│   └── phase5-visual.spec.js
└── scripts/
    ├── capture-all-screenshots.js   # Automated screenshot capture
    ├── run-all-tests.js             # Run complete test suite
    └── generate-report.js           # HTML test report
```

---

## What Gets Tested (Playwright)

### Phase 1: Expense Control Panel UI
**E2E Tests:**
- ✅ Sidebar renders with correct width (350px)
- ✅ All 46 expense checkboxes appear
- ✅ Checkboxes can be checked/unchecked
- ✅ Strikethrough appears when unchecked
- ✅ Search box filters expenses
- ✅ Preset buttons work (Survival, Aggressive)
- ✅ Reset button re-checks all
- ✅ Collapse/expand toggle works

**Visual Tests:**
- ✅ Screenshot: Full sidebar view
- ✅ Screenshot: Each category expanded
- ✅ Screenshot: Expense unchecked (strikethrough)
- ✅ Screenshot: Impact summary card
- ✅ Screenshot: Dark theme mode

**Scripts:**
- `capture-phase1-screenshots.js` - Capture all UI states
- `run-phase1-tests.js` - Run all Phase 1 tests

---

### Phase 2: Calculation Engine + Parser
**E2E Tests:**
- ✅ Parser reads `cash-flow-data.md` correctly
- ✅ All monthly bills parsed with correct amounts
- ✅ All biweekly bills parsed with anchor dates
- ✅ Calculation engine produces 42-day forecast
- ✅ Calculations match agent output (within $0.01)
- ✅ Biweekly date math correct (modulo 14)
- ✅ Weekday recurring only on Mon-Fri
- ✅ Friday allocations only on Fridays
- ✅ LOW/NEG flags set correctly

**Visual Tests:**
- ✅ Screenshot: Forecast table with calculations
- ✅ Screenshot: Console showing no errors
- ✅ Screenshot: Comparison with agent output

**Scripts:**
- `verify-calculations.js` - Compare with agent forecast
- `run-phase2-tests.js` - Run all Phase 2 tests

---

### Phase 3: Comparison View
**E2E Tests:**
- ✅ Comparison cards display correct metrics
- ✅ Ending balance delta calculates correctly
- ✅ Negative days reduction shows properly
- ✅ Status change (NEGATIVE → POSITIVE) displays
- ✅ Removed expenses list shows toggled items
- ✅ Green/red color coding works
- ✅ Delta badges show + or - correctly

**Visual Tests:**
- ✅ Screenshot: Comparison cards (before/after)
- ✅ Screenshot: Delta badges (positive improvement)
- ✅ Screenshot: Removed expenses summary
- ✅ Screenshot: Status change indicator

**Scripts:**
- `capture-comparison-views.js` - All comparison states
- `run-phase3-tests.js` - Run all Phase 3 tests

---

### Phase 4: Real-Time Updates
**E2E Tests:**
- ✅ Toggling expense triggers recalculation (<500ms)
- ✅ Chart switches between baseline/modified
- ✅ Transaction table updates with new balances
- ✅ Comparison metrics recalculate
- ✅ Debouncing prevents excessive updates
- ✅ Multiple rapid toggles work smoothly
- ✅ No UI lag or freezing

**Visual Tests:**
- ✅ Screenshot: Before toggle
- ✅ Screenshot: After toggle (updated chart)
- ✅ Screenshot: Baseline chart view
- ✅ Screenshot: Modified chart view
- ✅ Video: Toggle interaction (Playwright trace)

**Scripts:**
- `test-interactivity.js` - Rapid toggle stress test
- `capture-chart-views.js` - Both chart states
- `run-phase4-tests.js` - Run all Phase 4 tests

---

### Phase 5: Scenario Management
**E2E Tests:**
- ✅ Can save scenario to localStorage
- ✅ Can load saved scenario
- ✅ Can delete scenario
- ✅ Preset scenarios apply correctly
- ✅ Export/import scenarios works
- ✅ Multiple scenarios persist across reloads
- ✅ Scenario list updates dynamically

**Visual Tests:**
- ✅ Screenshot: Save dialog
- ✅ Screenshot: Scenario list with 3+ scenarios
- ✅ Screenshot: Loaded scenario (checkboxes match)
- ✅ Screenshot: Export confirmation
- ✅ Screenshot: Preset applied (Survival Mode)

**Scripts:**
- `test-scenario-persistence.js` - localStorage reliability
- `capture-scenario-workflows.js` - Save/load flows
- `run-phase5-tests.js` - Run all Phase 5 tests

---

## Playwright Configuration

### `playwright.config.js`

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run sequentially for stability
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'file://' + process.cwd() + '/forecasts/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
```

---

## Test Execution Commands

### Run All Tests
```bash
npx playwright test
```

### Run Phase-Specific Tests
```bash
npx playwright test tests/e2e/phase1-ui.spec.js
npx playwright test tests/e2e/phase2-calculations.spec.js
npx playwright test tests/e2e/phase3-comparison.spec.js
npx playwright test tests/e2e/phase4-realtime.spec.js
npx playwright test tests/e2e/phase5-scenarios.spec.js
```

### Run Visual Tests Only
```bash
npx playwright test tests/visual/
```

### Generate HTML Report
```bash
npx playwright show-report test-results/html-report
```

### Capture All Screenshots
```bash
node tests/scripts/capture-all-screenshots.js
```

---

## Screenshot Organization

```
tests/screenshots/
├── phase1/
│   ├── 01-sidebar-full.png
│   ├── 02-category-monthly.png
│   ├── 03-expense-unchecked.png
│   ├── 04-impact-summary.png
│   ├── 05-preset-survival.png
│   └── 06-dark-theme.png
├── phase2/
│   ├── 01-forecast-table.png
│   ├── 02-calculation-accuracy.png
│   └── 03-parser-output.png
├── phase3/
│   ├── 01-comparison-cards.png
│   ├── 02-delta-badges.png
│   ├── 03-removed-expenses.png
│   └── 04-status-change.png
├── phase4/
│   ├── 01-before-toggle.png
│   ├── 02-after-toggle.png
│   ├── 03-baseline-chart.png
│   ├── 04-modified-chart.png
│   └── 05-interaction-trace.zip
└── phase5/
    ├── 01-save-dialog.png
    ├── 02-scenario-list.png
    ├── 03-loaded-scenario.png
    ├── 04-export-dialog.png
    └── 05-preset-applied.png
```

---

## Test Scripts

### `tests/scripts/run-all-tests.js`
```javascript
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Running ALL Playwright tests...\n');

const phases = [
  'phase1-ui',
  'phase2-calculations',
  'phase3-comparison',
  'phase4-realtime',
  'phase5-scenarios'
];

const results = {};

phases.forEach(phase => {
  console.log(`\n📋 Testing ${phase}...\n`);

  try {
    execSync(`npx playwright test tests/e2e/${phase}.spec.js --reporter=json`, {
      stdio: 'inherit'
    });
    results[phase] = 'PASS ✅';
  } catch (error) {
    results[phase] = 'FAIL ❌';
  }
});

console.log('\n\n📊 TEST SUMMARY:\n');
Object.entries(results).forEach(([phase, status]) => {
  console.log(`${phase}: ${status}`);
});

const allPassed = Object.values(results).every(r => r.includes('PASS'));
process.exit(allPassed ? 0 : 1);
```

### `tests/scripts/capture-all-screenshots.js`
```javascript
import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const dashboardPath = path.resolve('./forecasts/dashboard.html');
  await page.goto(`file://${dashboardPath}`);

  console.log('📸 Capturing screenshots...\n');

  // Phase 1: UI Screenshots
  await page.screenshot({
    path: 'tests/screenshots/phase1/01-sidebar-full.png',
    fullPage: true
  });

  await page.locator('.control-panel').screenshot({
    path: 'tests/screenshots/phase1/02-sidebar-closeup.png'
  });

  // Toggle dark theme
  await page.locator('#themeToggle').click();
  await page.screenshot({
    path: 'tests/screenshots/phase1/06-dark-theme.png',
    fullPage: true
  });

  console.log('✅ All screenshots captured!\n');

  await browser.close();
})();
```

---

## Gate Criteria (Per Phase)

### Before Proceeding to Next Phase:
1. ✅ All Playwright E2E tests: PASSING
2. ✅ All visual regression tests: PASSING
3. ✅ All screenshots captured and reviewed
4. ✅ HTML test report generated
5. ✅ No console errors in browser
6. ✅ Code committed to feature branch

---

## Reporting Format

After each phase, generate:

### 1. Test Report (`PHASE-X-TEST-REPORT.md`)
```markdown
# Phase X Test Report

## Summary
- Total Tests: 45
- Passed: 45
- Failed: 0
- Success Rate: 100%

## E2E Tests (30 passed)
✅ Test 1: Description
✅ Test 2: Description
...

## Visual Tests (15 passed)
✅ Screenshot 1: Description
✅ Screenshot 2: Description
...

## Screenshots
See: tests/screenshots/phaseX/
```

### 2. HTML Report (Playwright built-in)
```bash
npx playwright show-report
```
- Opens in browser with detailed test results
- Shows screenshots for failed tests
- Includes traces for debugging

---

## Success Metrics

### Per Phase:
- ✅ 100% test pass rate
- ✅ All screenshots captured
- ✅ No console errors
- ✅ HTML report generated
- ✅ User approval to proceed

### Overall Project:
- ✅ 150+ Playwright tests passing
- ✅ 50+ screenshots captured
- ✅ 5 comprehensive test reports
- ✅ All 5 phases complete

---

## Implementation Notes

### Playwright Advantages:
1. **Single tool** - E2E + Visual + Scripts
2. **Real browser** - Tests actual user experience
3. **Screenshots** - Automatic visual verification
4. **Traces** - Video replay of test execution
5. **Fast** - Parallel execution when needed
6. **Reliable** - Auto-waits, retries

### No Jest Needed:
- Playwright can test calculations directly
- Playwright can verify DOM structure
- Playwright can check function outputs
- Simpler setup, single dependency

---

## Execution Timeline

| Phase | Tests | Screenshots | Duration |
|-------|-------|-------------|----------|
| Phase 1 | 30 | 10 | ~2 mins |
| Phase 2 | 25 | 5 | ~3 mins |
| Phase 3 | 20 | 8 | ~2 mins |
| Phase 4 | 30 | 12 | ~4 mins |
| Phase 5 | 25 | 10 | ~3 mins |
| **Total** | **130** | **45** | **~14 mins** |

---

## ✅ APPROVED APPROACH

**Confirmed:** All testing done with Playwright
- E2E tests
- Visual regression tests
- Screenshot capture scripts
- Test reports
- Full automation

**Next Step:** Resume Phase 1 implementation using this testing strategy
