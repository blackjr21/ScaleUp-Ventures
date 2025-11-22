/**
 * ForecastEngine - Cash Flow Forecasting Service
 * Calculates 60-day forecasts based on transaction rules
 */

class ForecastEngine {
  /**
   * Generate 60-day cash flow forecast
   * @param {Array} transactions - Array of transaction objects from database
   * @param {Date} startDate - Starting date for forecast
   * @param {Number} startingBalance - Starting balance
   * @returns {Object} Forecast data with daily balances
   */
  static generateForecast(transactions, startDate, startingBalance) {
    const forecastDays = 60;
    const days = [];
    let currentBalance = startingBalance;

    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dayTransactions = this.getTransactionsForDate(transactions, date);

      const credits = dayTransactions
        .filter(t => t.type === 'INFLOW')
        .reduce((sum, t) => sum + t.amount, 0);

      const debits = dayTransactions
        .filter(t => t.type === 'OUTFLOW')
        .reduce((sum, t) => sum + t.amount, 0);

      currentBalance = currentBalance + credits - debits;

      const flag = this.getBalanceFlag(currentBalance);

      days.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        credits,
        debits,
        balance: Math.round(currentBalance * 100) / 100,
        flag,
        transactions: dayTransactions.map(t => ({
          name: t.name,
          amount: t.amount,
          type: t.type
        }))
      });
    }

    const summary = this.calculateSummary(days, startingBalance);
    const alerts = this.generateAlerts(days);

    return { days, summary, alerts };
  }

  /**
   * Get transactions that should post on a given date
   */
  static getTransactionsForDate(transactions, date) {
    const postedTransactions = [];

    for (const transaction of transactions) {
      if (!transaction.isActive) continue;

      if (this.shouldPostOnDate(transaction, date)) {
        postedTransactions.push(transaction);
      }
    }

    return postedTransactions;
  }

  /**
   * Determine if a transaction should post on a given date
   */
  static shouldPostOnDate(transaction, date) {
    const { frequency, dayOfMonth, anchorDate } = transaction;

    switch (frequency) {
      case 'MONTHLY':
        return date.getDate() === dayOfMonth;

      case 'BIWEEKLY':
        if (!anchorDate) return false;
        const anchor = new Date(anchorDate);
        const diffDays = Math.floor((date - anchor) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % 14 === 0;

      case 'WEEKDAY':
        const dayOfWeek = date.getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday-Friday

      case 'FRIDAY':
        return date.getDay() === 5; // Friday only

      case 'ONE_TIME':
        if (!anchorDate) return false;
        const onetime = new Date(anchorDate);
        return date.toDateString() === onetime.toDateString();

      default:
        return false;
    }
  }

  /**
   * Get balance flag (NEG, LOW, OK)
   */
  static getBalanceFlag(balance) {
    if (balance < 0) return 'NEG';
    if (balance < 500) return 'LOW';
    return 'OK';
  }

  /**
   * Calculate summary statistics
   */
  static calculateSummary(days, startingBalance) {
    const endingBalance = days[days.length - 1].balance;
    const lowestDay = days.reduce((min, day) =>
      day.balance < min.balance ? day : min
    );

    return {
      startingBalance,
      endingBalance,
      netChange: endingBalance - startingBalance,
      lowestBalance: lowestDay.balance,
      lowestBalanceDate: lowestDay.date
    };
  }

  /**
   * Generate alerts for low/negative balance days
   */
  static generateAlerts(days) {
    const alerts = [];

    days.forEach(day => {
      if (day.flag === 'NEG') {
        alerts.push({
          date: day.date,
          type: 'NEGATIVE',
          message: `Negative balance: $${day.balance.toFixed(2)}`,
          severity: 'high'
        });
      } else if (day.flag === 'LOW') {
        alerts.push({
          date: day.date,
          type: 'LOW',
          message: `Low balance: $${day.balance.toFixed(2)}`,
          severity: 'medium'
        });
      }
    });

    return alerts;
  }
}

module.exports = ForecastEngine;
