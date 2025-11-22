# Interactive Scenario Planner - Decision Checklist

**Version:** 1.0
**Date:** 2025-11-21
**Status:** Awaiting User Decisions

---

## Questions You Need to Answer Before We Start

Please review these questions and provide your preferences. Once answered, implementation can begin immediately.

---

### 1. Data Source Strategy

**Question:** How should transaction rules from `cash-flow-data.md` be converted to JavaScript?

**Option A: Manual Conversion (Recommended for MVP)**
- ✅ Fast to implement (~2 hours)
- ✅ Works immediately
- ✅ Full control over data structure
- ❌ Requires manual sync if `cash-flow-data.md` changes
- ❌ One-time maintenance burden

**Option B: Auto-Parser**
- ✅ Reads markdown dynamically
- ✅ Stays in sync automatically
- ❌ More complex (~8 hours to implement)
- ❌ Requires parsing logic that could break with format changes
- ❌ Harder to debug

**My Recommendation:** Option A for initial release, Option B for v2 if needed

**Your Decision:**
[ ] Option A - Manual conversion
[ ] Option B - Auto-parser
[ ] Other (please specify): _________________

---

### 2. UI Layout Preference

**Question:** Where should the expense control panel be located?

**Option A: Left Sidebar (Recommended)**
- ✅ Desktop: 350px fixed width, collapsible
- ✅ Mobile: Converts to bottom sheet
- ✅ Keeps chart/table visible while toggling expenses
- ✅ Standard pattern for control panels

**Option B: Top Panel**
- ✅ Full-width accordion
- ✅ Familiar pattern for filters
- ❌ Pushes content down when expanded
- ❌ Less efficient use of horizontal space

**Option C: Right Sidebar**
- ✅ Alternative to left sidebar
- ❌ Less conventional for controls
- ❌ May conflict with future features on right

**My Recommendation:** Option A (left sidebar on desktop, bottom sheet on mobile)

**Your Decision:**
[ ] Option A - Left sidebar
[ ] Option B - Top panel
[ ] Option C - Right sidebar
[ ] Other (please specify): _________________

---

### 3. Chart Comparison Display

**Question:** How should baseline vs modified forecasts be displayed on the chart?

**Option A: Overlay with Toggle (Recommended)**
- ✅ Both lines on same chart (blue baseline, green modified)
- ✅ Toggle button to show/hide baseline line
- ✅ Easy to see impact at a glance
- ✅ Single chart = less complexity

**Option B: Side-by-Side Split View**
- ✅ Two separate charts (left baseline, right modified)
- ✅ Synchronized zoom/pan
- ❌ Takes more screen space
- ❌ Harder to compare exact values

**Option C: Single Chart with Switch Button**
- ✅ One chart at a time, button to switch between them
- ❌ Can't see both simultaneously
- ❌ Requires more clicks to compare

**My Recommendation:** Option A (overlay with toggle)

**Your Decision:**
[ ] Option A - Overlay with toggle
[ ] Option B - Side-by-side split view
[ ] Option C - Single chart with switch
[ ] Other (please specify): _________________

---

### 4. Implementation Scope

**Question:** Which phases should be included in the first release?

**Option A: Phases 1-4 Only (Recommended MVP)**
- Core functionality: expense toggles + live recalculation + comparison view
- No scenario saving (localStorage)
- Estimated: 2-3 weeks
- User can test and provide feedback quickly

**Option B: All 5 Phases (Full Feature Set)**
- Everything including scenario saving/loading
- Estimated: 3-4 weeks
- More features but longer before user testing

**Option C: Phases 1-3 Only (Minimal)**
- Basic toggles + comparison, no real-time updates
- Estimated: 1-2 weeks
- Fastest to market but limited interactivity

**My Recommendation:** Option A (Phases 1-4 for MVP, add Phase 5 after user testing)

**Your Decision:**
[ ] Option A - Phases 1-4 (Core functionality)
[ ] Option B - All 5 phases (Full features)
[ ] Option C - Phases 1-3 (Minimal)
[ ] Other (please specify): _________________

---

### 5. Mobile Experience

**Question:** How should mobile users interact with the expense control panel?

**Option A: Bottom Sheet (Recommended)**
- ✅ Slides up from bottom, covers ~60% of screen
- ✅ Common mobile pattern (like Google Maps)
- ✅ Swipe down to dismiss
- ✅ Doesn't navigate away from dashboard

**Option B: Separate Page/View**
- ✅ Full screen for expense controls
- ❌ Lose visibility of chart/table while toggling
- ❌ More navigation (back/forward)

**Option C: Accordion Inline**
- ✅ Expand/collapse within same page
- ❌ Pushes content down significantly
- ❌ Awkward scrolling on small screens

