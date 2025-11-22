const ForecastEngine = require('./ForecastEngine');

/**
 * ScenarioEngine - Handles scenario-based forecast calculations
 * Ported from the old ScenarioManager class with database integration
 */
class ScenarioEngine {
  /**
   * Compare baseline forecast with modified forecast based on scenario modifications
   * @param {Array} transactions - All user transactions
   * @param {Array} modifications - Array of scenario modifications
   * @param {Date} startDate - Forecast start date
   * @param {Number} startingBalance - Starting balance
   * @returns {Object} - { baseline, modified, savings, comparison }
   */
  static compareScenarios(transactions, modifications, startDate, startingBalance) {
    // Generate baseline forecast (all transactions included)
    const baselineForecast = ForecastEngine.generateForecast(
      transactions,
      startDate,
      startingBalance
    );

    // Apply modifications to get modified transaction list
    const modifiedTransactions = this.applyModifications(transactions, modifications);

    // Generate modified forecast (with modifications applied)
    const modifiedForecast = ForecastEngine.generateForecast(
      modifiedTransactions,
      startDate,
      startingBalance
    );

    // Calculate savings and comparison
    const savings = this.calculateSavings(baselineForecast, modifiedForecast);
    const comparison = this.generateComparison(baselineForecast, modifiedForecast, savings);

    return {
      baseline: baselineForecast,
      modified: modifiedForecast,
      savings,
      comparison
    };
  }

  /**
   * Apply scenario modifications to transaction list
   * @param {Array} transactions - Original transactions
   * @param {Array} modifications - Modifications to apply
   * @returns {Array} - Modified transactions
   */
  static applyModifications(transactions, modifications) {
    // Create a map of modifications by transaction ID
    const modMap = new Map();
    modifications.forEach(mod => {
      if (!modMap.has(mod.transactionId)) {
        modMap.set(mod.transactionId, []);
      }
      modMap.get(mod.transactionId).push(mod);
    });

    // Apply modifications
    return transactions
      .filter(transaction => {
        // Check if this transaction is excluded
        const mods = modMap.get(transaction.id);
        if (!mods) return true; // No modifications, include it

        const excludeMod = mods.find(m => m.action === 'exclude');
        return !excludeMod; // Exclude if there's an exclude modification
      })
      .map(transaction => {
        const mods = modMap.get(transaction.id);
        if (!mods) return transaction; // No modifications, return as-is

        // Apply modifications
        let modified = { ...transaction };

        // Apply amount modification
        const amountMod = mods.find(m => m.action === 'modify_amount');
        if (amountMod && amountMod.modifiedAmount !== null) {
          modified.amount = amountMod.modifiedAmount;
        }

        // Apply reschedule modification
        const rescheduleMod = mods.find(m => m.action === 'reschedule');
        if (rescheduleMod && rescheduleMod.modifiedDate) {
          modified.frequency = 'ONE_TIME';
          modified.anchorDate = rescheduleMod.modifiedDate;
          modified.dayOfMonth = null;
        }

        return modified;
      });
  }

  /**
   * Calculate savings between baseline and modified forecasts
   * @param {Object} baseline - Baseline forecast
   * @param {Object} modified - Modified forecast
   * @returns {Object} - Savings details
   */
  static calculateSavings(baseline, modified) {
    const baselineEnding = baseline.summary.endingBalance;
    const modifiedEnding = modified.summary.endingBalance;
    const totalSavings = modifiedEnding - baselineEnding;

    // Calculate daily savings
    const dailySavings = baseline.days.map((day, index) => {
      const modifiedDay = modified.days[index];
      return {
        date: day.date,
        baselineBalance: day.balance,
        modifiedBalance: modifiedDay.balance,
        dailySavings: modifiedDay.balance - day.balance
      };
    });

    return {
      totalSavings,
      baselineEndingBalance: baselineEnding,
      modifiedEndingBalance: modifiedEnding,
      dailySavings
    };
  }

  /**
   * Generate comparison summary
   * @param {Object} baseline - Baseline forecast
   * @param {Object} modified - Modified forecast
   * @param {Object} savings - Savings calculation
   * @returns {Object} - Comparison summary
   */
  static generateComparison(baseline, modified, savings) {
    return {
      startDate: baseline.days[0].date,
      endDate: baseline.days[baseline.days.length - 1].date,
      dayCount: baseline.days.length,

      baseline: {
        startingBalance: baseline.summary.startingBalance,
        endingBalance: baseline.summary.endingBalance,
        netChange: baseline.summary.netChange,
        lowestBalance: baseline.summary.lowestBalance,
        lowestBalanceDate: baseline.summary.lowestBalanceDate,
        alertCount: baseline.alerts.length
      },

      modified: {
        startingBalance: modified.summary.startingBalance,
        endingBalance: modified.summary.endingBalance,
        netChange: modified.summary.netChange,
        lowestBalance: modified.summary.lowestBalance,
        lowestBalanceDate: modified.summary.lowestBalanceDate,
        alertCount: modified.alerts.length
      },

      improvement: {
        totalSavings: savings.totalSavings,
        endingBalanceDifference: savings.totalSavings,
        lowestBalanceImprovement: modified.summary.lowestBalance - baseline.summary.lowestBalance,
        alertsReduced: baseline.alerts.length - modified.alerts.length,
        percentageImprovement: baseline.summary.endingBalance !== 0
          ? ((savings.totalSavings / Math.abs(baseline.summary.endingBalance)) * 100)
          : 0
      }
    };
  }

  /**
   * Get excluded transactions from modifications
   * @param {Array} modifications - Scenario modifications
   * @returns {Array} - Array of excluded transaction IDs
   */
  static getExcludedTransactions(modifications) {
    return modifications
      .filter(mod => mod.action === 'exclude')
      .map(mod => mod.transactionId);
  }

  /**
   * Get modified transactions from modifications
   * @param {Array} modifications - Scenario modifications
   * @returns {Array} - Array of {transactionId, modifiedAmount} objects
   */
  static getModifiedAmounts(modifications) {
    return modifications
      .filter(mod => mod.action === 'modify_amount')
      .map(mod => ({
        transactionId: mod.transactionId,
        modifiedAmount: mod.modifiedAmount
      }));
  }

  /**
   * Get rescheduled transactions from modifications
   * @param {Array} modifications - Scenario modifications
   * @returns {Array} - Array of {transactionId, modifiedDate} objects
   */
  static getRescheduled(modifications) {
    return modifications
      .filter(mod => mod.action === 'reschedule')
      .map(mod => ({
        transactionId: mod.transactionId,
        modifiedDate: mod.modifiedDate
      }));
  }
}

module.exports = ScenarioEngine;
