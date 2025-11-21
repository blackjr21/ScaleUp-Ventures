/**
 * ScenarioManager - Manages scenario state and updates
 */

class ScenarioManager {
    constructor(rules, startDate, startBalance) {
        this.engine = new TransactionRuleEngine(rules, startDate, startBalance);
        this.disabledExpenses = new Set();
        this.listeners = [];
        this.baselineForecast = this.engine.calculateDailyForecast(new Set());
        this.modifiedForecast = this.baselineForecast;
        this.debounceTimer = null;
    }

    toggleExpense(expenseId, isEnabled) {
        if (isEnabled) {
            this.disabledExpenses.delete(expenseId);
        } else {
            this.disabledExpenses.add(expenseId);
        }
        this.recalculateDebounced();
    }

    recalculateDebounced() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.recalculate();
        }, 300);
    }

    recalculate() {
        this.modifiedForecast = this.engine.calculateDailyForecast(this.disabledExpenses);
        this.notifyListeners();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback({
            baseline: this.baselineForecast,
            modified: this.modifiedForecast,
            disabledExpenses: this.disabledExpenses
        }));
    }

    reset() {
        this.disabledExpenses.clear();
        this.recalculate();
    }

    getBaselineForecast() {
        return this.baselineForecast;
    }

    getModifiedForecast() {
        return this.modifiedForecast;
    }

    getDisabledExpenses() {
        return this.disabledExpenses;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ScenarioManager = ScenarioManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScenarioManager;
}