**My Recommendation:** Option A (bottom sheet for mobile)

**Your Decision:**
[ ] Option A - Bottom sheet
[ ] Option B - Separate page
[ ] Option C - Accordion inline
[ ] Other (please specify): _________________

---

### 6. Folder Structure

**Question:** Should we create a new "v2" folder or enhance the existing one?

**Option A: Enhance Existing Folder (Recommended)**
- ✅ All agents continue working
- ✅ No data duplication
- ✅ Maintains git history
- ✅ Feature flag to toggle new features on/off
- ✅ Easier to manage long-term

**Option B: Create "Cash Flow Forecasts v2" Folder**
- ✅ Clear separation during development
- ✅ Easy rollback if issues arise
- ❌ Need to update all agent file paths
- ❌ Data sync issues between v1/v2
- ❌ Confusing to maintain two versions

**My Recommendation:** Option A (enhance existing with feature flag)

**Your Decision:**
[ ] Option A - Enhance existing folder
[ ] Option B - Create separate v2 folder
[ ] Other (please specify): _________________

---

### 7. Testing Priority

**Question:** Which testing levels are most important to you?

**Rank these in order (1 = highest priority, 3 = lowest priority):**

[ ] Unit tests (Jest) - Verify calculation accuracy
[ ] E2E tests (Playwright) - Test full user workflows
[ ] Visual regression tests - Ensure UI looks correct

**My Recommendation:**
1. Unit tests (calculation accuracy is critical)
2. E2E tests (verify user workflows work)
3. Visual regression (nice-to-have but can do manual QA)

**Your Priority Order:**
1. _________________
2. _________________
3. _________________

---

### 8. Agent Integration

**Question:** Should we generate a fresh forecast from agents before starting development?

**Option A: Use Existing Forecast (2025-11-20)**
- ✅ Start coding immediately
- ✅ Use existing `forecast-2025-11-20.md` as baseline
- ❌ May be slightly outdated

**Option B: Generate Fresh Forecast First**
- ✅ Most current data
- ✅ Test agents are still working
- ⏱️ Adds 10-15 minutes to start time

**My Recommendation:** Option A (use existing) to move faster

**Your Decision:**
[ ] Option A - Use existing forecast
[ ] Option B - Generate fresh forecast first
[ ] Other (please specify): _________________

---

### 9. Browser Support

**Question:** Which browsers must be supported?

**Check all that apply:**

[ ] Chrome/Edge (Chromium) - Desktop
[ ] Firefox - Desktop
[ ] Safari - Desktop
[ ] Mobile Chrome (Android)
[ ] Mobile Safari (iOS)
[ ] Other: _________________

**My Recommendation:** All of the above (standard modern browser support)

**Your Requirements:**
_________________

---

### 10. Development Approach

**Question:** How do you want to review progress?

**Option A: Incremental Reviews**
- Show you working features as each phase completes
- Get feedback and adjust along the way
- More touchpoints but better alignment

**Option B: Complete Then Review**
- Build all agreed phases, then show final result
- Fewer interruptions
- Risk of needing more changes at end

**Option C: Daily Check-ins**
- Brief daily status updates
- Show screenshots/videos of progress
- Highest visibility but most time-intensive

**My Recommendation:** Option A (incremental reviews after each phase)

**Your Preference:**
[ ] Option A - Incremental reviews
[ ] Option B - Complete then review
[ ] Option C - Daily check-ins
[ ] Other (please specify): _________________

---

## Summary of Recommendations

Based on best practices and your stated goals, here are my recommended choices:

1. **Data Source:** Manual conversion (Option A)
2. **UI Layout:** Left sidebar (Option A)
3. **Chart Display:** Overlay with toggle (Option A)
4. **Scope:** Phases 1-4 MVP (Option A)
5. **Mobile:** Bottom sheet (Option A)
6. **Folder:** Enhance existing (Option A)
7. **Testing:** Unit → E2E → Visual regression
8. **Agent:** Use existing forecast (Option A)
9. **Browsers:** All modern browsers
10. **Reviews:** Incremental after each phase (Option A)

**If you agree with all recommendations above, simply reply "use all recommendations" and we'll start immediately!**

---

## Next Steps

Once you've answered these questions:

1. I'll update the plan document with your decisions
2. I'll create a detailed implementation timeline
3. We'll start with Phase 1 (UI design)
4. You'll review after each phase and provide feedback

**Estimated timeline with recommended options:** 2-3 weeks total

---

## Questions or Concerns?

If anything is unclear or you have other preferences not listed here, let me know and I'll provide additional options or clarification.

Ready to start? Just answer the questions above and we're off to the races! 🚀
