/**
 * ComparisonCalculator - Computes before/after comparison metrics
 */

class ComparisonCalculator {
    constructor(baseline, modified) {
        this.baseline = baseline;
        this.modified = modified;
    }

    getTotalRemoved() {
        const baselineDebits = this.baseline.reduce((sum, day) => sum + day.debits, 0);
        const modifiedDebits = this.modified.reduce((sum, day) => sum + day.debits, 0);
        return baselineDebits - modifiedDebits;
    }

    getEndingBalanceChange() {
        const baselineEnding = this.baseline[this.baseline.length - 1].endBalance;
        const modifiedEnding = this.modified[this.modified.length - 1].endBalance;
        const delta = modifiedEnding - baselineEnding;

        return {
            before: baselineEnding,
            after: modifiedEnding,
            delta: delta,
            improvement: delta > 0
        };
    }

    getNegativeDaysChange() {
        const baselineNegDays = this.baseline.filter(d => d.flag === 'NEG').length;
        const modifiedNegDays = this.modified.filter(d => d.flag === 'NEG').length;

        return {
            before: baselineNegDays,
            after: modifiedNegDays,
            reduction: baselineNegDays - modifiedNegDays
        };
    }

    getLowBalanceDaysChange() {
        const baselineLowDays = this.baseline.filter(d => d.flag === 'LOW').length;
        const modifiedLowDays = this.modified.filter(d => d.flag === 'LOW').length;

        return {
            before: baselineLowDays,
            after: modifiedLowDays,
            reduction: baselineLowDays - modifiedLowDays
        };
    }

    getStatusChange() {
        const baselineEnding = this.baseline[this.baseline.length - 1].endBalance;
        const modifiedEnding = this.modified[this.modified.length - 1].endBalance;

        const baselineStatus = baselineEnding < 0 ? 'NEGATIVE' :
                              baselineEnding < 500 ? 'LOW' : 'HEALTHY';
        const modifiedStatus = modifiedEnding < 0 ? 'NEGATIVE' :
                              modifiedEnding < 500 ? 'LOW' : 'HEALTHY';

        if (baselineStatus === modifiedStatus) {
            return { text: 'UNCHANGED', color: 'var(--text-secondary)' };
        } else if (baselineStatus === 'NEGATIVE' && modifiedStatus !== 'NEGATIVE') {
            return { text: 'NEGATIVE → ' + modifiedStatus, color: 'var(--success)' };
        } else if (baselineStatus === 'LOW' && modifiedStatus === 'HEALTHY') {
            return { text: 'LOW → HEALTHY', color: 'var(--success)' };
        } else if (modifiedStatus === 'NEGATIVE') {
            return { text: baselineStatus + ' → NEGATIVE', color: 'var(--danger)' };
        } else {
            return { text: 'IMPROVED', color: 'var(--info)' };
        }
    }

    getRemovedExpensesList(disabledExpenses, transactionRules) {
        const removed = [];

        const allExpenses = [
            ...transactionRules.monthlyBills,
            ...transactionRules.biweeklyBills,
            ...transactionRules.weekdayRecurring,
            ...transactionRules.fridayAllocations
        ];

        disabledExpenses.forEach(expenseId => {
            const expense = allExpenses.find(e => e.id === expenseId);
            if (expense) {
                removed.push({
                    name: expense.name,
                    amount: expense.amount
                });
            }
        });

        return removed.sort((a, b) => b.amount - a.amount);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ComparisonCalculator = ComparisonCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComparisonCalculator;
}
