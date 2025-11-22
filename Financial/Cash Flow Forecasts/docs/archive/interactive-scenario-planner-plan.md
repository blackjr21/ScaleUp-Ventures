# Interactive Cash Flow Scenario Planner - Implementation Plan

**Version:** 1.0
**Date:** 2025-11-21
**Status:** Planning Phase

---

## Executive Summary

Transform the cash flow dashboard from a static forecast viewer into an interactive "what-if" analysis tool where users can toggle expenses on/off and see real-time impact on cash flow projections.

### Problem Statement

Current dashboard shows a read-only forecast based on static transaction data. Users cannot interactively explore scenarios like:
- "What if I pause Savings + Tithe + Debt Payoff?"
- "What happens if I defer Sleep Number payment?"
- "Can I eliminate negative days by removing specific expenses?"

Users must manually edit `data/cash-flow-data.md` → re-run forecast agent → review new results (slow, cumbersome).

### Solution Overview

Build an interactive expense control panel with checkboxes for each transaction type. When users toggle expenses, the dashboard recalculates and displays the impact in real-time using client-side JavaScript.

### Key Features

1. **Interactive expense toggles** - Checkboxes for all monthly, biweekly, recurring, and Friday allocation expenses
2. **Live recalculation** - Instant balance updates when toggling expenses
3. **Side-by-side comparison** - Shows baseline vs modified forecast with delta metrics
4. **Visual impact indicators** - Green/red highlights, trend arrows, improvement badges
5. **Scenario management** - Save, load, and compare different expense combinations

---

## Phase 1: Design Interactive Expense Control Panel UI

### Objective
Create a collapsible sidebar with organized expense checkboxes grouped by category.

### UI Components

#### 1. Expense Categories Section

```
┌─ MONTHLY BILLS ────────────────────────────────┐
│ ☑ LoanCare Mortgage ($3,566.24) - Day 5       │
│ ☑ Sleep Number ($434.58) - Day 7              │
│ ☑ 2nd Mortgage ($1,540.69) - Day 15           │
│ ☑ Sofi Loan ($1,042.78) - Day 27              │
│ ☑ Aven Card ($477.00) - Day 27                │
│ ☑ MMI ($852.00) - Biweekly anchor: 2025-08-08 │
│ ... (all monthly bills)                        │
│ [Collapse/Expand]                              │
└────────────────────────────────────────────────┘

┌─ BIWEEKLY BILLS ───────────────────────────────┐
│ ☑ MMI ($852) - Anchor: 2025-08-08             │
│ ☑ Groceries ($500) - Anchor: 2025-11-28       │
│ ☑ Gas ($100) - Anchor: 2025-11-28             │
│ ☑ Eating Out ($250) - Anchor: 2025-11-28      │
│ ☑ Principal Loan ($198) - Anchor: 2025-11-14  │
│ ☑ Charleston Management ($49) - Anchor: 2025-04-24 │
│ ☑ Buffalo Grove HOA ($51.28) - Anchor: 2025-09-05 │
│ [Collapse/Expand]                              │
└────────────────────────────────────────────────┘

┌─ RECURRING (Mon-Fri) ──────────────────────────┐
│ ☑ NFCU Volvo Loan ($33/day)                   │
└────────────────────────────────────────────────┘

┌─ FRIDAY ALLOCATIONS ───────────────────────────┐
│ ☑ Savings ($200)                               │
│ ☑ Tithe ($100)                                 │
│ ☑ Debt Payoff ($1,000)                         │
└────────────────────────────────────────────────┘
```

#### 2. Control Buttons

```html
<div class="scenario-controls">
  <button id="resetToBaseline">🔄 Reset to Baseline</button>
  <button id="toggleComparison">📊 Show Impact Summary</button>
  <button id="saveScenario">💾 Save Scenario</button>
</div>
```

#### 3. Impact Summary Card

```
┌─ SCENARIO IMPACT ──────────────────────────────┐
│ Total Expenses Removed: $8,234.00             │
│                                                │
│ Ending Balance:                                │
│   Baseline:  $-9,817.43 ❌                     │
│   Modified:  $6,651.57 ✅                      │
│   Change:    +$16,469.00 improvement           │
│                                                │
│ Negative Days:                                 │
│   Baseline:  38 days                           │
│   Modified:  0 days                            │
│   Change:    All negative days eliminated ✅   │
│                                                │
│ Status: ⚠️ NEGATIVE → ✅ POSITIVE               │
└────────────────────────────────────────────────┘
```

### Design Decisions

**Placement:** Left sidebar (300px width, collapsible on mobile)

**Visual States:**
- Checked: Normal appearance with colored checkbox
- Unchecked: Strikethrough text + faded opacity (40%)
- Hover: Highlight with border glow

**Grouping:** Match structure of `data/cash-flow-data.md` sections:
1. Monthly Bills (by day of month)
2. Biweekly Bills (with anchor dates)
3. Weekday Recurring (Mon-Fri)
4. Friday Allocations

**Search/Filter:** Quick filter input box at top to search by expense name

**Bulk Actions:**
- "Select All" / "Deselect All" per category
- Quick presets: "Survival Mode", "Aggressive Paydown", "Pause Savings"

### HTML Structure

```html
<div id="expenseControlPanel" class="control-panel">
  <div class="panel-header">
    <h2>Scenario Builder</h2>
    <button id="togglePanel" aria-label="Toggle panel">◀</button>
  </div>

  <div class="panel-controls">
    <input type="text" id="expenseSearch" placeholder="Search expenses...">
    <div class="quick-actions">
      <button class="preset-btn" data-preset="survival">Survival Mode</button>
      <button class="preset-btn" data-preset="aggressive">Aggressive Paydown</button>
    </div>
  </div>

  <div class="expense-categories">
    <details class="expense-category" open>
      <summary>Monthly Bills (22 items)</summary>
      <div class="expense-list">
        <label class="expense-item">
          <input type="checkbox"
                 class="expense-checkbox"
                 data-expense-id="loancare-mortgage"
                 data-category="monthly"
                 checked>
          <span class="expense-name">LoanCare Mortgage</span>
          <span class="expense-amount">$3,566.24</span>
          <span class="expense-schedule">Day 5</span>
        </label>
        <!-- Repeat for all monthly bills -->
      </div>
    </details>

    <details class="expense-category" open>
      <summary>Biweekly Bills (7 items)</summary>
      <div class="expense-list">
        <!-- Biweekly expense checkboxes -->
      </div>
    </details>

    <details class="expense-category" open>
      <summary>Recurring (Mon-Fri) (1 item)</summary>
      <div class="expense-list">
        <!-- Weekday recurring checkboxes -->
      </div>
    </details>

    <details class="expense-category" open>
      <summary>Friday Allocations (3 items)</summary>
      <div class="expense-list">
        <!-- Friday allocation checkboxes -->
      </div>
    </details>
  </div>

  <div class="impact-summary" id="impactSummary">
    <!-- Dynamically populated impact metrics -->
  </div>

  <div class="panel-footer">
    <button id="resetToBaseline">Reset to Baseline</button>
    <button id="saveScenario">Save Scenario</button>
  </div>
</div>
```

### CSS Styling Requirements

```css
.control-panel {
  position: fixed;
  left: 0;
  top: 80px; /* Below header */
  width: 350px;
  height: calc(100vh - 80px);
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: 100;
}

.control-panel.collapsed {
  transform: translateX(-350px);
}

.expense-item {
  display: grid;
  grid-template-columns: 24px 1fr auto auto;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.expense-item:hover {
  background: var(--bg-secondary);
  border-left: 3px solid var(--accent-primary);
}

.expense-item input:not(:checked) ~ .expense-name {
  text-decoration: line-through;
  opacity: 0.4;
}

.impact-summary {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
}

.metric-change.positive {
  color: var(--success);
  font-weight: 600;
}

.metric-change.negative {
  color: var(--danger);
  font-weight: 600;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .control-panel {
    width: 100%;
    transform: translateY(100vh);
  }

  .control-panel.open {
    transform: translateY(0);
  }
}
```

---

## Phase 2: Build Client-Side Forecast Calculation Engine

### Objective
Create a pure JavaScript calculation engine that mirrors `forecast-calculator-agent` logic but runs entirely in the browser.

### Core Architecture

```
TransactionRuleEngine
    ↓
    ├─ parseTransactionRules() → TRANSACTION_RULES object
    ├─ calculateDailyForecast() → Array of daily transactions
    ├─ getTransactionsForDay() → Transactions for specific date
    ├─ applyRecurringRules() → Monthly, biweekly, weekday logic
    └─ calculateFlags() → LOW/NEG balance flags
```

### Data Structure: TRANSACTION_RULES

Convert `data/cash-flow-data.md` into structured JavaScript object:

```javascript
const TRANSACTION_RULES = {
  thresholds: {
    LOW: 500,
    NEG: 0
  },

  monthlyBills: [
    {
      id: 'vitruvian-membership',
      name: 'Vitruvian Membership',
      amount: 39.00,
      day: 1,
      category: 'fitness'
    },
    {
      id: 'transamerica',
      name: 'TRANSAMERICA Insurance',
      amount: 245.65,
      day: 1,
      category: 'insurance'
    },
    {
      id: 'apple-card',
      name: 'Apple Card',
      amount: 30.00,
      day: 1,
      category: 'credit'
    },
    {
      id: 'supplements',
      name: 'Supplements',
      amount: 300.00,
      day: 1,
      category: 'health'
    },
    {
      id: 'payment-coordinator',
      name: 'Payment Coordinator',
      amount: 500.00,
      day: 1,
      category: 'service'
    },
    {
      id: 'synchrony-bank',
      name: 'SYNCHRONY Bank Bill Payment',
      amount: 58.00,
      day: 3,
      category: 'credit'
    },
    {
      id: 'synchrony-credit',
      name: 'SYNCHRONY Credit Card',
      amount: 87.00,
      day: 3,
      category: 'credit'
    },
    {
      id: 'bill-me-later',
      name: 'Bill Me Later',
      amount: 125.00,
      day: 3,
      category: 'credit'
    },
    {
      id: 'connell-gelb',
      name: 'Connell & Gelb',
      amount: 500.00,
      day: 4,
      category: 'legal'
    },
    {
      id: 'loancare-mortgage',
      name: 'LoanCare Mortgage',
      amount: 3566.24,
      day: 5,
      category: 'housing'
    },
    {
      id: 'sleep-number',
      name: 'Sleep Number',
      amount: 434.58,
      day: 7,
      category: 'furniture'
    },
    {
      id: 'hexclad',
      name: 'HexClad Pots',
      amount: 126.00,
      day: 9,
      category: 'household'
    },
    {
      id: 'duke-energy',
      name: 'Duke Energy NC',
      amount: 86.00,
      day: 9,
      category: 'utilities'
    },
    {
      id: 'ashley-venture',
      name: 'Ashley Venture',
      amount: 67.00,
      day: 10,
      category: 'furniture'
    },
    {
      id: 'netflix',
      name: 'Netflix',
      amount: 25.00,
      day: 10,
      category: 'entertainment'
    },
    {
      id: 'att',
      name: 'AT&T',
      amount: 52.50,
      day: 10,
      category: 'utilities'
    },
    {
      id: 'sba-eidl',
      name: 'SBA EIDL Loan',
      amount: 315.00,
      day: 14,
      category: 'business'
    },
    {
      id: 'chaundra-williams-1',
      name: 'Chaundra Williams',
      amount: 270.29,
      day: 15,
      category: 'personal'
    },
    {
      id: '2nd-mortgage',
      name: '2nd Mortgage',
      amount: 1540.69,
      day: 15,
      category: 'housing'
    },
    {
      id: 'nc529',
      name: 'NC529 College Savings',
      amount: 50.00,
      day: 15,
      category: 'education'
    },
    {
      id: 'ashley-quicksilver',
      name: 'Ashley QuickSilver',
      amount: 126.00,
      day: 18,
      category: 'furniture'
    },
    {
      id: 'c3-baseball',
      name: 'C3 Baseball Training',
      amount: 312.00,
      day: 18,
      category: 'sports'
    },
    {
      id: 'allstate',
      name: 'ALLSTATE Insurance',
      amount: 243.84,
      day: 20,
      category: 'insurance'
    },
    {
      id: 'merry-maids',
      name: 'Merry Maids',
      amount: 175.00,
      day: 20,
      category: 'service'
    },
    {
      id: 'pliability',
      name: 'pliability',
      amount: 13.99,
      day: 22,
      category: 'fitness'
    },
    {
      id: 'loan-feb-2022',
      name: 'Loan (Feb 17, 2022)',
      amount: 322.60,
      day: 22,
      category: 'loan'
    },
    {
      id: 'loan-mar-2025',
      name: 'Loan (Mar 19, 2025)',
      amount: 376.54,
      day: 22,
      category: 'loan'
    },
    {
      id: 'vitruvian-equipment',
      name: 'Vitruvian Equipment',
      amount: 99.21,
      day: 23,
      category: 'fitness'
    },
    {
      id: 'container-store',
      name: 'The Container Store',
      amount: 144.00,
      day: 26,
      category: 'household'
    },
    {
      id: 'aven-card',
      name: 'Aven Card',
      amount: 477.00,
      day: 27,
      category: 'credit'
    },
    {
      id: 'sofi-loan',
      name: 'Sofi Loan',
      amount: 1042.78,
      day: 27,
      category: 'loan'
    },
    {
      id: 'myfitnesspal',
      name: 'MyFitnessPal',
      amount: 19.99,
      day: 29,
      category: 'fitness'
    },
    {
      id: 'chaundra-williams-2',
      name: 'Chaundra Williams',
      amount: 270.29,
      day: 30,
      category: 'personal'
    },
    {
      id: 'club-pilates',
      name: 'Club Pilates',
      amount: 219.00,
      day: 30,
      category: 'fitness'
    }
  ],

  biweeklyBills: [
    {
      id: 'mmi',
      name: 'MMI',
      amount: 852.00,
      anchor: '2025-08-08',
      category: 'credit'
    },
    {
      id: 'charleston-management',
      name: 'Charleston Management',
      amount: 49.00,
      anchor: '2025-04-24',
      category: 'property'
    },
    {
      id: 'buffalo-grove-hoa',
      name: 'Buffalo Grove HOA',
      amount: 51.28,
      anchor: '2025-09-05',
      category: 'property'
    },
    {
      id: 'groceries',
      name: 'Groceries',
      amount: 500.00,
      anchor: '2025-11-28',
      category: 'food'
    },
    {
      id: 'gas',
      name: 'Gas',
      amount: 100.00,
      anchor: '2025-11-28',
      category: 'transportation'
    },
    {
      id: 'eating-out',
      name: 'Eating Out',
      amount: 250.00,
      anchor: '2025-11-28',
      category: 'food'
    },
    {
      id: 'principal-loan',
      name: 'Principal Loan',
      amount: 198.00,
      anchor: '2025-11-14',
      category: 'loan'
    }
  ],

  weekdayRecurring: [
    {
      id: 'nfcu-volvo',
      name: 'NFCU Volvo Loan',
      amount: 33.00,
      category: 'auto'
    }
  ],

  fridayAllocations: [
    {
      id: 'savings',
      name: 'Savings',
      amount: 200.00,
      category: 'savings'
    },
    {
      id: 'tithe',
      name: 'Tithe',
      amount: 100.00,
      category: 'giving'
    },
    {
      id: 'debt-payoff',
      name: 'Debt Payoff',
      amount: 1000.00,
      category: 'debt'
    }
  ],

  inflows: {
    biweekly: [
      {
        id: 'acrisure',
        name: 'Acrisure',
        amount: 4487.00,
        anchor: '2025-08-08'
      },
      {
        id: 'wakemed',
        name: 'WakeMed',
        amount: 1000.00,
        anchor: '2025-08-07'
      },
      {
        id: 'claritev',
        name: 'Claritev',
        amount: 3500.00,
        anchor: '2025-12-05'
      }
    ],
    monthly: [
      {
        id: 'rent-103-grandmont',
        name: '103 Grandmont Rent',
        amount: 1530.00,
        day: 15
      }
    ]
  }
};
```

