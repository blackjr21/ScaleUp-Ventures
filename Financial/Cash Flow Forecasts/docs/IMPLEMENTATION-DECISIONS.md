# Interactive Scenario Planner - Final Implementation Decisions

**Version:** 1.0
**Date:** 2025-11-21
**Status:** Approved - Ready to Build
**Branch:** `feature/interactive-scenario-planner`

---

## ✅ Approved Decisions

### 1. Data Source Strategy
**Decision:** Auto-Parser (Option 2)

**Rationale:** Bills/expenses in `cash-flow-data.md` change frequently, so we need automatic synchronization.

**Implementation:**
- Build JavaScript parser that reads `data/cash-flow-data.md` on dashboard load
- Parse markdown structure into `TRANSACTION_RULES` object
- No manual updates required when data changes
- Estimated: 8 hours development time

---

### 2. UI Layout
**Decision:** Left Sidebar

**Implementation:**
- 350px fixed width sidebar on desktop
- Collapsible with toggle button
- Organized by expense categories (Monthly, Biweekly, Recurring, Friday)
- Desktop-only (no mobile optimization for v1)

---

### 3. Chart Display
**Decision:** Switch Button (Single Chart)

**Implementation:**
- One chart at a time
- Toggle button to switch between "Baseline Forecast" and "Modified Forecast"
- Clear labels showing which view is active
- Option to add overlay mode in future if needed

---

### 4. Implementation Scope
**Decision:** All 5 Phases

**Phases to Complete:**
1. ✅ Phase 1: Design and build expense control panel UI
2. ✅ Phase 2: Build client-side forecast calculation engine (with parser)
3. ✅ Phase 3: Create comparison view (baseline vs modified)
4. ✅ Phase 4: Implement real-time chart and table updates
5. ✅ Phase 5: Add save/load scenario functionality (localStorage)

**Estimated Timeline:** 3-4 weeks

---

### 5. Mobile Experience
**Decision:** Desktop-Only for v1

**Implementation:**
- No mobile-specific optimizations
- Focus on desktop Chrome experience
- Mobile support can be added in v2 if needed

---

### 6. Git Strategy
**Decision:** New Feature Branch

**Implementation:**
- Branch name: `feature/interactive-scenario-planner`
- Work in isolation from main
- Commit after each phase completion
- Merge to main after final approval

---

### 7. Testing Priority
**Decision:** Unit → E2E → Visual Regression

**Testing Workflow:**
1. **Unit Tests** - Run after each phase to verify calculations
2. **E2E Tests** - Run after Phase 4 to verify user workflows
3. **Visual Regression** - Run after Phase 5 for final UI validation

**Tools:**
- Jest for unit/integration tests
- Playwright for E2E tests
- Playwright snapshots for visual regression

---

### 8. Agent Integration
**Decision:** Use Existing Agents

**Implementation:**
- Agents (forecast-calculator, dashboard-updater, etc.) remain unchanged
- New scenario planner works alongside existing forecast workflow
- Agents set the baseline, scenario planner explores variations

---

### 9. Browser Support
**Decision:** Chrome Desktop Only

**Implementation:**
- Primary target: Latest Chrome on macOS/Windows
- Standard ES6+ JavaScript (no transpilation needed for Chrome)
- Use modern CSS features (Grid, Flexbox, Custom Properties)

---

### 10. Development Approach
**Decision:** Phase-by-Phase Reviews

**Workflow:**
1. Complete a phase
2. Run unit tests to verify it works
3. Commit to feature branch
4. Show progress to user
5. Get feedback
6. Incorporate feedback
7. Move to next phase

**Checkpoints:**
- ✅ After Phase 1: Review UI design and layout
- ✅ After Phase 2: Verify calculation accuracy matches agents
- ✅ After Phase 3: Review comparison view presentation
- ✅ After Phase 4: Test real-time interactivity
- ✅ After Phase 5: Full end-to-end testing

---

## 📋 Testing Requirements

### After Each Phase
- Run relevant unit tests
- Verify functionality in Chrome
- Screenshot key features
- Commit working code to feature branch

### Before Phase Completion
- All unit tests passing
- No console errors
- Code commented and clean
- Ready for user review

---

## 🎯 Success Criteria

### Phase 1 Success
- [ ] Expense control panel renders correctly
- [ ] All expenses from `cash-flow-data.md` appear as checkboxes
- [ ] Grouped by category (Monthly, Biweekly, Recurring, Friday)
- [ ] Checkboxes are interactive (can check/uncheck)

### Phase 2 Success
- [ ] Parser successfully reads `cash-flow-data.md`
- [ ] `TransactionRuleEngine` calculates forecast matching agent output
- [ ] Unit tests pass with 95%+ accuracy
- [ ] Biweekly, monthly, weekday logic works correctly

### Phase 3 Success
- [ ] Comparison cards show before/after metrics
- [ ] Delta badges display improvement/decline correctly
- [ ] Removed expenses list shows what was toggled off
- [ ] Visual indicators (green/red) work properly

### Phase 4 Success
- [ ] Toggling expenses triggers recalculation (<500ms)
- [ ] Chart switches between baseline/modified views
- [ ] Transaction table updates with new balances
- [ ] Debouncing prevents excessive recalculation
- [ ] No UI lag or freezing

### Phase 5 Success
- [ ] Can save scenarios to localStorage
- [ ] Can load saved scenarios
- [ ] Can delete scenarios
- [ ] Preset scenarios work (Survival Mode, Aggressive, etc.)
- [ ] Export/import functionality works

---

## 🚀 Implementation Timeline

| Phase | Description | Duration | Deliverable |
|-------|-------------|----------|-------------|
| Phase 1 | Expense Control Panel UI | 2-3 days | Working sidebar with checkboxes |
| Phase 2 | Calculation Engine + Parser | 3-4 days | Accurate forecast calculations |
| Phase 3 | Comparison View | 2-3 days | Before/after metrics display |
| Phase 4 | Real-Time Updates | 2-3 days | Interactive scenario exploration |
| Phase 5 | Scenario Management | 2-3 days | Save/load/preset functionality |
| **Total** | | **11-16 days** | **Fully functional scenario planner** |

---

## 📝 Notes

### Parser Implementation Notes
- Parse markdown sections: Monthly Bills, Biweekly Bills, Recurring (Mon-Fri), Friday Allocations
- Extract: expense name, amount, day/anchor date, category
- Handle edge cases: Day 31 bills, anchor dates before forecast start
- Validate data structure before using in calculations

### Chart Switch Implementation
- Default view: Modified Forecast (what user sees with current toggles)
- Switch button: "Show Baseline" / "Show Modified"
- Active view clearly labeled
- Smooth transition when switching

### Testing Notes
- Create test fixture from latest agent forecast: `tests/fixtures/agent-forecast-2025-11-20.json`
- Compare JavaScript engine output against agent output line-by-line
- Tolerance: ±$0.01 for rounding differences
- Flag any discrepancies for investigation

---

## ✅ Ready to Build

All decisions approved. Implementation starts now on branch `feature/interactive-scenario-planner`.

**Next Step:** Begin Phase 1 - Design and build expense control panel UI
