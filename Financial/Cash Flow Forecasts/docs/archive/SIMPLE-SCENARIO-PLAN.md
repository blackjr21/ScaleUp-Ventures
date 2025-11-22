# Simple Scenario Planner - KISS Version

**Goal:** Toggle expenses from cash-flow-data.md ON/OFF and see the impact.

---

## What You Get

A simple page where you can:
1. **See all your expenses** from cash-flow-data.md as a list with checkboxes
2. **Toggle them ON/OFF** by clicking checkboxes
3. **See the difference** - baseline balance vs modified balance
4. **Save your scenarios** - "Survival Mode", "Tight Month", etc.

---

## Implementation: 3 Simple Steps

### Step 1: Fix Navigation (5 min)

Update these 2 files to link to `scenario-planner.html`:

**File: `forecasts/index.html`**
- Line 195: Change `scenarios.html` → `scenario-planner.html`
- Line 228: Change `scenarios.html` → `scenario-planner.html`

**File: `forecasts/dashboard.html`**
- Line 465: Change `scenarios.html` → `scenario-planner.html`

### Step 2: Verify Data Sync (2 min)

Check that `scenario-planner.html` uses the same transaction data as cash-flow-data.md.

The expense list in scenario-planner.html (lines 152-204) should match your actual data.

### Step 3: Test It (3 min)

1. Open `scenario-planner.html`
2. Uncheck "Sleep Number ($434.58)"
3. See ending balance improve by ~$434
4. Click "Save Scenario" → Name it "No Sleep Number"
5. Click "Reset" → All checkboxes back on

---

## How It Works (Simple!)

```
Your Data (cash-flow-data.md)
    ↓
Hardcoded in scenario-planner.html as expenseData object
    ↓
User clicks checkbox
    ↓
JavaScript recalculates 42-day forecast WITHOUT that expense
    ↓
Shows you the new ending balance
```

---

## Current Expenses You Can Toggle

### Monthly Bills (33 items)
- Vitruvian Membership ($39)
- TRANSAMERICA Insurance ($245.65)
- Apple Card ($30)
- Supplements ($300)
- Payment Coordinator ($500)
- SYNCHRONY Bank Bill Payment ($58)
- SYNCHRONY Credit Card ($87)
- Bill Me Later ($125)
- Connell & Gelb ($500)
- LoanCare Mortgage ($3,566.24)
- Sleep Number ($434.58)
- HexClad Pots ($126)
- Duke Energy NC ($86)
- Ashley Venture ($67)
- Netflix ($25)
- AT&T ($52.50)
- SBA EIDL Loan ($315)
- Chaundra Williams ($270.29) - Day 15
- 2nd Mortgage ($1,540.69)
- NC529 College Savings ($50)
- Ashley QuickSilver ($126)
- C3 Baseball Training ($312)
- ALLSTATE Insurance ($243.84)
- Merry Maids ($175)
- pliability ($13.99)
- Loan (Feb 17, 2022) ($322.60)
- Loan (Mar 19, 2025) ($376.54)
- Vitruvian Equipment ($99.21)
- The Container Store ($144)
- Aven Card ($477)
- Sofi Loan ($1,042.78)
- MyFitnessPal ($19.99)
- Chaundra Williams ($270.29) - Day 30
- Club Pilates ($219)

### Biweekly Bills (7 items)
- MMI ($852)
- Charleston Management ($49)
- Buffalo Grove HOA ($51.28)
- Groceries ($500)
- Gas ($100)
- Eating Out ($250)
- Principal Loan ($198)

### Weekday Recurring (1 item)
- NFCU Volvo Loan ($33/day)

### Friday Allocations (3 items)
- Savings ($200)
- Tithe ($100)
- Debt Payoff ($1,000)

**Total: 44 toggleable items**

---

## Quick Scenarios

### Scenario 1: "Survival Mode"
Uncheck:
- Savings ($200/week)
- Tithe ($100/week)
- Debt Payoff ($1,000/week)
- Eating Out ($250 biweekly)
- Club Pilates ($219)
- MyFitnessPal ($19.99)
- pliability ($13.99)
- Netflix ($25)
- Supplements ($300)

**Savings: ~$2,900/month**

### Scenario 2: "Defer Sleep Number"
Uncheck:
- Sleep Number ($434.58)

**Savings: ~$435/month**

### Scenario 3: "Extreme Bare Bones"
Keep ONLY:
- LoanCare Mortgage
- 2nd Mortgage
- Duke Energy
- AT&T
- Groceries
- Gas
- NFCU Volvo

**Everything else OFF**

---

## File Locations

```
forecasts/
├── scenario-planner.html    # Main page - already exists!
└── js/
    ├── scenario-planner/
    │   ├── transaction-engine.js    # Does the math
    │   ├── scenario-manager.js      # Manages state
    │   └── comparison-calc.js       # Shows difference
    └── shared/
        └── constants.js             # Your expense data
```

---

## That's It!

No complex features. Just:
1. ✅ Turn expenses ON/OFF
2. ✅ See the difference
3. ✅ Save your favorite scenarios

**Total Implementation Time: 10 minutes**

---

## Next Step

Want me to:
1. Fix the navigation links now? (2 file updates)
2. Verify the expense data matches your cash-flow-data.md?
3. Both?

Just say "fix navigation" and I'll do it.