### Core Function: TransactionRuleEngine Class

```javascript
class TransactionRuleEngine {
  constructor(rules, startDate, startBalance) {
    this.rules = rules;
    this.startDate = new Date(startDate);
    this.startBalance = startBalance;
    this.forecastPeriod = this.calculateForecastPeriod();
  }

  /**
   * Calculate forecast period: rest of current month + next full month
   */
  calculateForecastPeriod() {
    const start = new Date(this.startDate);
    start.setDate(start.getDate() + 1); // Start from tomorrow

    // Calculate end date: last day of next month
    const end = new Date(start.getFullYear(), start.getMonth() + 2, 0);

    return { start, end };
  }

  /**
   * Main calculation function - generates full forecast
   */
  calculateDailyForecast(disabledExpenses = new Set()) {
    const forecast = [];
    let balance = this.startBalance;

    // Iterate through each day in forecast period
    let currentDate = new Date(this.forecastPeriod.start);
    while (currentDate <= this.forecastPeriod.end) {
      const transactions = this.getTransactionsForDay(currentDate, disabledExpenses);

      const debits = transactions.debits.reduce((sum, t) => sum + t.amount, 0);
      const credits = transactions.credits.reduce((sum, t) => sum + t.amount, 0);
      const netChange = credits - debits;

      balance += netChange;

      forecast.push({
        date: this.formatDate(currentDate),
        debits: this.roundCurrency(debits),
        credits: this.roundCurrency(credits),
        netChange: this.roundCurrency(netChange),
        endBalance: this.roundCurrency(balance),
        flag: this.getFlag(balance),
        debitNames: transactions.debits.map(t => t.name).join(', '),
        creditNames: transactions.credits.map(t => t.name).join(', ')
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return forecast;
  }

  /**
   * Get all transactions scheduled for a specific day
   */
  getTransactionsForDay(date, disabledExpenses) {
    const transactions = { debits: [], credits: [] };

    // Process monthly bills
    this.rules.monthlyBills.forEach(bill => {
      if (date.getDate() === bill.day && !disabledExpenses.has(bill.id)) {
        transactions.debits.push(bill);
      }
    });

    // Process biweekly bills
    this.rules.biweeklyBills.forEach(bill => {
      if (this.isBiweeklyDue(date, bill.anchor) && !disabledExpenses.has(bill.id)) {
        transactions.debits.push(bill);
      }
    });

    // Process weekday recurring (Monday-Friday only)
    if (this.isWeekday(date)) {
      this.rules.weekdayRecurring.forEach(item => {
        if (!disabledExpenses.has(item.id)) {
          transactions.debits.push(item);
        }
      });
    }

    // Process Friday allocations
    if (date.getDay() === 5) { // Friday = 5
      this.rules.fridayAllocations.forEach(item => {
        if (!disabledExpenses.has(item.id)) {
          transactions.debits.push(item);
        }
      });
    }

    // Process biweekly inflows
    this.rules.inflows.biweekly.forEach(income => {
      if (this.isBiweeklyDue(date, income.anchor)) {
        transactions.credits.push(income);
      }
    });

    // Process monthly inflows
    this.rules.inflows.monthly.forEach(income => {
      if (date.getDate() === income.day) {
        transactions.credits.push(income);
      }
    });

    return transactions;
  }

  /**
   * Check if a biweekly transaction is due on a specific date
   * Uses modulo 14 arithmetic from anchor date
   */
  isBiweeklyDue(date, anchorDateStr) {
    const anchor = new Date(anchorDateStr);
    const daysDiff = Math.floor((date - anchor) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff % 14 === 0;
  }

  /**
   * Check if date is a weekday (Monday-Friday)
   */
  isWeekday(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // 1=Monday, 5=Friday
  }

  /**
   * Determine balance flag (NEG, LOW, or empty)
   */
  getFlag(balance) {
    if (balance < this.rules.thresholds.NEG) return 'NEG';
    if (balance < this.rules.thresholds.LOW) return 'LOW';
    return '';
  }

  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Round currency to 2 decimal places
   */
  roundCurrency(amount) {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Calculate summary statistics from forecast
   */
  calculateSummary(forecast) {
    if (forecast.length === 0) {
      return null;
    }

    const endingBalance = forecast[forecast.length - 1].endBalance;
    const netChange = endingBalance - this.startBalance;

    // Find lowest balance point
    let lowestBalance = this.startBalance;
    let lowestDate = this.formatDate(this.startDate);

    forecast.forEach(day => {
      if (day.endBalance < lowestBalance) {
        lowestBalance = day.endBalance;
        lowestDate = day.date;
      }
    });

    // Count flagged days
    const negDays = forecast.filter(d => d.flag === 'NEG').length;
    const lowDays = forecast.filter(d => d.flag === 'LOW').length;

    return {
      startingBalance: this.roundCurrency(this.startBalance),
      endingBalance: this.roundCurrency(endingBalance),
      netChange: this.roundCurrency(netChange),
      lowestPoint: {
        date: lowestDate,
        balance: this.roundCurrency(lowestBalance)
      },
      flagCounts: {
        NEG: negDays,
        LOW: lowDays
      }
    };
  }
}
```

### Comparison Calculator

```javascript
class ComparisonCalculator {
  constructor(baselineForecast, modifiedForecast) {
    this.baseline = baselineForecast;
    this.modified = modifiedForecast;
  }

  /**
   * Calculate total expenses removed
   */
  getTotalRemoved() {
    const baselineTotal = this.baseline.reduce((sum, d) => sum + d.debits, 0);
    const modifiedTotal = this.modified.reduce((sum, d) => sum + d.debits, 0);
    return baselineTotal - modifiedTotal;
  }

  /**
   * Calculate ending balance change
   */
  getEndingBalanceChange() {
    const baselineEnd = this.baseline[this.baseline.length - 1].endBalance;
    const modifiedEnd = this.modified[this.modified.length - 1].endBalance;

    return {
      before: baselineEnd,
      after: modifiedEnd,
      delta: modifiedEnd - baselineEnd,
      improved: modifiedEnd > baselineEnd
    };
  }

  /**
   * Calculate negative days change
   */
  getNegativeDaysChange() {
    const baselineNeg = this.baseline.filter(d => d.flag === 'NEG').length;
    const modifiedNeg = this.modified.filter(d => d.flag === 'NEG').length;

    return {
      before: baselineNeg,
      after: modifiedNeg,
      delta: baselineNeg - modifiedNeg,
      eliminated: modifiedNeg === 0 && baselineNeg > 0
    };
  }

  /**
   * Calculate lowest balance change
   */
  getLowestBalanceChange() {
    const baselineLowest = Math.min(...this.baseline.map(d => d.endBalance));
    const modifiedLowest = Math.min(...this.modified.map(d => d.endBalance));

    return {
      before: baselineLowest,
      after: modifiedLowest,
      improvement: modifiedLowest - baselineLowest,
      improved: modifiedLowest > baselineLowest
    };
  }

  /**
   * Get status change (NEGATIVE → POSITIVE, etc.)
   */
  getStatusChange() {
    const baselineStatus = this.baseline.some(d => d.flag === 'NEG') ? 'NEGATIVE' :
                          this.baseline.some(d => d.flag === 'LOW') ? 'CAUTION' : 'HEALTHY';
    const modifiedStatus = this.modified.some(d => d.flag === 'NEG') ? 'NEGATIVE' :
                          this.modified.some(d => d.flag === 'LOW') ? 'CAUTION' : 'HEALTHY';

    return {
      before: baselineStatus,
      after: modifiedStatus,
      improved: (baselineStatus === 'NEGATIVE' && modifiedStatus !== 'NEGATIVE') ||
                (baselineStatus === 'CAUTION' && modifiedStatus === 'HEALTHY')
    };
  }

  /**
   * Generate full comparison report
   */
  getFullComparison() {
    return {
      totalRemoved: this.getTotalRemoved(),
      endingBalance: this.getEndingBalanceChange(),
      negativeDays: this.getNegativeDaysChange(),
      lowestBalance: this.getLowestBalanceChange(),
      status: this.getStatusChange()
    };
  }
}
```

---

## Phase 3: Create Comparison View (Baseline vs Modified)

### Objective
Build side-by-side metrics and visual indicators showing the impact of toggling expenses.

### UI Components

#### 1. Summary Cards with Comparison

