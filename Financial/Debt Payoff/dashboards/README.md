# Debt Payoff Dashboards

This directory contains HTML dashboards for visualizing debt payoff strategies.

## Current Dashboard

**debt-strategy-final-2025-11-21.html** - Main debt strategy dashboard with dynamic data loading

### Features
- **Promotional Balance Defense Table**: Shows promotional APR debts with expiration tracking
- **Victory Path Table**: Complete debt inventory organized by APR tiers (High/Medium/Low)
- **Dynamic Monthly Payments**: Auto-calculated from JSON data
- **Tier Summaries**: Automatic subtotals for each APR tier
- **Responsive Design**: Mobile-friendly layout

### Data Source
Loads data from `../data/debt-inventory-current.json`

### Local Testing
```bash
# Start local server from Debt Payoff directory
python3 -m http.server 8888

# Open in browser
open http://localhost:8888/dashboards/debt-strategy-final-2025-11-21.html
```

### Technology
- Pure HTML/CSS/JavaScript
- No external dependencies
- Dynamic DOM manipulation
- Fetch API for JSON loading

## Related Files
- Data: `../data/debt-inventory-current.json`
- Tests: `../tests/dynamic-tables.spec.js`
- JavaScript modules: `../js/`
