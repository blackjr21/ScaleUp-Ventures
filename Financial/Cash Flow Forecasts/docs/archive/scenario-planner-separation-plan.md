# Scenario Planner Separation Plan

**Date:** 2025-11-21
**Status:** Planning Complete - Ready for Implementation
**Complexity:** Low (page already exists, just needs navigation fixes)

---

## Executive Summary

The scenario planner is **already implemented as a separate page** (`scenario-planner.html`). However, there are **navigation inconsistencies** across the site that need to be fixed. Some pages link to `scenario-planner.html` while others link to `scenarios.html` (which doesn't exist).

**Key Finding:** The scenario planner page exists and is fully functional. We just need to:
1. Standardize navigation links across all pages
2. Verify the page works correctly
3. Document the final architecture

---

## Current State Analysis

### Existing Files

```
forecasts/
├── index.html                  # Landing page
├── dashboard.html              # Main dashboard with nav
├── dashboard-only.html         # Dashboard without some features
└── scenario-planner.html       # ✅ Already exists as separate page!
```

### Navigation Inconsistencies Found

| File | Navigation Links | Issue |
|------|-----------------|-------|
| `index.html` | Links to `scenarios.html` | ❌ Wrong filename |
| `dashboard.html` | Links to `scenarios.html` | ❌ Wrong filename |
| `dashboard-only.html` | Links to `scenario-planner.html` | ✅ Correct |
| `scenario-planner.html` | Links to `scenario-planner.html` | ✅ Correct |

### JavaScript Dependencies (scenario-planner.html)

**Current modules loaded (lines 138-147):**
```html
<!-- Shared modules -->
<script src="js/shared/constants.js"></script>
<script src="js/shared/theme-manager.js"></script>
<script src="js/shared/data-loader.js"></script>

<!-- Scenario planner modules -->
<script src="js/scenario-planner/transaction-rules.js"></script>
<script src="js/scenario-planner/transaction-engine.js"></script>
<script src="js/scenario-planner/comparison-calc.js"></script>
<script src="js/scenario-planner/scenario-manager.js"></script>
<script src="js/scenario-planner/scenario-storage.js"></script>
```

✅ **All required modules are already loaded correctly**

---

## Implementation Plan

### Phase 1: Fix Navigation Links ⚡ (15 minutes)

#### Task 1.1: Update index.html Navigation
**File:** `forecasts/index.html`

**Line 195:** Change from:
```html
<li><a href="scenarios.html">Scenario Planner</a></li>
```
To:
```html
<li><a href="scenario-planner.html">Scenario Planner</a></li>
```

**Line 228:** Change from:
```html
<a href="scenarios.html" class="page-card">
```
To:
```html
<a href="scenario-planner.html" class="page-card">
```

---

#### Task 1.2: Update dashboard.html Navigation
**File:** `forecasts/dashboard.html`

**Line 465:** Change from:
```html
<li><a href="scenarios.html">Scenario Planner</a></li>
```
To:
```html
<li><a href="scenario-planner.html">Scenario Planner</a></li>
```

---

### Phase 2: Verification & Testing ⚡ (10 minutes)

#### Task 2.1: Verify All Navigation Links
Test each page's navigation menu:

1. **index.html** → Click "Scenario Planner" → Should open `scenario-planner.html`
2. **dashboard.html** → Click "Scenario Planner" → Should open `scenario-planner.html`
3. **dashboard-only.html** → Click "Scenario Planner" → Should open `scenario-planner.html`
4. **scenario-planner.html** → Click "Home" → Should return to `index.html`

#### Task 2.2: Test Scenario Planner Functionality
On `scenario-planner.html`, verify:

- ✅ Control panel sidebar appears
- ✅ All 34 expenses load with checkboxes
- ✅ Search box filters expenses
- ✅ Toggling expenses recalculates forecast
- ✅ Baseline vs Modified tables populate
- ✅ Impact summary updates in real-time
- ✅ "Survival Mode" preset works
- ✅ "Aggressive Paydown" preset works
- ✅ "Save Scenario" prompts for name and saves to localStorage
- ✅ "Reset to Baseline" re-enables all expenses
- ✅ Theme toggle (dark/light) works
- ✅ Panel collapse/expand works

---

### Phase 3: Documentation Update ⚡ (10 minutes)

#### Task 3.1: Update README.md
Add section documenting the page structure:

```markdown
## Page Structure

The cash flow forecasting system consists of 4 main pages:

1. **index.html** - Landing page with navigation and feature overview
2. **dashboard.html** - Main forecast dashboard with 42-day projection
3. **dashboard-only.html** - Simplified dashboard view
4. **scenario-planner.html** - Interactive "what-if" scenario builder

### Navigation Flow

```
index.html (Home)
    ├── dashboard.html (View current forecast)
    ├── scenario-planner.html (Explore scenarios)
    └── [External] Debt Strategy page
```

All pages share:
- Consistent top navigation bar
- Dark/light theme toggle
- Responsive design
- Shared CSS and JavaScript modules
```

---

## Technical Architecture

### Scenario Planner Page Structure

```html
scenario-planner.html
    ├── <nav> Top navigation (Home, Dashboard, Scenario Planner)
    ├── <button> Show/Hide Panel toggle
    ├── <aside> Control Panel (collapsible sidebar)
    │   ├── Panel Header (title + collapse button)
    │   ├── Search Box (filter expenses)
    │   ├── Panel Content (expense categories)
    │   │   ├── Monthly Bills (33 items)
    │   │   ├── Biweekly Bills (7 items)
    │   │   ├── Weekday Recurring (1 item)
    │   │   └── Friday Allocations (3 items)
    │   ├── Impact Summary
    │   │   ├── Expenses Removed
    │   │   ├── Ending Balance (Before → After)
    │   │   ├── Status Change
    │   │   └── Removed Expenses List
    │   └── Control Buttons
    │       ├── Reset to Baseline
    │       ├── Save Scenario
    │       ├── Survival Mode (preset)
    │       └── Aggressive Paydown (preset)
    └── <div.main-content> Comparison Tables
        ├── Header (theme toggle + title)
        ├── Baseline Forecast Table
        │   ├── Filters (All Days, Negative, Low Balance)
        │   └── Daily transactions with balances
        └── Modified Forecast Table
            ├── Filters (All Days, Negative, Low Balance)
            └── Daily transactions with balances
```

### Data Flow

```
User toggles expense checkbox
    ↓
ScenarioManager.toggleExpense(id, enabled)
    ↓
disabledExpenses Set updated
    ↓
recalculateDebounced() [300ms delay]
    ↓
TransactionRuleEngine.calculateDailyForecast(disabledExpenses)
    ↓
modifiedForecast array generated
    ↓
notifyListeners() triggers UI updates
    ↓
├── updateImpactSummary()
│   └── ComparisonCalculator computes deltas
└── renderTables()
    ├── renderTable('baseline', baselineForecast)
    └── renderTable('modified', modifiedForecast)
```

### JavaScript Modules

```
js/
├── shared/                     # Shared across all pages
│   ├── constants.js            # TRANSACTION_RULES data
│   ├── theme-manager.js        # Dark/light theme persistence
│   └── data-loader.js          # JSON data loading utilities
│
├── scenario-planner/           # Scenario-specific modules
│   ├── transaction-rules.js    # Transaction rule definitions
│   ├── transaction-engine.js   # TransactionRuleEngine class
│   ├── comparison-calc.js      # ComparisonCalculator class
│   ├── scenario-manager.js     # ScenarioManager class (observer pattern)
│   └── scenario-storage.js     # ScenarioStorage class (localStorage)
│
└── ux-helpers.js               # UX enhancements (tooltips, etc.)
```

---

## Key Features of Scenario Planner

### 1. Expense Control Panel
- **34 total expenses** organized into 4 categories
- **Search functionality** to quickly find specific expenses
- **Collapsible categories** for better organization
- **Visual feedback** - Disabled expenses appear grayed out

### 2. Real-Time Calculation
- **Debounced recalculation** (300ms) prevents excessive processing
- **Accurate biweekly math** using modulo-14 anchor date calculations
- **Complex rule handling**:
  - Monthly bills (specific day of month)
  - Biweekly bills (anchor date + 14-day intervals)
  - Weekday recurring (Mon-Fri only)
  - Friday allocations (every Friday)

### 3. Side-by-Side Comparison
- **Baseline table** - Shows original forecast with all expenses
- **Modified table** - Shows adjusted forecast with toggled expenses
- **Synchronized filtering** - Both tables have independent filters
- **Visual indicators**:
  - Green for credits
  - Red for debits
  - Highlighted rows for NEG/LOW flags

### 4. Impact Summary
- **Total Removed** - Sum of all disabled expenses
- **Ending Balance Change** - Before → After with delta badge
- **Status Transition** - NEGATIVE → HEALTHY, etc.
- **Removed Expense List** - Sorted by amount (highest first)

### 5. Preset Scenarios
**Survival Mode:**
Removes: savings, tithe, debt-payoff, eating-out, club-pilates, myfitnesspal, pliability, netflix, supplements

**Aggressive Paydown:**
Keeps only: loancare-mortgage, 2nd-mortgage, duke-energy, att, groceries, gas, nfcu-volvo, debt-payoff

### 6. Scenario Persistence
- **Save custom scenarios** to localStorage with user-defined names
- **Load saved scenarios** to quickly apply past configurations
- **Scenario metadata** includes:
  - Total removed amount
  - Ending balance
  - Delta improvement
  - Count of disabled expenses

---

## Testing Checklist

### Navigation Testing
- [ ] index.html → Scenario Planner link works
- [ ] dashboard.html → Scenario Planner link works
- [ ] dashboard-only.html → Scenario Planner link works
- [ ] scenario-planner.html → Home link returns to index
- [ ] All pages have consistent navigation structure

### Scenario Planner Functionality
- [ ] Control panel loads with all 34 expenses
- [ ] Search box filters expenses correctly
- [ ] Category collapse/expand works
- [ ] Checkbox toggles update UI instantly
- [ ] Baseline table populates with all 42 days
- [ ] Modified table updates when expenses toggled
- [ ] Impact summary calculates correctly
- [ ] Filters work (All Days, Negative, Low Balance)
- [ ] "Survival Mode" removes correct expenses
- [ ] "Aggressive Paydown" keeps only essentials
- [ ] "Reset to Baseline" re-enables all expenses
- [ ] "Save Scenario" prompts and saves to localStorage
- [ ] Theme toggle persists across page reloads
- [ ] Panel collapse/expand button works
- [ ] Show Panel button appears when collapsed

### Performance Testing
- [ ] Toggling expenses feels responsive (300ms debounce)
- [ ] No lag when searching expenses
- [ ] Tables render smoothly with 42 rows
- [ ] Theme switching is instant

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## Success Criteria

✅ All pages link to `scenario-planner.html` (no more `scenarios.html` references)
✅ Navigation is consistent across all 4 HTML pages
✅ Scenario planner loads and functions correctly as standalone page
✅ All 6 core features work (control panel, calculation, comparison, impact, presets, storage)
✅ Documentation updated to reflect page structure

---

## Rollback Plan

If issues arise, the changes are minimal (just navigation links), so rollback is simple:

1. Revert navigation link changes in `index.html` and `dashboard.html`
2. No JavaScript or CSS changes required
3. No data loss risk (localStorage persists independently)

---

## Future Enhancements (Out of Scope)

These are **not** part of this plan but could be considered later:

1. **Scenario Comparison View** - Side-by-side view of multiple saved scenarios
2. **Export Scenarios** - Download scenario data as JSON
3. **Scenario Templates** - Pre-built scenarios beyond Survival/Aggressive
4. **Visual Charts** - Balance projection chart for modified forecast
5. **Expense Categories Management** - Allow users to create custom categories
6. **Mobile Optimization** - Improved mobile UX for control panel
7. **Undo/Redo** - History tracking for expense toggles
8. **Sharing** - Generate shareable links for scenarios

---

## Estimated Time

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Fix navigation links | 15 min |
| Phase 2 | Verification & testing | 10 min |
| Phase 3 | Documentation update | 10 min |
| **Total** | | **35 minutes** |

---

## Notes

- The scenario planner page is **already fully implemented** and functional
- The only issue is **inconsistent navigation links** pointing to the wrong filename
- No JavaScript or CSS changes required
- No database or data migration needed
- Minimal risk, quick fix

---

## Implementation Status

- [x] Analysis complete
- [ ] Navigation links updated
- [ ] Testing complete
- [ ] Documentation updated
- [ ] Deployment ready

---

**Last Updated:** 2025-11-21