```html
<div class="comparison-grid">
  <div class="metric-card">
    <h3>Ending Balance</h3>
    <div class="before-after">
      <div class="baseline-value">
        <span class="label">Baseline</span>
        <span class="value negative">$-9,817.43</span>
        <span class="indicator">❌</span>
      </div>
      <div class="arrow">→</div>
      <div class="modified-value">
        <span class="label">Modified</span>
        <span class="value positive">$6,651.57</span>
        <span class="indicator">✅</span>
      </div>
    </div>
    <div class="delta-badge positive">
      <span class="delta-icon">⬆</span>
      <span class="delta-amount">+$16,469.00</span>
      <span class="delta-label">improvement</span>
    </div>
  </div>

  <div class="metric-card">
    <h3>Negative Days</h3>
    <div class="before-after">
      <div class="baseline-value">
        <span class="label">Baseline</span>
        <span class="value warning">38 days</span>
      </div>
      <div class="arrow">→</div>
      <div class="modified-value">
        <span class="label">Modified</span>
        <span class="value success">0 days</span>
      </div>
    </div>
    <div class="delta-badge positive">
      <span class="delta-icon">✅</span>
      <span class="delta-label">All negative days eliminated</span>
    </div>
  </div>

  <div class="metric-card">
    <h3>Lowest Balance</h3>
    <div class="before-after">
      <div class="baseline-value">
        <span class="label">Baseline</span>
        <span class="value negative">$-9,817.43</span>
      </div>
      <div class="arrow">→</div>
      <div class="modified-value">
        <span class="label">Modified</span>
        <span class="value">$423.16</span>
      </div>
    </div>
    <div class="delta-badge positive">
      <span class="delta-icon">⬆</span>
      <span class="delta-amount">+$10,240.59</span>
      <span class="delta-label">improvement</span>
    </div>
  </div>

  <div class="metric-card status-card">
    <h3>Cash Flow Status</h3>
    <div class="status-change">
      <div class="status-before">
        <span class="status-badge danger">⚠️ NEGATIVE</span>
      </div>
      <div class="arrow">→</div>
      <div class="status-after">
        <span class="status-badge success">✅ POSITIVE</span>
      </div>
    </div>
  </div>
</div>
```

#### 2. Chart Comparison Mode

Two visualization approaches:

**Option A: Overlay Mode**
- Display both forecasts on the same chart
- Blue line = baseline forecast
- Green line = modified forecast
- Shaded area between lines = improvement zone
- Toggle button to show/hide baseline

**Option B: Split View**
- Side-by-side charts
- Left: Baseline forecast
- Right: Modified forecast
- Synchronized zoom/pan

```javascript
function updateComparisonChart(baselineForecast, modifiedForecast) {
  const ctx = document.getElementById('comparisonChart');

  // Destroy existing chart if present
  if (window.comparisonChartInstance) {
    window.comparisonChartInstance.destroy();
  }

  window.comparisonChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: baselineForecast.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Baseline Forecast',
          data: baselineForecast.map(d => d.endBalance),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: 'Modified Forecast',
          data: modifiedForecast.map(d => d.endBalance),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        annotation: {
          annotations: {
            zeroLine: {
              type: 'line',
              yMin: 0,
              yMax: 0,
              borderColor: '#dc2626',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                content: 'Zero Balance',
                enabled: true,
                position: 'start',
                backgroundColor: '#dc2626',
                color: 'white'
              }
            }
          }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              return formatDate(baselineForecast[context[0].dataIndex].date);
            },
            label: function(context) {
              const datasetLabel = context.dataset.label;
              const value = formatCurrency(context.parsed.y);
              return `${datasetLabel}: ${value}`;
            },
            afterLabel: function(context) {
              const baseline = baselineForecast[context.dataIndex].endBalance;
              const modified = modifiedForecast[context.dataIndex].endBalance;
              const diff = modified - baseline;
              if (diff !== 0) {
                return `Difference: ${formatCurrency(diff)}`;
              }
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          },
          grid: {
            color: function(context) {
              return context.tick.value === 0 ? '#dc2626' : 'rgba(0, 0, 0, 0.1)';
            }
          }
        }
      }
    }
  });
}
```

#### 3. Transaction Table with Comparison Column

Add a "Difference" column showing what changed:

```html
<table class="comparison-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Baseline Balance</th>
      <th>Modified Balance</th>
      <th>Difference</th>
      <th>Change Reason</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dec 7 (Sat)</td>
      <td class="negative">$-6,514.15</td>
      <td class="negative">$-6,079.57</td>
      <td class="improvement">+$434.58</td>
      <td class="removed-items">Sleep Number removed</td>
    </tr>
    <tr>
      <td>Dec 12 (Fri)</td>
      <td class="negative">$-4,799.93</td>
      <td class="positive">$-2,456.93</td>
      <td class="improvement">+$2,343.00</td>
      <td class="removed-items">Savings, Tithe, Debt Payoff removed</td>
    </tr>
    <tr class="flag-change">
      <td>Dec 20 (Sat)</td>
      <td class="negative">$-4,316.75 <span class="flag-badge neg">NEG</span></td>
      <td class="positive">$523.25 <span class="flag-badge ok">OK</span></td>
      <td class="improvement">+$4,840.00</td>
      <td class="status-change">NEG → OK ✅</td>
    </tr>
  </tbody>
</table>
```

#### 4. Removed Expenses Summary

Show exactly which expenses were toggled off:

```html
<div class="removed-expenses-summary">
  <h3>Expenses Removed from Forecast</h3>
  <div class="removed-list">
    <div class="removed-item">
      <span class="expense-name">Sleep Number</span>
      <span class="expense-amount">$434.58/month</span>
      <span class="expense-schedule">Day 7</span>
      <span class="total-saved">Total saved: $434.58</span>
    </div>
    <div class="removed-item">
      <span class="expense-name">Savings</span>
      <span class="expense-amount">$200/week</span>
      <span class="expense-schedule">Every Friday</span>
      <span class="total-saved">Total saved: $1,200.00</span>
    </div>
    <div class="removed-item">
      <span class="expense-name">Tithe</span>
      <span class="expense-amount">$100/week</span>
      <span class="expense-schedule">Every Friday</span>
      <span class="total-saved">Total saved: $600.00</span>
    </div>
    <div class="removed-item">
      <span class="expense-name">Debt Payoff</span>
      <span class="expense-amount">$1,000/week</span>
      <span class="expense-schedule">Every Friday</span>
      <span class="total-saved">Total saved: $6,000.00</span>
    </div>
  </div>
  <div class="removed-total">
    <strong>Total Expenses Removed:</strong> $8,234.58
  </div>
</div>
```

### CSS Styling for Comparison View

```css
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow);
}

.before-after {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 0;
}

.baseline-value,
.modified-value {
  flex: 1;
  text-align: center;
}

.baseline-value .label,
.modified-value .label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.baseline-value .value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.modified-value .value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.value.positive {
  color: var(--success);
}

.value.negative {
  color: var(--danger);
}

.value.warning {
  color: var(--warning);
}

.arrow {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.delta-badge {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.delta-badge.positive {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--success);
  color: var(--success);
}

.delta-badge.negative {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
}

.delta-icon {
  font-size: 1.25rem;
}

.delta-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

.delta-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge.success {
  background: var(--success);
  color: white;
}

.status-badge.danger {
  background: var(--danger);
  color: white;
}

.status-badge.warning {
  background: var(--warning);
  color: #1a1a1a;
}

/* Comparison Table */
.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.comparison-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comparison-table td.improvement {
  color: var(--success);
  font-weight: 600;
}

.comparison-table .removed-items {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.comparison-table .flag-change {
  background: rgba(16, 185, 129, 0.05);
  border-left: 3px solid var(--success);
}

.flag-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-left: 0.5rem;
}

.flag-badge.neg {
  background: var(--danger);
  color: white;
}

.flag-badge.low {
  background: var(--warning);
  color: #1a1a1a;
}

.flag-badge.ok {
  background: var(--success);
  color: white;
}

/* Removed Expenses Summary */
.removed-expenses-summary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.removed-expenses-summary h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.removed-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.removed-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  align-items: center;
}

.removed-item .expense-name {
  font-weight: 600;
  text-decoration: line-through;
  opacity: 0.6;
}

.removed-item .total-saved {
  color: var(--success);
  font-weight: 600;
  text-align: right;
}

.removed-total {
  padding-top: 1rem;
  border-top: 2px solid var(--border-color);
  text-align: right;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--success);
}

@media (max-width: 768px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .removed-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .removed-item .total-saved {
    text-align: left;
  }
}
```

---

## Phase 4: Implement Real-Time Chart and Table Updates

### Objective
Build event listeners that trigger recalculation and re-rendering when checkboxes change.

### Event System Architecture

```javascript
/**
 * Central scenario manager - coordinates all updates
 */
class ScenarioManager {
  constructor(transactionRules, startDate, startBalance) {
    this.engine = new TransactionRuleEngine(transactionRules, startDate, startBalance);
    this.disabledExpenses = new Set();
    this.listeners = [];

    // Calculate baseline forecast once
    this.baselineForecast = this.engine.calculateDailyForecast(new Set());
    this.baselineSummary = this.engine.calculateSummary(this.baselineForecast);

    // Initially, modified = baseline
    this.modifiedForecast = [...this.baselineForecast];
    this.modifiedSummary = {...this.baselineSummary};
  }

  /**
   * Toggle expense on/off
   */
  toggleExpense(expenseId) {
    if (this.disabledExpenses.has(expenseId)) {
      this.disabledExpenses.delete(expenseId);
    } else {
      this.disabledExpenses.add(expenseId);
    }

    this.recalculate();
  }

  /**
   * Enable specific expense
   */
  enableExpense(expenseId) {
    this.disabledExpenses.delete(expenseId);
    this.recalculate();
  }

  /**
   * Disable specific expense
   */
  disableExpense(expenseId) {
    this.disabledExpenses.add(expenseId);
    this.recalculate();
  }

  /**
   * Reset to baseline (enable all expenses)
   */
  resetToBaseline() {
    this.disabledExpenses.clear();
    this.recalculate();
  }

  /**
   * Apply a preset scenario
   */
  applyPreset(presetName) {
    this.disabledExpenses.clear();

    switch (presetName) {
      case 'survival':
        // Pause savings, tithe, debt payoff
        this.disabledExpenses.add('savings');
        this.disabledExpenses.add('tithe');
        this.disabledExpenses.add('debt-payoff');
        break;

      case 'aggressive':
        // Pause all discretionary spending
        this.disabledExpenses.add('savings');
        this.disabledExpenses.add('tithe');
        this.disabledExpenses.add('netflix');
        this.disabledExpenses.add('myfitnesspal');
        this.disabledExpenses.add('eating-out');
        break;

      case 'essential-only':
        // Keep only housing, utilities, insurance, minimum debt
        // This would require more complex logic to define "essential"
        break;
    }

    this.recalculate();
  }

  /**
   * Recalculate modified forecast with current disabled expenses
   */
  recalculate() {
    this.modifiedForecast = this.engine.calculateDailyForecast(this.disabledExpenses);
    this.modifiedSummary = this.engine.calculateSummary(this.modifiedForecast);

    this.notifyListeners();
  }

  /**
   * Get comparison between baseline and modified
   */
  getComparison() {
    const calculator = new ComparisonCalculator(this.baselineForecast, this.modifiedForecast);
    return calculator.getFullComparison();
  }

  /**
   * Register a listener for updates
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    const comparison = this.getComparison();

    this.listeners.forEach(callback => {
      try {
        callback({
          baseline: this.baselineForecast,
          baselineSummary: this.baselineSummary,
          modified: this.modifiedForecast,
          modifiedSummary: this.modifiedSummary,
          comparison: comparison,
          disabledExpenses: Array.from(this.disabledExpenses)
        });
      } catch (error) {
        console.error('Error in listener callback:', error);
      }
    });
  }
}
```

### UI Update Handlers

