/**
 * Constants - Shared configuration across all pages
 */
const CONSTANTS = {
  // Forecast settings
  FORECAST_DAYS: 42,
  LOW_BALANCE_THRESHOLD: 500,
  EMERGENCY_WINDOW_DAYS: 7,

  // Performance settings
  DEBOUNCE_DELAY: 300,
  CHART_ANIMATION_DURATION: 500,

  // Storage keys
  STORAGE_KEY_THEME: 'cashflow-theme',
  STORAGE_KEY_SCENARIOS: 'cashflow-scenarios',
  STORAGE_KEY_PREFERENCES: 'cashflow-preferences',

  // Chart colors
  CHART_COLORS: {
    normal: '#667eea',
    low: '#f59e0b',
    negative: '#ef4444',
    baseline: '#94a3b8',
    modified: '#10b981',
    gridLines: '#e5e7eb'
  },

  // Date formats
  DATE_FORMAT_SHORT: 'MMM DD',
  DATE_FORMAT_LONG: 'YYYY-MM-DD',

  // Expense categories
  EXPENSE_CATEGORIES: {
    MONTHLY: 'monthly',
    BIWEEKLY: 'biweekly',
    WEEKDAY_RECURRING: 'weekday-recurring',
    FRIDAY_RECURRING: 'friday-recurring'
  }
};

// Export
if (typeof window !== 'undefined') {
  window.CONSTANTS = CONSTANTS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
}
