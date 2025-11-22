# Financial Management App

Full-stack financial management application with cash flow forecasting, scenario planning, and debt payoff strategies.

## Project Structure

```
financial-app/
├── server/              # Backend Express.js application
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic (ForecastEngine, DebtCalculator, etc.)
│   ├── middleware/      # Express middleware (auth, validation, error handling)
│   └── utils/           # Helper functions
├── client/              # Frontend static files
│   ├── js/              # JavaScript files
│   │   └── shared/      # Shared utilities (API client, etc.)
│   ├── css/             # Stylesheets
│   └── assets/          # Images, fonts, etc.
├── tests/               # Test suites
│   ├── unit/            # Unit tests (Jest)
│   └── e2e/             # End-to-end tests (Playwright)
├── prisma/              # Database schema and migrations
├── assets/              # Project assets
│   └── screenshots/     # Test screenshots
└── package.json         # Project dependencies
```

## Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Testing:** Jest (unit) + Playwright (E2E)

### Frontend
- **Core:** Vanilla HTML/CSS/JavaScript
- **Charts:** Chart.js 3.x
- **HTTP:** Fetch API

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize database:
   ```bash
   npm run prisma:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:e2e` - Run E2E tests only
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Features

### Cash Flow Forecasting
- 60-day balance projections
- Multiple transaction frequencies (monthly, biweekly, weekday, Friday)
- Low balance alerts
- Interactive charts

### Scenario Planning
- What-if expense analysis
- Before/after comparison
- Savings calculation
- Preset and custom scenarios

### Debt Payoff Strategy
- Avalanche method (highest APR first)
- Snowball method (lowest balance first)
- Consolidation analysis
- Month-by-month payment schedules
- Interest calculations

## License

MIT