```javascript
/**
 * Initialize the scenario manager and bind UI events
 */
function initializeScenarioPlanner() {
  // Get starting values from current dashboard data
  const startDate = '2025-11-20'; // From dashboard subtitle
  const startBalance = 800.00; // From first transaction

  // Create scenario manager
  window.scenarioManager = new ScenarioManager(TRANSACTION_RULES, startDate, startBalance);

  // Register UI update listeners
  scenarioManager.addListener(updateAllUI);

  // Bind checkbox events
  bindCheckboxEvents();

  // Bind control button events
  bindControlButtonEvents();

  // Bind preset button events
  bindPresetButtons();

  // Initial render
  scenarioManager.notifyListeners();
}

/**
 * Update all UI components when scenario changes
 */
function updateAllUI(data) {
  updateSummaryCards(data);
  updateComparisonChart(data.baseline, data.modified);
  updateTransactionTable(data.modified);
  updateAlerts(data.modified);
  updateImpactSummary(data.comparison);
  updateRemovedExpensesList(data.disabledExpenses);
  updateCheckboxStates(data.disabledExpenses);
}

/**
 * Update summary comparison cards
 */
function updateSummaryCards(data) {
  const { comparison } = data;

  // Ending Balance card
  document.querySelector('#endingBalance .baseline-value .value').textContent =
    formatCurrency(comparison.endingBalance.before);
  document.querySelector('#endingBalance .modified-value .value').textContent =
    formatCurrency(comparison.endingBalance.after);
  document.querySelector('#endingBalance .delta-amount').textContent =
    formatCurrency(comparison.endingBalance.delta);

  // Negative Days card
  document.querySelector('#negativeDays .baseline-value .value').textContent =
    `${comparison.negativeDays.before} days`;
  document.querySelector('#negativeDays .modified-value .value').textContent =
    `${comparison.negativeDays.after} days`;

  if (comparison.negativeDays.eliminated) {
    document.querySelector('#negativeDays .delta-label').textContent =
      'All negative days eliminated';
  } else {
    document.querySelector('#negativeDays .delta-label').textContent =
      `${comparison.negativeDays.delta} days improved`;
  }

  // Lowest Balance card
  document.querySelector('#lowestBalance .baseline-value .value').textContent =
    formatCurrency(comparison.lowestBalance.before);
  document.querySelector('#lowestBalance .modified-value .value').textContent =
    formatCurrency(comparison.lowestBalance.after);
  document.querySelector('#lowestBalance .delta-amount').textContent =
    formatCurrency(comparison.lowestBalance.improvement);

  // Status card
  document.querySelector('#status .status-before .status-badge').textContent =
    `⚠️ ${comparison.status.before}`;
  document.querySelector('#status .status-after .status-badge').textContent =
    `${comparison.status.improved ? '✅' : '⚠️'} ${comparison.status.after}`;
}

/**
 * Update impact summary card
 */
function updateImpactSummary(comparison) {
  const summaryEl = document.getElementById('impactSummary');

  summaryEl.innerHTML = `
    <h3>Scenario Impact</h3>
    <div class="impact-metric">
      <span class="label">Total Expenses Removed:</span>
      <span class="value">${formatCurrency(comparison.totalRemoved)}</span>
    </div>
    <div class="impact-metric">
      <span class="label">Ending Balance Change:</span>
      <span class="value ${comparison.endingBalance.improved ? 'positive' : 'negative'}">
        ${formatCurrency(comparison.endingBalance.delta)}
      </span>
    </div>
    <div class="impact-metric">
      <span class="label">Status:</span>
      <span class="value">
        ${comparison.status.before} → ${comparison.status.after}
        ${comparison.status.improved ? '✅' : ''}
      </span>
    </div>
  `;
}

/**
 * Update removed expenses list
 */
function updateRemovedExpensesList(disabledExpenses) {
  const container = document.getElementById('removedExpensesList');

  if (disabledExpenses.length === 0) {
    container.innerHTML = '<p class="no-changes">No expenses removed (showing baseline)</p>';
    return;
  }

  let html = '<div class="removed-list">';
  let totalSaved = 0;

  disabledExpenses.forEach(expenseId => {
    const expense = findExpenseById(expenseId);
    if (expense) {
      const monthlySaved = calculateMonthlySavings(expense);
      totalSaved += monthlySaved;

      html += `
        <div class="removed-item">
          <span class="expense-name">${expense.name}</span>
          <span class="expense-amount">${formatCurrency(expense.amount)}</span>
          <span class="expense-schedule">${getScheduleDescription(expense)}</span>
          <span class="total-saved">${formatCurrency(monthlySaved)} saved</span>
        </div>
      `;
    }
  });

  html += '</div>';
  html += `
    <div class="removed-total">
      <strong>Total Monthly Savings:</strong> ${formatCurrency(totalSaved)}
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Bind checkbox change events
 */
function bindCheckboxEvents() {
  document.querySelectorAll('.expense-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const expenseId = e.target.dataset.expenseId;
      scenarioManager.toggleExpense(expenseId);
    });
  });
}

/**
 * Bind control button events
 */
function bindControlButtonEvents() {
  document.getElementById('resetToBaseline').addEventListener('click', () => {
    scenarioManager.resetToBaseline();
  });

  document.getElementById('saveScenario').addEventListener('click', () => {
    showSaveScenarioDialog();
  });
}

/**
 * Bind preset button events
 */
function bindPresetButtons() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const preset = e.target.dataset.preset;
      scenarioManager.applyPreset(preset);
    });
  });
}

/**
 * Update checkbox states after programmatic changes
 */
function updateCheckboxStates(disabledExpenses) {
  document.querySelectorAll('.expense-checkbox').forEach(checkbox => {
    const expenseId = checkbox.dataset.expenseId;
    checkbox.checked = !disabledExpenses.includes(expenseId);
  });
}
```

### Debounced Recalculation

For performance optimization when rapidly toggling multiple checkboxes:

```javascript
/**
 * Debounce utility function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Debounced recalculation (300ms delay)
 */
const debouncedRecalculate = debounce(() => {
  scenarioManager.recalculate();
}, 300);

/**
 * Modified toggle function with debouncing
 */
function toggleExpenseDebounced(expenseId) {
  if (scenarioManager.disabledExpenses.has(expenseId)) {
    scenarioManager.disabledExpenses.delete(expenseId);
  } else {
    scenarioManager.disabledExpenses.add(expenseId);
  }

  // Update checkbox state immediately for responsiveness
  updateCheckboxStates(Array.from(scenarioManager.disabledExpenses));

  // Debounce the expensive recalculation
  debouncedRecalculate();
}
```

### Performance Considerations

**Optimization Strategies:**
1. **Debouncing**: Wait 300ms after last checkbox change before recalculating
2. **Virtual scrolling**: Only render visible rows in transaction table
3. **Memoization**: Cache calculation results for common scenarios
4. **Web Workers**: Offload heavy calculations to background thread
5. **Progressive rendering**: Update UI in chunks (summary → chart → table)

---

## Phase 5: Add Save/Load Scenario Functionality

### Objective
Allow users to save different expense combinations and switch between them.

### Scenario Storage Architecture

```javascript
/**
 * Manages scenario persistence using localStorage
 */
class ScenarioStorage {
  constructor() {
    this.storageKey = 'cashflow-scenarios';
  }

  /**
   * Save a scenario with a name
   */
  saveScenario(name, disabledExpenses, summary) {
    const scenarios = this.loadAllScenarios();

    scenarios[name] = {
      disabledExpenses: Array.from(disabledExpenses),
      summary: {
        endingBalance: summary.endingBalance,
        negativeDays: summary.negativeDays,
        lowestBalance: summary.lowestBalance,
        totalRemoved: summary.totalRemoved
      },
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    localStorage.setItem(this.storageKey, JSON.stringify(scenarios));
    return true;
  }

  /**
   * Load a specific scenario by name
   */
  loadScenario(name) {
    const scenarios = this.loadAllScenarios();
    return scenarios[name] || null;
  }

  /**
   * Load all saved scenarios
   */
  loadAllScenarios() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading scenarios:', error);
      return {};
    }
  }

  /**
   * Delete a scenario by name
   */
  deleteScenario(name) {
    const scenarios = this.loadAllScenarios();
    delete scenarios[name];
    localStorage.setItem(this.storageKey, JSON.stringify(scenarios));
    return true;
  }

  /**
   * Get list of scenario names
   */
  listScenarios() {
    const scenarios = this.loadAllScenarios();
    return Object.keys(scenarios).map(name => ({
      name,
      timestamp: scenarios[name].timestamp,
      summary: scenarios[name].summary
    }));
  }

  /**
   * Export scenarios as JSON file
   */
  exportScenarios() {
    const scenarios = this.loadAllScenarios();
    const dataStr = JSON.stringify(scenarios, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportName = `cashflow-scenarios-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  }

  /**
   * Import scenarios from JSON file
   */
  importScenarios(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      const existing = this.loadAllScenarios();

      // Merge imported with existing (imported takes precedence)
      const merged = { ...existing, ...imported };

      localStorage.setItem(this.storageKey, JSON.stringify(merged));
      return Object.keys(imported).length;
    } catch (error) {
      console.error('Error importing scenarios:', error);
      return 0;
    }
  }
}
```

### Scenario Picker UI

```html
<div class="scenario-manager">
  <div class="scenario-header">
    <h3>Saved Scenarios</h3>
    <button id="newScenarioBtn" class="btn-primary">+ New Scenario</button>
  </div>

  <div class="scenario-list">
    <div class="scenario-item active" data-scenario="baseline">
      <div class="scenario-info">
        <span class="scenario-name">Baseline (All Expenses)</span>
        <span class="scenario-date">Default</span>
      </div>
      <div class="scenario-summary">
        <span class="metric">End: $-9,817</span>
        <span class="metric">NEG: 38 days</span>
      </div>
    </div>

    <div class="scenario-item" data-scenario="survival">
      <div class="scenario-info">
        <span class="scenario-name">Survival Mode</span>
        <span class="scenario-date">Saved 2025-11-20</span>
      </div>
      <div class="scenario-summary">
        <span class="metric">End: $-2,817</span>
        <span class="metric">NEG: 18 days</span>
      </div>
      <div class="scenario-actions">
        <button class="load-btn" title="Load scenario">Load</button>
        <button class="delete-btn" title="Delete scenario">Delete</button>
      </div>
    </div>

    <div class="scenario-item" data-scenario="aggressive">
      <div class="scenario-info">
        <span class="scenario-name">Aggressive Paydown</span>
        <span class="scenario-date">Saved 2025-11-20</span>
      </div>
      <div class="scenario-summary">
        <span class="metric">End: $1,523</span>
        <span class="metric">NEG: 8 days</span>
      </div>
      <div class="scenario-actions">
        <button class="load-btn" title="Load scenario">Load</button>
        <button class="delete-btn" title="Delete scenario">Delete</button>
      </div>
    </div>
  </div>

  <div class="scenario-footer">
    <button id="exportScenariosBtn">Export All</button>
    <button id="importScenariosBtn">Import</button>
    <input type="file" id="importFileInput" accept=".json" style="display: none;">
  </div>
</div>
```

### Save Scenario Dialog

```html
<div id="saveScenarioDialog" class="modal" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Save Scenario</h3>
      <button class="close-btn">&times;</button>
    </div>

    <div class="modal-body">
      <div class="form-group">
        <label for="scenarioName">Scenario Name</label>
        <input type="text"
               id="scenarioName"
               placeholder="e.g., Aggressive Paydown"
               maxlength="50">
      </div>

      <div class="form-group">
        <label>Current Configuration</label>
        <div class="config-summary">
          <p><strong>Expenses Removed:</strong> <span id="saveDialogRemovedCount">0</span></p>
          <p><strong>Ending Balance:</strong> <span id="saveDialogEndingBalance">$0</span></p>
          <p><strong>Status:</strong> <span id="saveDialogStatus">NEGATIVE</span></p>
        </div>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" id="overwriteExisting">
          Overwrite if scenario with this name exists
        </label>
      </div>
    </div>

    <div class="modal-footer">
      <button id="cancelSaveBtn" class="btn-secondary">Cancel</button>
      <button id="confirmSaveBtn" class="btn-primary">Save Scenario</button>
    </div>
  </div>
</div>
```

### Scenario Management Functions

```javascript
/**
 * Show save scenario dialog
 */
function showSaveScenarioDialog() {
  const dialog = document.getElementById('saveScenarioDialog');
  const comparison = scenarioManager.getComparison();

  // Populate summary
  document.getElementById('saveDialogRemovedCount').textContent =
    scenarioManager.disabledExpenses.size;
  document.getElementById('saveDialogEndingBalance').textContent =
    formatCurrency(comparison.endingBalance.after);
  document.getElementById('saveDialogStatus').textContent =
    comparison.status.after;

  dialog.style.display = 'block';

  // Focus input
  document.getElementById('scenarioName').focus();
}

/**
 * Save current scenario
 */
function saveCurrentScenario() {
  const name = document.getElementById('scenarioName').value.trim();

  if (!name) {
    alert('Please enter a scenario name');
    return;
  }

  const storage = new ScenarioStorage();
  const comparison = scenarioManager.getComparison();

  // Check if scenario exists
  const existing = storage.loadScenario(name);
  const overwrite = document.getElementById('overwriteExisting').checked;

  if (existing && !overwrite) {
    if (!confirm(`Scenario "${name}" already exists. Overwrite?`)) {
      return;
    }
  }

  // Save scenario
  storage.saveScenario(
    name,
    scenarioManager.disabledExpenses,
    {
      endingBalance: comparison.endingBalance.after,
      negativeDays: comparison.negativeDays.after,
      lowestBalance: comparison.lowestBalance.after,
      totalRemoved: comparison.totalRemoved
    }
  );

  // Close dialog
  document.getElementById('saveScenarioDialog').style.display = 'none';

  // Refresh scenario list
  refreshScenarioList();

  // Show success message
  showNotification(`Scenario "${name}" saved successfully`, 'success');
}

/**
 * Load a saved scenario
 */
function loadScenario(name) {
  const storage = new ScenarioStorage();
  const scenario = storage.loadScenario(name);

  if (!scenario) {
    alert(`Scenario "${name}" not found`);
    return;
  }

  // Clear current disabled expenses
  scenarioManager.disabledExpenses.clear();

  // Apply saved disabled expenses
  scenario.disabledExpenses.forEach(expenseId => {
    scenarioManager.disabledExpenses.add(expenseId);
  });

  // Recalculate
  scenarioManager.recalculate();

  // Update active state in UI
  document.querySelectorAll('.scenario-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-scenario="${name}"]`)?.classList.add('active');

  showNotification(`Loaded scenario: ${name}`, 'info');
}

