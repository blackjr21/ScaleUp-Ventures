# Stylesheet Analysis: Dashboard vs Scenario Planner

**Date:** 2025-11-21
**Problem:** Scenario planner page doesn't match dashboard.html styling

---

## CRITICAL FINDING 🚨

**The scenario-planner.html page is MISSING ALL scenario-specific CSS styles!**

### What's Happening

1. **dashboard.html** ✅ - Uses `css/shared.css` and looks good
2. **scenario-planner.html** ❌ - Uses `css/shared.css` but is missing scenario-specific styles

### The Problem

`scenario-planner.html` references these CSS classes that DON'T EXIST in `shared.css`:

```html
<!-- From scenario-planner.html -->
<button class="show-panel-btn">          ❌ NOT IN shared.css
<aside class="control-panel">            ❌ NOT IN shared.css
<div class="panel-header">               ❌ NOT IN shared.css
<div class="panel-content">              ❌ NOT IN shared.css
<details class="expense-category">       ❌ NOT IN shared.css
<div class="expense-item">               ❌ NOT IN shared.css
<input class="expense-checkbox">         ❌ NOT IN shared.css
<div class="expense-details">            ❌ NOT IN shared.css
<span class="expense-schedule">          ❌ NOT IN shared.css
<span class="expense-amount">            ❌ NOT IN shared.css
<div class="impact-summary">             ✅ EXISTS in shared.css (but generic)
<div class="control-buttons">            ❌ NOT IN shared.css
<button class="control-btn">             ❌ NOT IN shared.css
<div class="comparison-grid">            ❌ NOT IN shared.css
<div class="comparison-section">         ❌ NOT IN shared.css
<div class="table-filters">              ❌ NOT IN shared.css
<button class="filter-btn">              ❌ NOT IN shared.css
<div class="table-container">            ❌ NOT IN shared.css
<div class="removed-expenses-list">      ❌ NOT IN shared.css
<div class="removed-expense-item">       ❌ NOT IN shared.css
<span class="delta-badge">               ❌ NOT IN shared.css
<span class="arrow-indicator">           ❌ NOT IN shared.css
```

---

## What's IN shared.css (692 lines total)

### ✅ Styles that EXIST and Work:

1. **Theme Variables** (lines 1-38)
   - CSS custom properties for colors
   - Dark theme support

2. **Base Styles** (lines 40-56)
   - Body, fonts, transitions

3. **Button Components** (lines 59-119)
   - `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`

4. **Card Components** (lines 121-147)
   - `.card`, `.card-header`, `.card-body`

5. **Form Elements** (lines 149-199)
   - Input, select, checkbox, textarea styles

6. **Badge Components** (lines 201-219)
   - `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`

7. **Alert Components** (lines 221-248)
   - `.alert-success`, `.alert-warning`, `.alert-danger`

8. **Navigation Bar** (lines 250-303)
   - `.top-nav` and related styles ✅

9. **Summary Card** (lines 305-375)
   - `.summary-card`, `.summary-card.critical`, `.summary-card.warning`, `.summary-card.safe`

10. **Impact Summary** (lines 377-432)
    - `.impact-summary`, `.impact-summary.better`, `.impact-summary.worse`
    - **Note:** This is GENERIC, not scenario-specific!

11. **Comparison Highlighting** (lines 434-480)
    - `.comparison-row.changed`, `.comparison-row.improved`, `.comparison-row.worse`

12. **Table Styles** (lines 489-537)
    - Generic table, thead, th, td styles ✅

13. **Utility Classes** (lines 539-660)
    - `.flex`, `.grid`, `.text-center`, margin/padding utilities

14. **Container** (lines 662-670)
    - `.container` ✅

15. **Scrollbar Styling** (lines 672-692)
    - Webkit scrollbar custom styles

---

## What's MISSING from shared.css

### ❌ Scenario Planner Specific Styles Needed:

```css
/* Control Panel Sidebar */
.show-panel-btn { ... }
.control-panel { ... }
.control-panel.collapsed { ... }
.panel-header { ... }
.panel-title { ... }
.toggle-panel-btn { ... }
.search-box { ... }
.panel-content { ... }

/* Expense Categories */
.expense-category { ... }
.expense-category summary { ... }
.category-toggle { ... }
.expense-list { ... }

/* Expense Items */
.expense-item { ... }
.expense-item.disabled { ... }
.expense-checkbox { ... }
.expense-details { ... }
.expense-name { ... }
.expense-schedule { ... }
.expense-amount { ... }

/* Impact Summary (Scenario-specific version) */
.impact-summary { ... }  /* More detailed than generic */
.impact-row { ... }
.impact-label { ... }
.impact-value { ... }
.removed-expenses-list { ... }
.removed-expense-item { ... }

/* Control Buttons */
.control-buttons { ... }
.control-btn { ... }
.control-btn.preset { ... }

/* Comparison Grid */
.main-content { ... }
.comparison-header { ... }
.comparison-title { ... }
.comparison-subtitle { ... }
.comparison-grid { ... }
.comparison-section { ... }
.comparison-section.baseline { ... }
.comparison-section.modified { ... }
.comparison-section-header { ... }
.modified-header { ... }

/* Table Filters */
.table-filters { ... }
.filter-btn { ... }
.filter-btn.active { ... }
.table-container { ... }

/* Delta/Arrow Indicators */
.delta-badge { ... }
.delta-positive { ... }
.delta-negative { ... }
.arrow-indicator { ... }

/* Amount Columns */
.amount-col { ... }
.amount-col.positive { ... }
.amount-col.negative { ... }

/* Flag Columns */
.flag-neg { ... }
.flag-low { ... }
```

