# Financial Management

Personal financial tracking and management system.

## Structure

- **Cash Flow Forecasts/** - Cash flow projection and bill management system
  - 60-day forecasting with interactive dashboard
  - Bank statement reconciliation
  - Bill payment tracking
  - See [Cash Flow Forecasts/README.md](Cash%20Flow%20Forecasts/README.md) for details

- **Debt Payoff/** - Comprehensive debt elimination strategy and tracking
  - Multi-strategy debt payoff analysis (Avalanche, Snowball, Consolidation)
  - Interactive HTML dashboard with payment schedule visualization
  - Motivation and acceleration optimization planning
  - Monthly monitoring protocols and contingency plans
  - See [Debt Payoff/README.md](Debt%20Payoff/README.md) for details

## Future Domains

This folder will expand to include:
- **Investments/** - Investment portfolio tracking and analysis
- **Budgets/** - Budget planning and expense categorization
- **Taxes/** - Tax document organization and preparation
- **Insurance/** - Insurance policy tracking and claims

## Getting Started

Each subdomain has its own README with specific instructions. Start with the Cash Flow Forecasts system for bill and cash management.

## Claude Agents

All financial agents are configured in `../.claude/agents/`:

**Cash Flow Management:**
- `cash-flow-forecaster.md` - Main orchestrator
- `forecast-calculator.md` - Calculation engine
- `bill-confirmation-agent.md` - Bill payment verification
- `dashboard-updater.md` - HTML dashboard updates
- `report-formatter.md` - Markdown report generation
- `bank-reconciler.md` - Bank statement reconciliation

**Debt Payoff Management:**
- `debt-payoff-orchestrator.md` - Main coordinator for debt elimination
- `debt-analyzer.md` - Debt metrics and risk assessment
- `debt-data-collector.md` - Structured debt information intake
- `debt-strategy-visualizer.md` - HTML dashboard generation
- `acceleration-optimizer.md` - Payment acceleration scenarios
- `motivation-planner.md` - Psychological sustainability planning
- `monitoring-protocol-builder.md` - Review schedules and contingency plans

See `../.claude/instructions.md` for complete agent documentation.