/**
 * Delete a saved scenario
 */
function deleteScenario(name) {
  if (!confirm(`Delete scenario "${name}"? This cannot be undone.`)) {
    return;
  }

  const storage = new ScenarioStorage();
  storage.deleteScenario(name);

  refreshScenarioList();

  showNotification(`Scenario "${name}" deleted`, 'info');
}

/**
 * Refresh scenario list UI
 */
function refreshScenarioList() {
  const storage = new ScenarioStorage();
  const scenarios = storage.listScenarios();
  const container = document.querySelector('.scenario-list');

  // Keep baseline item
  let html = `
    <div class="scenario-item" data-scenario="baseline">
      <div class="scenario-info">
        <span class="scenario-name">Baseline (All Expenses)</span>
        <span class="scenario-date">Default</span>
      </div>
      <div class="scenario-summary">
        <span class="metric">End: ${formatCurrency(scenarioManager.baselineSummary.endingBalance)}</span>
        <span class="metric">NEG: ${scenarioManager.baselineSummary.flagCounts.NEG} days</span>
      </div>
    </div>
  `;

  // Add saved scenarios
  scenarios.forEach(scenario => {
    const date = new Date(scenario.timestamp).toLocaleDateString();
    html += `
      <div class="scenario-item" data-scenario="${scenario.name}">
        <div class="scenario-info">
          <span class="scenario-name">${scenario.name}</span>
          <span class="scenario-date">Saved ${date}</span>
        </div>
        <div class="scenario-summary">
          <span class="metric">End: ${formatCurrency(scenario.summary.endingBalance)}</span>
          <span class="metric">NEG: ${scenario.summary.negativeDays} days</span>
        </div>
        <div class="scenario-actions">
          <button class="load-btn" onclick="loadScenario('${scenario.name}')">Load</button>
          <button class="delete-btn" onclick="deleteScenario('${scenario.name}')">Delete</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Export scenarios to JSON file
 */
function exportScenarios() {
  const storage = new ScenarioStorage();
  storage.exportScenarios();
  showNotification('Scenarios exported successfully', 'success');
}

/**
 * Import scenarios from JSON file
 */
function importScenarios() {
  const input = document.getElementById('importFileInput');
  input.click();

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const storage = new ScenarioStorage();
      const count = storage.importScenarios(event.target.result);

      if (count > 0) {
        refreshScenarioList();
        showNotification(`Imported ${count} scenario(s)`, 'success');
      } else {
        showNotification('Import failed. Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);
  };
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
```

### Pre-built Scenario Presets

```javascript
const SCENARIO_PRESETS = {
  'survival': {
    name: 'Survival Mode',
    description: 'Pause all optional allocations to maximize cash',
    disableExpenses: ['savings', 'tithe', 'debt-payoff']
  },

  'aggressive': {
    name: 'Aggressive Paydown',
    description: 'Cut discretionary spending, keep debt payments',
    disableExpenses: [
      'savings', 'tithe', 'netflix', 'myfitnesspal',
      'eating-out', 'club-pilates', 'pliability'
    ]
  },

  'essential-only': {
    name: 'Essential Only',
    description: 'Keep only housing, utilities, insurance, minimum payments',
    disableExpenses: [
      'savings', 'tithe', 'debt-payoff', 'netflix', 'myfitnesspal',
      'eating-out', 'club-pilates', 'pliability', 'vitruvian-membership',
      'vitruvian-equipment', 'supplements', 'c3-baseball', 'groceries',
      'sleep-number', 'hexclad', 'ashley-venture', 'ashley-quicksilver',
      'container-store', 'merry-maids'
    ]
  },

  'pause-fitness': {
    name: 'Pause Fitness',
    description: 'Temporarily pause all fitness-related expenses',
    disableExpenses: [
      'vitruvian-membership', 'vitruvian-equipment', 'club-pilates',
      'pliability', 'myfitnesspal', 'c3-baseball'
    ]
  },

  'defer-furniture': {
    name: 'Defer Furniture',
    description: 'Pause furniture payments to free up cash',
    disableExpenses: [
      'sleep-number', 'hexclad', 'ashley-venture', 'ashley-quicksilver',
      'container-store'
    ]
  }
};
```

---

## Technical Implementation Summary

### Files to Modify

**1. `Financial/Cash Flow Forecasts/forecasts/dashboard.html`**
- Add expense control panel HTML structure (~200 lines)
- Embed `TRANSACTION_RULES` constant (~300 lines)
- Add JavaScript classes: `TransactionRuleEngine`, `ComparisonCalculator`, `ScenarioManager`, `ScenarioStorage` (~800 lines)
- Add event binding and UI update functions (~400 lines)
- Add CSS for new components (~300 lines)

**Total additions: ~2,000 lines to dashboard.html**

### Implementation Order

1. **Week 1: Foundation**
   - Phase 1: Build expense control panel UI
   - Convert `cash-flow-data.md` to `TRANSACTION_RULES` JavaScript object
   - Test static UI rendering

2. **Week 2: Calculation Engine**
   - Phase 2: Implement `TransactionRuleEngine` class
   - Implement `ComparisonCalculator` class
   - Write unit tests for calculation accuracy

3. **Week 3: Comparison View**
   - Phase 3: Build comparison cards UI
   - Implement chart overlay/split view
   - Build removed expenses summary

4. **Week 4: Real-Time Updates**
   - Phase 4: Implement `ScenarioManager` with event system
   - Bind checkbox events
   - Wire up all UI update handlers
   - Performance optimization (debouncing, virtual scrolling)

5. **Week 5: Scenario Management**
   - Phase 5: Implement `ScenarioStorage` with localStorage
   - Build save/load dialog UI
   - Add preset scenarios
   - Add import/export functionality

6. **Week 6: Testing & Polish**
   - End-to-end testing
   - Mobile responsiveness
   - Edge case handling
   - Documentation updates

---

## Questions & Decisions Needed

Before beginning implementation, please clarify:

### 1. Data Source Strategy
**Question:** Should I manually convert `cash-flow-data.md` to JavaScript constants, or build an auto-parser?

**Option A (Manual):** Fast to implement, works immediately, requires manual sync if data changes
**Option B (Auto-parser):** More complex, reads markdown dynamically, stays in sync automatically

**Recommendation:** Option A for initial release, Option B for v2

### 2. UI Layout Preference
**Question:** Where should the expense control panel be located?

**Option A:** Left sidebar (300px, collapsible)
**Option B:** Top panel (full width, expandable dropdown)
**Option C:** Right sidebar (300px, slides in on demand)

**Recommendation:** Option A (left sidebar) for desktop, converts to bottom sheet on mobile

### 3. Chart Comparison Display
**Question:** How should baseline vs modified forecasts be displayed?

**Option A:** Overlay both lines on same chart
**Option B:** Side-by-side split view
**Option C:** Toggle between them (single chart, switch button)

**Recommendation:** Option A with toggle to show/hide baseline line

### 4. Implementation Scope
**Question:** Should we implement all 5 phases in first release?

**Option A:** Phase 1-4 only (core functionality, no scenario saving)
**Option B:** All 5 phases (full feature set)
**Option C:** Phase 1-3 only (basic interactivity, no real-time updates)

**Recommendation:** Option A for MVP, Option B after user testing

### 5. Mobile Experience
**Question:** How should mobile users interact with the expense control panel?

**Option A:** Bottom sheet that slides up (covers half screen)
**Option B:** Separate page/view (navigate away from dashboard)
**Option C:** Accordion-style inline (expand/collapse within page)

**Recommendation:** Option A (bottom sheet) for best mobile UX

---

## Success Metrics

### Functional Requirements
- [ ] All expenses from `cash-flow-data.md` appear as toggleable checkboxes
- [ ] Toggling expenses recalculates forecast in <500ms
- [ ] Comparison view shows accurate before/after metrics
- [ ] Chart updates with modified forecast line
- [ ] Transaction table reflects disabled expenses
- [ ] Scenarios can be saved and loaded from localStorage

### User Experience Requirements
- [ ] UI is responsive on desktop, tablet, and mobile
- [ ] Visual feedback within 100ms of checkbox toggle
- [ ] Comparison deltas are color-coded (green=improvement, red=worse)
- [ ] No data loss when toggling multiple expenses rapidly
- [ ] Keyboard navigation works for accessibility

### Performance Requirements
- [ ] Full recalculation completes in <500ms for 60-day forecast
- [ ] UI updates complete in <200ms after calculation
- [ ] Page load time remains under 2 seconds
- [ ] localStorage operations complete in <50ms
- [ ] No memory leaks during extended use

---

## Risk Mitigation

### Technical Risks

**Risk 1: Calculation Accuracy**
- Mitigation: Write comprehensive unit tests comparing against agent output
- Validation: Run side-by-side comparison with forecast-calculator-agent results

**Risk 2: Performance Degradation**
- Mitigation: Implement debouncing, memoization, and virtual scrolling
- Validation: Load test with rapid checkbox toggling

**Risk 3: Data Sync Issues**
- Mitigation: Add data version tracking, provide clear "refresh data" button
- Validation: Test with modified `cash-flow-data.md` file

**Risk 4: Browser Compatibility**
- Mitigation: Use standard ES6+ features supported by modern browsers
- Validation: Test on Chrome, Firefox, Safari, Edge

**Risk 5: LocalStorage Limits**
- Mitigation: Compress scenario data, provide export/import fallback
- Validation: Test with 50+ saved scenarios

---

## Future Enhancements (Post-MVP)

### Phase 6: Advanced Features
- **What-if Income Changes**: Toggle income sources on/off
- **Date Shifting**: Drag-and-drop to reschedule bill payments
- **Goal Setting**: Define target ending balance, auto-suggest expenses to cut
- **AI Recommendations**: Machine learning to suggest optimal expense combinations
- **Multi-Month Forecasts**: Extend beyond 2 months (3, 6, 12 month views)

### Phase 7: Collaboration Features
- **Share Scenarios**: Generate shareable links for scenarios
- **Family Mode**: Multiple user profiles with shared expenses
- **Budget Templates**: Pre-built scenario templates for common situations
- **Comparison Reports**: PDF export of baseline vs modified comparison

### Phase 8: Integration Features
- **Bank Auto-Sync**: Connect to bank APIs for real balance updates
- **Bill Reminder Integration**: Sync with calendar apps
- **Credit Score Impact**: Show how debt payoff affects credit score
- **Tax Projection**: Estimate tax implications of financial decisions

---

## Phase 6: Testing Strategy

### Objective
Implement comprehensive testing to ensure calculation accuracy, UI reliability, and cross-browser compatibility.

### Testing Architecture

```
Testing Pyramid
├── Unit Tests (Jest) ─────────────── 70% coverage
│   ├── TransactionRuleEngine
│   ├── ComparisonCalculator
│   ├── ScenarioManager
│   └── ScenarioStorage
├── Integration Tests (Jest) ──────── 20% coverage
│   ├── Full calculation pipeline
│   ├── UI event → calculation → render
│   └── localStorage persistence
└── E2E Tests (Playwright) ────────── 10% coverage
    ├── User workflows
    ├── Visual regression
    └── Cross-browser compatibility
```

---

### A. Unit Tests (Jest)

#### Setup: `tests/unit/setup.js`

```javascript
// Mock localStorage for Node.js environment
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Load transaction rules from data file
import fs from 'fs';
import path from 'path';

const dataPath = path.join(__dirname, '../../data/cash-flow-data.md');
global.TRANSACTION_RULES = parseTransactionDataFile(dataPath);

function parseTransactionDataFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Parser implementation to convert markdown to TRANSACTION_RULES object
  // ... (parsing logic)
}
```

#### Test Suite 1: `tests/unit/TransactionRuleEngine.test.js`

```javascript
import { TransactionRuleEngine } from '../../src/TransactionRuleEngine';

describe('TransactionRuleEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new TransactionRuleEngine(TRANSACTION_RULES, '2025-11-20', 1362.00);
  });

  describe('Forecast Period Calculation', () => {
    test('should calculate correct period from mid-month (Nov 20)', () => {
      expect(engine.forecastPeriod.start.toISOString().split('T')[0]).toBe('2025-11-21');
      expect(engine.forecastPeriod.end.toISOString().split('T')[0]).toBe('2025-12-31');
    });

    test('should calculate correct period from month-end (Nov 30)', () => {
      const endEngine = new TransactionRuleEngine(TRANSACTION_RULES, '2025-11-30', 1000);
      expect(endEngine.forecastPeriod.start.toISOString().split('T')[0]).toBe('2025-12-01');
      expect(endEngine.forecastPeriod.end.toISOString().split('T')[0]).toBe('2026-01-31');
    });

    test('should calculate correct period from start of month (Dec 1)', () => {
      const startEngine = new TransactionRuleEngine(TRANSACTION_RULES, '2025-12-01', 1000);
      expect(startEngine.forecastPeriod.start.toISOString().split('T')[0]).toBe('2025-12-02');
      expect(startEngine.forecastPeriod.end.toISOString().split('T')[0]).toBe('2026-01-31');
    });

    test('should handle leap year correctly (Feb 2024)', () => {
      const leapEngine = new TransactionRuleEngine(TRANSACTION_RULES, '2024-02-15', 1000);
      const endDate = leapEngine.forecastPeriod.end;
      // Feb 2024 has 29 days, March has 31
      const totalDays = Math.floor((endDate - leapEngine.forecastPeriod.start) / (1000 * 60 * 60 * 24)) + 1;
      expect(totalDays).toBe(14 + 31); // Rest of Feb + all of March
    });
  });

  describe('Biweekly Date Calculation', () => {
    test('should return true on exact anchor date', () => {
      const anchorDate = new Date('2025-08-08');
      expect(engine.isBiweeklyDue(anchorDate, '2025-08-08')).toBe(true);
    });

    test('should return true exactly 14 days after anchor', () => {
      const day14 = new Date('2025-08-22');
      expect(engine.isBiweeklyDue(day14, '2025-08-08')).toBe(true);
    });

    test('should return true exactly 28 days after anchor', () => {
      const day28 = new Date('2025-09-05');
      expect(engine.isBiweeklyDue(day28, '2025-08-08')).toBe(true);
    });

    test('should return false on non-cycle days', () => {
      const day7 = new Date('2025-08-15');
      expect(engine.isBiweeklyDue(day7, '2025-08-08')).toBe(false);

      const day10 = new Date('2025-08-18');
      expect(engine.isBiweeklyDue(day10, '2025-08-08')).toBe(false);
    });

    test('should return false before anchor date', () => {
      const beforeAnchor = new Date('2025-08-01');
      expect(engine.isBiweeklyDue(beforeAnchor, '2025-08-08')).toBe(false);
    });

    test('should handle anchor dates far in the past', () => {
      const futureDate = new Date('2026-01-01');
      expect(engine.isBiweeklyDue(futureDate, '2025-04-24')).toBe(true); // Should be on cycle
    });
  });

  describe('Transaction Retrieval for Specific Days', () => {
    test('should include monthly bill on correct day of month', () => {
      const dec5 = new Date('2025-12-05');
      const txns = engine.getTransactionsForDay(dec5, new Set());

      expect(txns.debits).toContainEqual(
        expect.objectContaining({
          id: 'loancare-mortgage',
          amount: 3566.24
        })
      );
    });

    test('should exclude disabled monthly bill', () => {
      const dec5 = new Date('2025-12-05');
      const disabled = new Set(['loancare-mortgage']);
      const txns = engine.getTransactionsForDay(dec5, disabled);

      expect(txns.debits).not.toContainEqual(
        expect.objectContaining({ id: 'loancare-mortgage' })
      );
    });

    test('should include weekday recurring only Mon-Fri', () => {
      // Monday Dec 2, 2025
      const monday = new Date('2025-12-02');
      const mondayTxns = engine.getTransactionsForDay(monday, new Set());
      expect(mondayTxns.debits).toContainEqual(
        expect.objectContaining({ id: 'nfcu-volvo', amount: 33 })
      );

      // Saturday Dec 6, 2025
      const saturday = new Date('2025-12-06');
      const satTxns = engine.getTransactionsForDay(saturday, new Set());
      expect(satTxns.debits).not.toContainEqual(
        expect.objectContaining({ id: 'nfcu-volvo' })
      );

      // Sunday Dec 7, 2025
      const sunday = new Date('2025-12-07');
      const sunTxns = engine.getTransactionsForDay(sunday, new Set());
      expect(sunTxns.debits).not.toContainEqual(
        expect.objectContaining({ id: 'nfcu-volvo' })
      );
    });

    test('should include Friday allocations only on Fridays', () => {
      // Friday Dec 5, 2025
      const friday = new Date('2025-12-05');
      const friTxns = engine.getTransactionsForDay(friday, new Set());
      expect(friTxns.debits).toContainEqual(
        expect.objectContaining({ id: 'savings', amount: 200 })
      );
      expect(friTxns.debits).toContainEqual(
        expect.objectContaining({ id: 'tithe', amount: 100 })
      );
      expect(friTxns.debits).toContainEqual(
        expect.objectContaining({ id: 'debt-payoff', amount: 1000 })
      );

      // Thursday Dec 4, 2025
      const thursday = new Date('2025-12-04');
      const thuTxns = engine.getTransactionsForDay(thursday, new Set());
      expect(thuTxns.debits).not.toContainEqual(
        expect.objectContaining({ id: 'savings' })
      );
    });

    test('should include biweekly bills on cycle days', () => {
      // Dec 5, 2025 is 14-day cycle from anchor 2025-12-05
      const dec5 = new Date('2025-12-05');
      const txns = engine.getTransactionsForDay(dec5, new Set());
      expect(txns.credits).toContainEqual(
        expect.objectContaining({ id: 'claritev', amount: 3500 })
      );
    });

    test('should handle multiple bills on same day', () => {
      // Day 1 has multiple monthly bills
      const dec1 = new Date('2025-12-01');
      const txns = engine.getTransactionsForDay(dec1, new Set());

      expect(txns.debits.length).toBeGreaterThan(3);
      expect(txns.debits).toContainEqual(
        expect.objectContaining({ id: 'vitruvian-membership' })
      );
      expect(txns.debits).toContainEqual(
        expect.objectContaining({ id: 'transamerica' })
      );
      expect(txns.debits).toContainEqual(
        expect.objectContaining({ id: 'apple-card' })
      );
    });
  });

  describe('Full Forecast Calculation', () => {
    test('should match forecast-calculator-agent output', () => {
      // Load reference output from agent-generated forecast
      const agentForecast = require('../fixtures/agent-forecast-2025-11-20.json');

      const jsForecast = engine.calculateDailyForecast(new Set());

      // Compare each day
      jsForecast.forEach((day, index) => {
        expect(day.endBalance).toBeCloseTo(agentForecast[index].endBalance, 2);
        expect(day.debits).toBeCloseTo(agentForecast[index].debits, 2);
        expect(day.credits).toBeCloseTo(agentForecast[index].credits, 2);
        expect(day.flag).toBe(agentForecast[index].flag);
      });
    });

    test('should have no gaps in date sequence', () => {
      const forecast = engine.calculateDailyForecast(new Set());

      for (let i = 1; i < forecast.length; i++) {
        const prevDate = new Date(forecast[i - 1].date + 'T12:00:00');
        const currDate = new Date(forecast[i].date + 'T12:00:00');
        const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBe(1);
      }
    });

    test('should correctly flag LOW balances (<$500)', () => {
      const forecast = engine.calculateDailyForecast(new Set());

      forecast.forEach(day => {
        if (day.endBalance >= 0 && day.endBalance < 500) {
          expect(day.flag).toBe('LOW');
        }
      });
    });

    test('should correctly flag NEG balances (<$0)', () => {
      const forecast = engine.calculateDailyForecast(new Set());

      forecast.forEach(day => {
        if (day.endBalance < 0) {
          expect(day.flag).toBe('NEG');
        }
      });
    });

    test('should have no flag for healthy balances (≥$500)', () => {
      const forecast = engine.calculateDailyForecast(new Set());

      forecast.forEach(day => {
        if (day.endBalance >= 500) {
          expect(day.flag).toBe('');
        }
      });
    });

    test('should maintain balance continuity (today end = tomorrow start)', () => {
      const forecast = engine.calculateDailyForecast(new Set());

      for (let i = 0; i < forecast.length - 1; i++) {
        const todayEnd = forecast[i].endBalance;
        const tomorrowStart = todayEnd + forecast[i + 1].credits - forecast[i + 1].debits;
        const tomorrowEnd = forecast[i + 1].endBalance;

        expect(tomorrowEnd).toBeCloseTo(tomorrowStart, 2);
      }
    });

    test('should respect disabled expenses throughout forecast', () => {
      const disabled = new Set(['savings', 'tithe', 'debt-payoff']);
      const forecast = engine.calculateDailyForecast(disabled);

      // No day should have Savings, Tithe, or Debt Payoff in debit names
      forecast.forEach(day => {
        expect(day.debitNames).not.toContain('Savings');
        expect(day.debitNames).not.toContain('Tithe');
        expect(day.debitNames).not.toContain('Debt Payoff');
      });
    });

    test('should improve balances when expenses removed', () => {
      const baseline = engine.calculateDailyForecast(new Set());
      const modified = engine.calculateDailyForecast(new Set(['savings', 'tithe', 'debt-payoff']));

      // Every day's balance should be higher in modified forecast
      modified.forEach((day, index) => {
        expect(day.endBalance).toBeGreaterThan(baseline[index].endBalance);
      });
    });
  });

  describe('Summary Statistics', () => {
    test('should calculate correct summary metrics', () => {
      const forecast = engine.calculateDailyForecast(new Set());
      const summary = engine.calculateSummary(forecast);

      expect(summary.startingBalance).toBe(1362.00);
      expect(summary.endingBalance).toBe(forecast[forecast.length - 1].endBalance);
      expect(summary.netChange).toBe(summary.endingBalance - summary.startingBalance);
    });

    test('should identify lowest balance point', () => {
      const forecast = engine.calculateDailyForecast(new Set());
      const summary = engine.calculateSummary(forecast);

      const lowestInForecast = Math.min(...forecast.map(d => d.endBalance));
      expect(summary.lowestPoint.balance).toBe(lowestInForecast);
    });

    test('should count flagged days correctly', () => {
      const forecast = engine.calculateDailyForecast(new Set());
      const summary = engine.calculateSummary(forecast);

      const negCount = forecast.filter(d => d.flag === 'NEG').length;
      const lowCount = forecast.filter(d => d.flag === 'LOW').length;

      expect(summary.flagCounts.NEG).toBe(negCount);
      expect(summary.flagCounts.LOW).toBe(lowCount);
    });
  });
});
```

#### Test Suite 2: `tests/unit/ComparisonCalculator.test.js`

```javascript
import { ComparisonCalculator } from '../../src/ComparisonCalculator';

describe('ComparisonCalculator', () => {
  let baseline, modified, calculator;

  beforeEach(() => {
    baseline = [
      { date: '2025-12-01', debits: 100, credits: 0, endBalance: 900, flag: '' },
      { date: '2025-12-02', debits: 500, credits: 0, endBalance: 400, flag: 'LOW' },
      { date: '2025-12-03', debits: 600, credits: 0, endBalance: -200, flag: 'NEG' },
      { date: '2025-12-04', debits: 100, credits: 1000, endBalance: 700, flag: '' }
    ];

    modified = [
      { date: '2025-12-01', debits: 100, credits: 0, endBalance: 900, flag: '' },
      { date: '2025-12-02', debits: 200, credits: 0, endBalance: 700, flag: '' },
      { date: '2025-12-03', debits: 300, credits: 0, endBalance: 400, flag: 'LOW' },
      { date: '2025-12-04', debits: 100, credits: 1000, endBalance: 1300, flag: '' }
    ];

    calculator = new ComparisonCalculator(baseline, modified);
  });

  test('should calculate total expenses removed', () => {
    const removed = calculator.getTotalRemoved();
    // (100+500+600+100) - (100+200+300+100) = 1300 - 700 = 600
    expect(removed).toBe(600);
  });

  test('should detect ending balance improvement', () => {
    const change = calculator.getEndingBalanceChange();
    expect(change.before).toBe(700);
    expect(change.after).toBe(1300);
    expect(change.delta).toBe(600);
    expect(change.improved).toBe(true);
  });

  test('should detect ending balance decline', () => {
    const worseModified = baseline.map(d => ({
      ...d,
      endBalance: d.endBalance - 500
    }));
    const worseCalc = new ComparisonCalculator(baseline, worseModified);
    const change = worseCalc.getEndingBalanceChange();

    expect(change.improved).toBe(false);
    expect(change.delta).toBeLessThan(0);
  });

  test('should count negative days reduction', () => {
    const change = calculator.getNegativeDaysChange();
    expect(change.before).toBe(1); // Day 3 is NEG
    expect(change.after).toBe(0);  // No NEG days in modified
    expect(change.delta).toBe(1);
    expect(change.eliminated).toBe(true);
  });

  test('should detect when negative days not eliminated', () => {
    const stillNeg = [...modified];
    stillNeg[2].flag = 'NEG';
    stillNeg[2].endBalance = -50;

    const calc = new ComparisonCalculator(baseline, stillNeg);
    const change = calc.getNegativeDaysChange();

    expect(change.eliminated).toBe(false);
  });

  test('should calculate lowest balance improvement', () => {
    const change = calculator.getLowestBalanceChange();
    expect(change.before).toBe(-200);
    expect(change.after).toBe(400);
    expect(change.improvement).toBe(600);
    expect(change.improved).toBe(true);
  });

  test('should detect status change from NEGATIVE to HEALTHY', () => {
    const change = calculator.getStatusChange();
    expect(change.before).toBe('NEGATIVE');
    expect(change.after).toBe('CAUTION'); // Has LOW day
    expect(change.improved).toBe(true);
  });

  test('should detect status change from NEGATIVE to HEALTHY (no flags)', () => {
    const healthy = modified.map(d => ({ ...d, flag: '', endBalance: Math.abs(d.endBalance) + 500 }));
    const calc = new ComparisonCalculator(baseline, healthy);
    const change = calc.getStatusChange();

    expect(change.before).toBe('NEGATIVE');
    expect(change.after).toBe('HEALTHY');
    expect(change.improved).toBe(true);
  });

  test('should generate full comparison report', () => {
    const report = calculator.getFullComparison();

    expect(report).toHaveProperty('totalRemoved');
    expect(report).toHaveProperty('endingBalance');
    expect(report).toHaveProperty('negativeDays');
    expect(report).toHaveProperty('lowestBalance');
    expect(report).toHaveProperty('status');

    expect(report.totalRemoved).toBe(600);
    expect(report.endingBalance.improved).toBe(true);
    expect(report.negativeDays.eliminated).toBe(true);
    expect(report.status.improved).toBe(true);
  });
});
```

#### Test Suite 3: `tests/unit/ScenarioManager.test.js`

```javascript
import { ScenarioManager } from '../../src/ScenarioManager';

describe('ScenarioManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ScenarioManager(TRANSACTION_RULES, '2025-11-20', 1362.00);
  });

  test('should initialize with baseline forecast', () => {
    expect(manager.baselineForecast).toBeDefined();
    expect(manager.baselineForecast.length).toBeGreaterThan(0);
    expect(manager.disabledExpenses.size).toBe(0);
    expect(manager.modifiedForecast).toEqual(manager.baselineForecast);
  });

  test('should toggle expense on', () => {
    manager.toggleExpense('savings');
    expect(manager.disabledExpenses.has('savings')).toBe(true);
  });

  test('should toggle expense off', () => {
    manager.toggleExpense('savings');
    expect(manager.disabledExpenses.has('savings')).toBe(true);

    manager.toggleExpense('savings');
    expect(manager.disabledExpenses.has('savings')).toBe(false);
  });

  test('should recalculate when expense toggled', () => {
    const initialEnd = manager.modifiedForecast[manager.modifiedForecast.length - 1].endBalance;

    manager.toggleExpense('savings'); // Remove $200/week * ~6 weeks

    const newEnd = manager.modifiedForecast[manager.modifiedForecast.length - 1].endBalance;
    expect(newEnd).toBeGreaterThan(initialEnd);
  });

  test('should notify listeners on change', (done) => {
    manager.addListener((data) => {
      expect(data.disabledExpenses).toContain('tithe');
      expect(data.comparison).toBeDefined();
      done();
    });

    manager.toggleExpense('tithe');
  });

  test('should handle multiple listeners', () => {
    const calls = { listener1: 0, listener2: 0 };

    manager.addListener(() => calls.listener1++);
    manager.addListener(() => calls.listener2++);

    manager.toggleExpense('savings');

    expect(calls.listener1).toBe(1);
    expect(calls.listener2).toBe(1);
  });

  test('should reset to baseline', () => {
    manager.disableExpense('savings');
    manager.disableExpense('tithe');
    manager.disableExpense('debt-payoff');
    expect(manager.disabledExpenses.size).toBe(3);

    manager.resetToBaseline();
    expect(manager.disabledExpenses.size).toBe(0);
    expect(manager.modifiedForecast).toEqual(manager.baselineForecast);
  });

  test('should apply survival mode preset', () => {
    manager.applyPreset('survival');
    expect(manager.disabledExpenses.has('savings')).toBe(true);
    expect(manager.disabledExpenses.has('tithe')).toBe(true);
    expect(manager.disabledExpenses.has('debt-payoff')).toBe(true);
  });

  test('should apply aggressive preset', () => {
    manager.applyPreset('aggressive');
    expect(manager.disabledExpenses.has('netflix')).toBe(true);
    expect(manager.disabledExpenses.has('eating-out')).toBe(true);
  });

  test('should clear previous expenses when applying preset', () => {
    manager.disableExpense('sleep-number');
    expect(manager.disabledExpenses.has('sleep-number')).toBe(true);

    manager.applyPreset('survival');
    expect(manager.disabledExpenses.has('sleep-number')).toBe(false);
  });

  test('should generate accurate comparison', () => {
    manager.toggleExpense('savings');
    manager.toggleExpense('tithe');

    const comparison = manager.getComparison();

    expect(comparison.totalRemoved).toBeGreaterThan(0);
    expect(comparison.endingBalance.improved).toBe(true);
  });
});
```

#### Test Suite 4: `tests/unit/ScenarioStorage.test.js`

```javascript
import { ScenarioStorage } from '../../src/ScenarioStorage';

describe('ScenarioStorage', () => {
  let storage;

  beforeEach(() => {
    storage = new ScenarioStorage();
    localStorage.clear();
  });

  test('should save scenario to localStorage', () => {
    const disabledExpenses = new Set(['savings', 'tithe']);
    const summary = { endingBalance: 5000, negativeDays: 0, lowestBalance: 500, totalRemoved: 1200 };

    const result = storage.saveScenario('test-scenario', disabledExpenses, summary);
    expect(result).toBe(true);

    const saved = localStorage.getItem('cashflow-scenarios');
    expect(saved).toBeDefined();
    expect(JSON.parse(saved)).toHaveProperty('test-scenario');
  });

  test('should load saved scenario', () => {
    const disabledExpenses = new Set(['savings', 'tithe']);
    const summary = { endingBalance: 5000, negativeDays: 0 };

    storage.saveScenario('test-scenario', disabledExpenses, summary);

    const loaded = storage.loadScenario('test-scenario');
    expect(loaded).toBeDefined();
    expect(loaded.disabledExpenses).toEqual(['savings', 'tithe']);
    expect(loaded.summary.endingBalance).toBe(5000);
  });

  test('should return null for non-existent scenario', () => {
    const loaded = storage.loadScenario('does-not-exist');
    expect(loaded).toBeNull();
  });

  test('should list all scenarios', () => {
    storage.saveScenario('scenario-1', new Set(['savings']), {});
    storage.saveScenario('scenario-2', new Set(['tithe']), {});
    storage.saveScenario('scenario-3', new Set(['debt-payoff']), {});

    const list = storage.listScenarios();
    expect(list.length).toBe(3);
    expect(list.map(s => s.name)).toContain('scenario-1');
    expect(list.map(s => s.name)).toContain('scenario-2');
    expect(list.map(s => s.name)).toContain('scenario-3');
  });

  test('should include timestamps in scenario list', () => {
    storage.saveScenario('timestamped', new Set(), {});
    const list = storage.listScenarios();

    const scenario = list.find(s => s.name === 'timestamped');
    expect(scenario.timestamp).toBeDefined();
    expect(new Date(scenario.timestamp).getTime()).toBeCloseTo(Date.now(), -3);
  });

  test('should delete scenario', () => {
    storage.saveScenario('temp-scenario', new Set(), {});
    expect(storage.loadScenario('temp-scenario')).toBeDefined();

    const result = storage.deleteScenario('temp-scenario');
    expect(result).toBe(true);
    expect(storage.loadScenario('temp-scenario')).toBeNull();
  });

  test('should overwrite existing scenario', () => {
    storage.saveScenario('duplicate', new Set(['savings']), { endingBalance: 1000 });
    storage.saveScenario('duplicate', new Set(['tithe']), { endingBalance: 2000 });

    const loaded = storage.loadScenario('duplicate');
    expect(loaded.disabledExpenses).toEqual(['tithe']);
    expect(loaded.summary.endingBalance).toBe(2000);
  });

  test('should handle export/import cycle', () => {
    storage.saveScenario('export-test', new Set(['savings']), { endingBalance: 1000 });
    storage.saveScenario('export-test-2', new Set(['tithe']), { endingBalance: 2000 });

    const exported = storage.loadAllScenarios();
    const exportedJson = JSON.stringify(exported);

    localStorage.clear();

    const count = storage.importScenarios(exportedJson);
    expect(count).toBe(2);

    const reimported1 = storage.loadScenario('export-test');
    expect(reimported1.disabledExpenses).toEqual(['savings']);

    const reimported2 = storage.loadScenario('export-test-2');
    expect(reimported2.disabledExpenses).toEqual(['tithe']);
  });

  test('should handle invalid JSON on import', () => {
    const count = storage.importScenarios('invalid json {{{');
    expect(count).toBe(0);
  });

  test('should preserve existing scenarios on import', () => {
    storage.saveScenario('existing', new Set(['savings']), {});

    const toImport = JSON.stringify({
      'imported': {
        disabledExpenses: ['tithe'],
        summary: {},
        timestamp: new Date().toISOString()
      }
    });

    storage.importScenarios(toImport);

    expect(storage.loadScenario('existing')).toBeDefined();
    expect(storage.loadScenario('imported')).toBeDefined();
  });
});
```

---

### B. Integration Tests (Jest)

#### Test Suite: `tests/integration/calculation-pipeline.test.js`

```javascript
import { TransactionRuleEngine } from '../../src/TransactionRuleEngine';
import { ComparisonCalculator } from '../../src/ComparisonCalculator';
import { ScenarioManager } from '../../src/ScenarioManager';

describe('Calculation Pipeline Integration', () => {
  test('should flow from engine → calculator → comparison correctly', () => {
    const engine = new TransactionRuleEngine(TRANSACTION_RULES, '2025-11-20', 1362);

    const baseline = engine.calculateDailyForecast(new Set());
    const modified = engine.calculateDailyForecast(new Set(['savings', 'tithe', 'debt-payoff']));

    const calculator = new ComparisonCalculator(baseline, modified);
    const comparison = calculator.getFullComparison();

    expect(comparison.totalRemoved).toBeGreaterThan(0);
    expect(comparison.endingBalance.improved).toBe(true);
    expect(comparison.negativeDays.delta).toBeGreaterThanOrEqual(0);
  });

  test('should maintain consistency through scenario manager', () => {
    const manager = new ScenarioManager(TRANSACTION_RULES, '2025-11-20', 1362);

    // Baseline
    const baselineEnd = manager.baselineForecast[manager.baselineForecast.length - 1].endBalance;

    // Modify
    manager.toggleExpense('savings');
    const modifiedEnd = manager.modifiedForecast[manager.modifiedForecast.length - 1].endBalance;

    // Compare
    const comparison = manager.getComparison();

    expect(comparison.endingBalance.before).toBe(baselineEnd);
    expect(comparison.endingBalance.after).toBe(modifiedEnd);
    expect(comparison.endingBalance.delta).toBe(modifiedEnd - baselineEnd);
  });

  test('should handle multiple expense toggles correctly', () => {
    const manager = new ScenarioManager(TRANSACTION_RULES, '2025-11-20', 1362);

    manager.toggleExpense('savings');
    const after1 = manager.modifiedForecast[manager.modifiedForecast.length - 1].endBalance;

    manager.toggleExpense('tithe');
    const after2 = manager.modifiedForecast[manager.modifiedForecast.length - 1].endBalance;

    manager.toggleExpense('debt-payoff');
    const after3 = manager.modifiedForecast[manager.modifiedForecast.length - 1].endBalance;

    expect(after2).toBeGreaterThan(after1);
    expect(after3).toBeGreaterThan(after2);
  });
});
```

---

### C. End-to-End Tests (Playwright)

#### Test Suite: `tests/e2e/scenario-planner.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Interactive Scenario Planner E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/forecasts/dashboard.html');
    await page.waitForLoadState('networkidle');

    // Wait for JavaScript initialization
    await page.waitForFunction(() => window.scenarioManager !== undefined);
  });

  test('should load dashboard with baseline data', async ({ page }) => {
    await expect(page.locator('.header h1')).toContainText('Cash Flow Dashboard');

    // Check transaction table loaded
    const rows = await page.locator('#transactionTable table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/01-baseline-loaded.png', fullPage: true });
  });

  test('should toggle expense and show updated balance', async ({ page }) => {
    // Get initial ending balance
    const initialBalance = await page.locator('#endingBalance .modified-value .value').textContent();

    // Toggle Savings checkbox
    await page.locator('[data-expense-id="savings"]').uncheck();

    // Wait for recalculation (debounced 300ms)
    await page.waitForTimeout(500);

    // Get new ending balance
    const newBalance = await page.locator('#endingBalance .modified-value .value').textContent();

    // Parse and compare
    const initial = parseFloat(initialBalance.replace(/[$,]/g, ''));
    const updated = parseFloat(newBalance.replace(/[$,]/g, ''));
    expect(updated).toBeGreaterThan(initial);

    await page.screenshot({ path: 'tests/screenshots/02-savings-removed.png', fullPage: true });
  });

  test('should show comparison metrics', async ({ page }) => {
    await page.locator('[data-expense-id="savings"]').uncheck();
    await page.locator('[data-expense-id="tithe"]').uncheck();
    await page.waitForTimeout(500);

    // Check comparison cards visible
    await expect(page.locator('.comparison-grid')).toBeVisible();
    await expect(page.locator('#endingBalance .delta-badge')).toBeVisible();

    // Check delta is positive
    const deltaText = await page.locator('#endingBalance .delta-amount').textContent();
    expect(deltaText).toContain('+');

    await page.screenshot({ path: 'tests/screenshots/03-comparison-visible.png', fullPage: true });
  });

  test('should update chart with modified forecast', async ({ page }) => {
    // Screenshot baseline chart
    await page.locator('#balanceChart').screenshot({ path: 'tests/screenshots/04a-chart-baseline.png' });

    // Remove expense
    await page.locator('[data-expense-id="sleep-number"]').uncheck();
    await page.waitForTimeout(500);

    // Screenshot modified chart
    await page.locator('#balanceChart').screenshot({ path: 'tests/screenshots/04b-chart-modified.png' });

    // Verify chart legend shows both lines
    const canvas = await page.locator('#balanceChart');
    expect(canvas).toBeVisible();
  });

  test('should save and load scenario', async ({ page }) => {
    // Create scenario
    await page.locator('[data-expense-id="savings"]').uncheck();
    await page.locator('[data-expense-id="tithe"]').uncheck();
    await page.waitForTimeout(500);

    // Open save dialog
    await page.locator('#saveScenario').click();
    await expect(page.locator('#saveScenarioDialog')).toBeVisible();

    // Enter name
    await page.locator('#scenarioName').fill('E2E Test Scenario');

    await page.screenshot({ path: 'tests/screenshots/05-save-dialog.png' });

    // Save
    await page.locator('#confirmSaveBtn').click();
    await page.waitForTimeout(200);

    // Reset to baseline
    await page.locator('#resetToBaseline').click();
    await page.waitForTimeout(500);

    // Verify checkboxes reset
    await expect(page.locator('[data-expense-id="savings"]')).toBeChecked();
    await expect(page.locator('[data-expense-id="tithe"]')).toBeChecked();

    // Load saved scenario
    await page.locator('[data-scenario="E2E Test Scenario"] .load-btn').click();
    await page.waitForTimeout(500);

    // Verify checkboxes restored
    await expect(page.locator('[data-expense-id="savings"]')).not.toBeChecked();
    await expect(page.locator('[data-expense-id="tithe"]')).not.toBeChecked();

    await page.screenshot({ path: 'tests/screenshots/06-scenario-loaded.png', fullPage: true });
  });

  test('should apply preset scenarios', async ({ page }) => {
    await page.locator('[data-preset="survival"]').click();
    await page.waitForTimeout(500);

    // Verify survival mode disables correct expenses
    await expect(page.locator('[data-expense-id="savings"]')).not.toBeChecked();
    await expect(page.locator('[data-expense-id="tithe"]')).not.toBeChecked();
    await expect(page.locator('[data-expense-id="debt-payoff"]')).not.toBeChecked();

    await page.screenshot({ path: 'tests/screenshots/07-preset-survival.png', fullPage: true });
  });

  test('should be mobile responsive', async ({ page, context }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    // Control panel should be collapsed initially on mobile
    const panel = page.locator('.control-panel');
    await expect(panel).toHaveClass(/collapsed/);

    // Open panel
    await page.locator('#togglePanel').click();
    await expect(panel).not.toHaveClass(/collapsed/);

    await page.screenshot({ path: 'tests/screenshots/08-mobile-panel-open.png', fullPage: true });

    // Toggle expense
    await page.locator('[data-expense-id="netflix"]').uncheck();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'tests/screenshots/09-mobile-expense-toggled.png', fullPage: true });
  });

  test('should handle rapid checkbox toggling', async ({ page }) => {
    const expenses = ['savings', 'tithe', 'debt-payoff', 'netflix', 'myfitnesspal'];

    // Rapidly toggle multiple checkboxes
    for (const id of expenses) {
      await page.locator(`[data-expense-id="${id}"]`).uncheck();
    }

    // Wait for debounced recalculation
    await page.waitForTimeout(1000);

    // Should not show error
    await expect(page.locator('.error-message')).not.toBeVisible();

    // Should show updated balance
    const balance = await page.locator('#endingBalance .modified-value .value').textContent();
    expect(balance).not.toBe('$0.00');

    await page.screenshot({ path: 'tests/screenshots/10-rapid-toggles.png', fullPage: true });
  });

  test('should persist dark mode preference', async ({ page }) => {
    // Enable dark mode
    await page.locator('#themeToggle').click();
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    await page.screenshot({ path: 'tests/screenshots/11-dark-mode.png', fullPage: true });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Dark mode should persist
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });
});
```

#### Visual Regression Tests: `tests/e2e/visual-regression.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('baseline dashboard snapshot', async ({ page }) => {
    await page.goto('http://localhost:8080/forecasts/dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.scenarioManager !== undefined);

    await expect(page).toHaveScreenshot('baseline-full.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.scenario-date')] // Mask dynamic timestamps
    });
  });

  test('survival mode preset snapshot', async ({ page }) => {
    await page.goto('http://localhost:8080/forecasts/dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.scenarioManager !== undefined);

    await page.locator('[data-preset="survival"]').click();
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('survival-mode.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('comparison view snapshot', async ({ page }) => {
    await page.goto('http://localhost:8080/forecasts/dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.scenarioManager !== undefined);

    await page.locator('[data-expense-id="savings"]').uncheck();
    await page.locator('[data-expense-id="tithe"]').uncheck();
    await page.locator('[data-expense-id="debt-payoff"]').uncheck();
    await page.waitForTimeout(500);

    await expect(page.locator('.comparison-grid')).toHaveScreenshot('comparison-cards.png');
  });
});
```

---

### D. Test Fixtures

#### `tests/fixtures/agent-forecast-2025-11-20.json`

```json
[
  {
    "date": "2025-11-21",
    "debits": 33.00,
    "credits": 500.00,
    "netChange": 467.00,
    "endBalance": 1829.00,
    "flag": "",
    "debitNames": "NFCU Volvo Loan",
    "creditNames": "Early Acrisure Transfer"
  },
  {
    "date": "2025-11-22",
    "debits": 713.13,
    "credits": 0.00,
    "netChange": -713.13,
    "endBalance": 1115.87,
    "flag": "",
    "debitNames": "pliability, Loan (Feb 17, 2022), Loan (Mar 19, 2025), NFCU Volvo Loan",
    "creditNames": ""
  }
  // ... (full 42-day forecast)
]
```

---

### E. Test Execution Scripts

#### `package.json` test scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "jest tests/unit --coverage",
    "test:integration": "jest tests/integration",
    "test:e2e": "playwright test tests/e2e",
    "test:e2e:ui": "playwright test tests/e2e --ui",
    "test:visual": "playwright test tests/e2e/visual-regression.spec.js",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --coverageReporters=html",
    "test:ci": "jest --ci --coverage && playwright test --reporter=html"
  }
}
```

#### `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ]
};
```

#### `playwright.config.js`

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### F. Continuous Integration

#### `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Install Playwright browsers
      run: npx playwright install --with-deps

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          coverage/
          playwright-report/
          tests/screenshots/
