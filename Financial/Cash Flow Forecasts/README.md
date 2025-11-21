# Cash Flow Forecasting

Personal cash flow projection system for tracking income, expenses, and maintaining positive account balances.

---

## Repository Structure

```
Cash Flow Forecasts/
├── data/                           # Financial data
│   └── cash-flow-data.md          # Your transaction data (bills, income, recurring)
├── forecasts/                      # Generated forecast archives
│   ├── dashboard.html             # Interactive HTML dashboard
│   ├── forecast-*.md              # Markdown forecast reports
│   └── reconciliation-report-*.md # Bank reconciliation reports
├── src/                            # Source code and utilities
│   ├── load-forecast.js           # Forecast loading script
│   └── quick-test.js              # Quick testing utilities
├── docs/                           # Documentation
│   ├── cash-flow-guide.md         # Detailed usage guide
│   └── *.md                       # Other documentation files
├── assets/                         # Images and screenshots
│   └── screenshots/               # Dashboard screenshots
├── temp/                           # Temporary files
│   └── input/                     # Bank statement PDFs for reconciliation
├── package.json                   # Node.js dependencies
└── README.md                       # This file
```

**Note:** Agent configurations are located in the parent repository at `../../.claude/agents/`

---

## Quick Start

### 1. Update Your Financial Data

Edit `data/cash-flow-data.md` with your:
- Current bills and due dates
- Regular income and payment dates
- Recurring charges
- Any one-time transactions

### 2. Run a Cash Flow Forecast

Use the cash-flow-forecaster agent to generate a 60-day projection:

```
User: "Forecast from Nov 19, 2025 with $2,500 balance"
```

The agent will:
1. Read your transaction data
2. Calculate day-by-day balances
3. Identify low/negative balance days
4. Provide actionable recommendations
5. Show next 7 days and month-end summaries

---

## What You'll Get

Each forecast includes:

1. **Input Confirmation** - Starting date and balance
2. **Executive Summary** - Net change, final balance, lowest day
3. **60-Day Projection Table** - Day-by-day transactions and balances
4. **Alerts** - Warnings for low or negative balance days
5. **Recommendations** - Suggestions for payment timing adjustments
6. **Next 7 Days Recap** - Upcoming critical transactions
7. **Month-End Summary** - Balance at end of each month

---

## How to Use

### Update Your Data Regularly

Keep `data/cash-flow-data.md` current with:
- New bills or changed due dates
- Income adjustments
- Added/removed recurring charges
- Upcoming one-time expenses

### Run Forecasts When Needed

Generate forecasts:
- Before making major purchases
- When planning bill payment timing
- To check if you can move money to savings
- Before any financial decision

### Use Insights to Plan

The forecast helps you:
- Avoid overdrafts
- Optimize payment timing
- Identify when you have surplus cash
- Plan for upcoming tight periods

---

## Key Files

| File | Purpose |
|------|---------|
| `data/cash-flow-data.md` | Your editable transaction database |
| `../../.claude/agents/cash-flow-forecaster.md` | Agent that generates projections |
| `docs/cash-flow-guide.md` | Detailed usage documentation |
| `forecasts/dashboard.html` | Interactive forecast dashboard |
| `forecasts/` | Archive of generated forecasts |

---

## Getting Help

- See `docs/cash-flow-guide.md` for detailed usage
- Check `docs/original-gpt-prompt.md` for the original concept
- All calculations are based on the data in `data/cash-flow-data.md`
- Generated forecasts are saved in `forecasts/` with timestamps

---

**Last Updated:** 2025-11-19