---

## Comparison with Dashboard.html

### Dashboard.html Structure:
```html
<link rel="stylesheet" href="css/shared.css?v=3">  ✅
<style>
  /* Dashboard-specific inline styles */
  .container { ... }
  .page-header { ... }
  .summary-grid { ... }
  .summary-card { ... }
  .alerts-section { ... }
  .transactions-section { ... }
  .section-header { ... }
  .filter-buttons { ... }
  .filter-btn { ... }
  /* etc. - About 200 lines of dashboard-specific CSS */
</style>
```

**Dashboard works because:** It has BOTH shared.css AND inline `<style>` with dashboard-specific CSS!

### Scenario-planner.html Structure:
```html
<link rel="stylesheet" href="css/shared.css?v=3">  ✅
<!-- NO <style> tag! -->
<!-- NO inline styles! -->
<!-- NO scenario-specific CSS anywhere! -->
```

**Scenario planner broken because:** It ONLY has shared.css, which lacks ALL scenario-specific styles!

---

## Solution Options

### Option 1: Add Inline <style> to scenario-planner.html ⚡ FASTEST
**Pros:**
- Quick fix
- Matches dashboard.html pattern
- No file management needed

**Cons:**
- Code duplication
- Harder to maintain
- Not DRY (Don't Repeat Yourself)

**Implementation:**
Add a `<style>` tag after line 8 in scenario-planner.html with all scenario-specific CSS.

---

### Option 2: Create scenario-planner.css 🎯 RECOMMENDED
**Pros:**
- Clean separation of concerns
- Maintainable
- Reusable
- Follows best practices

**Cons:**
- Requires creating new file
- Need to update <link> tag

**Implementation:**
1. Create `/forecasts/css/scenario-planner.css`
2. Add all scenario-specific styles
3. Update scenario-planner.html line 7:
```html
<link rel="stylesheet" href="css/shared.css?v=3">
<link rel="stylesheet" href="css/scenario-planner.css?v=1">
```

---

### Option 3: Add to shared.css ❌ NOT RECOMMENDED
**Pros:**
- Single CSS file

**Cons:**
- Makes shared.css too specific
- Loads unnecessary CSS on other pages
- Violates separation of concerns

---

## Recommended Action Plan

### Phase 1: Extract Dashboard Inline Styles (Reference)
Dashboard.html has ~200 lines of inline CSS. We need similar for scenario planner.

### Phase 2: Create Scenario-Specific CSS
Create `/forecasts/css/scenario-planner.css` with:

1. **Layout Styles**
   - Control panel sidebar (fixed left, collapsible)
   - Main content area
   - Comparison grid (2-column)

2. **Control Panel Styles**
   - Panel header, search box
   - Expense categories (collapsible details)
   - Expense items (grid layout with checkbox)
   - Impact summary panel
   - Control buttons

3. **Comparison Table Styles**
   - Table filters
   - Side-by-side tables
   - Delta badges
   - Arrow indicators

4. **Responsive Styles**
   - Mobile: Stack comparison tables
   - Tablet: Adjust panel width
   - Desktop: Full layout

### Phase 3: Link New CSS
Update scenario-planner.html to include the new stylesheet.

---

## Estimated Size of Missing CSS

Based on dashboard.html having ~200 lines of specific CSS, scenario-planner needs approximately:

- **Control Panel**: ~80 lines
- **Expense Items**: ~60 lines
- **Comparison Grid**: ~40 lines
- **Table Filters**: ~30 lines
- **Delta/Badges**: ~20 lines
- **Responsive**: ~40 lines

**Total: ~270 lines of CSS needed**

---

## Next Steps

1. **Extract scenario-planner specific styles** from original implementation
2. **Create scenario-planner.css** with all required styles
3. **Link the new CSS** file in scenario-planner.html
4. **Test** the page matches dashboard quality
5. **Document** the new CSS architecture

---

## Questions to Clarify

1. **Do you have an original version of scenario-planner.html with working styles?**
   - If yes, we can extract the CSS from there
   - If no, we need to write the CSS from scratch

2. **Should we match dashboard.html exactly?**
   - Same color scheme?
   - Same spacing/sizing?
   - Same responsive breakpoints?

3. **Preferred solution?**
   - Option 1: Inline styles (fast, like dashboard.html)
   - Option 2: Separate CSS file (clean, maintainable)

---

**Status:** Analysis complete - Ready for implementation once approach is chosen