```

---

### G. Test Coverage Goals

| Component | Target Coverage | Priority |
|-----------|----------------|----------|
| TransactionRuleEngine | 95% | Critical |
| ComparisonCalculator | 90% | High |
| ScenarioManager | 85% | High |
| ScenarioStorage | 80% | Medium |
| UI Event Handlers | 70% | Medium |
| Helper Functions | 80% | Medium |

---

## Appendix

### A. Helper Functions

```javascript
/**
 * Format currency with $ sign and commas
 */
function formatCurrency(amount) {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format date as "Mon DD (Day)"
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()} (${days[date.getDay()]})`;
}

/**
 * Find expense by ID across all categories
 */
function findExpenseById(expenseId) {
  // Search monthly bills
  let expense = TRANSACTION_RULES.monthlyBills.find(e => e.id === expenseId);
  if (expense) return { ...expense, type: 'monthly' };

  // Search biweekly bills
  expense = TRANSACTION_RULES.biweeklyBills.find(e => e.id === expenseId);
  if (expense) return { ...expense, type: 'biweekly' };

  // Search weekday recurring
  expense = TRANSACTION_RULES.weekdayRecurring.find(e => e.id === expenseId);
  if (expense) return { ...expense, type: 'weekday' };

  // Search Friday allocations
  expense = TRANSACTION_RULES.fridayAllocations.find(e => e.id === expenseId);
  if (expense) return { ...expense, type: 'friday' };

  return null;
}

/**
 * Calculate monthly savings for an expense
 */
function calculateMonthlySavings(expense) {
  switch (expense.type) {
    case 'monthly':
      return expense.amount;
    case 'biweekly':
      return expense.amount * 2.17; // Average months have 2.17 biweekly periods
    case 'weekday':
      return expense.amount * 22; // ~22 weekdays per month
    case 'friday':
      return expense.amount * 4.33; // Average months have 4.33 Fridays
    default:
      return 0;
  }
}

/**
 * Get human-readable schedule description
 */
function getScheduleDescription(expense) {
  switch (expense.type) {
    case 'monthly':
      return `Day ${expense.day}`;
    case 'biweekly':
      return `Every 14 days from ${expense.anchor}`;
    case 'weekday':
      return 'Mon-Fri';
    case 'friday':
      return 'Every Friday';
    default:
      return '';
  }
}
```

