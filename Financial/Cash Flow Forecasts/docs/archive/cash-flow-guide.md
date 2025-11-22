# Cash Flow Projections

This folder contains everything for cash flow forecasting.

## Files

- **cash-flow-data.md** - Your transaction data (bills, income, recurring charges) - EDIT THIS to update amounts/dates
- **cash-flow-forecaster.md** - The agent that runs calculations and generates forecasts
- **dashboard.html** - Interactive web dashboard (auto-updated by agent)
- **forecast-YYYY-MM-DD.md** - Markdown forecast reports (one per run)
- **original-gpt-prompt.md** - The original GPT prompt this was based on
- **README.md** - This file

## How to Use

1. **Update your bills/income:** Edit `cash-flow-data.md`
2. **Run forecast:** Use the Task tool with the cash-flow-forecaster agent
3. **Get report:** Agent reads your data and outputs full 60-day projection

## Quick Start

Example:
```
User: "Forecast from Nov 19, 2025 with $2,500 balance"
Agent: [Generates complete forecast with tables, alerts, suggestions]
```

## Output Includes

1. Confirmation of inputs
2. Summary (start/end balance, net change, lowest day)
3. Day-by-day table with all transactions
4. Alerts for LOW/NEG days
5. Actionable suggestions
6. Next 7 days recap
7. Month-end summary