### B. CSS Variables Reference

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --shadow: rgba(0, 0, 0, 0.1);
  --accent-primary: #667eea;
  --accent-secondary: #764ba2;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
}

body.dark-theme {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --shadow: rgba(0, 0, 0, 0.3);
  --accent-primary: #818cf8;
  --accent-secondary: #a78bfa;
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #f87171;
  --info: #60a5fa;
}
```

### C. Testing Checklist

**Unit Tests:**
- [ ] `TransactionRuleEngine.calculateDailyForecast()` matches agent output
- [ ] `isBiweeklyDue()` correctly calculates modulo 14 cycles
- [ ] `getFlag()` returns correct NEG/LOW/empty flags
- [ ] `ComparisonCalculator` accurately computes deltas

**Integration Tests:**
- [ ] Toggle expense → recalculation → UI update pipeline
- [ ] Save scenario → load scenario → verify restored state
- [ ] Export scenarios → import scenarios → verify data integrity
- [ ] Preset scenarios apply correct expense combinations

**UI Tests:**
- [ ] Checkbox state syncs with `disabledExpenses` Set
- [ ] Comparison cards update with correct values and colors
- [ ] Chart displays both baseline and modified lines
- [ ] Transaction table shows removed expenses as strikethrough
- [ ] Mobile responsive layout works on small screens

**Performance Tests:**
- [ ] 60-day forecast calculates in <500ms
- [ ] UI updates complete in <200ms
- [ ] Rapid checkbox toggling doesn't freeze browser
- [ ] localStorage operations don't block UI thread

**Edge Case Tests:**
- [ ] Empty `disabledExpenses` Set (baseline scenario)
- [ ] All expenses disabled (zero-expense scenario)
- [ ] Month with 31 days vs 28 days (Feb edge case)
- [ ] Biweekly anchor date before forecast start date
- [ ] Friday that falls on last day of month

---

**End of Plan Document**
