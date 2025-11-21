/**
 * TransactionRuleEngine - Calculates daily cash flow forecast
 */

class TransactionRuleEngine {
    constructor(rules, startDate, startBalance) {
        this.rules = rules;
        this.startDate = new Date(startDate + 'T12:00:00');
        this.startBalance = startBalance;
    }

    calculateDailyForecast(disabledExpenses, numDays = 42) {
        const forecast = [];
        let currentBalance = this.startBalance;
        const currentDate = new Date(this.startDate);

        for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
            const dateStr = this.formatDate(currentDate);
            let totalCredits = 0;
            let totalDebits = 0;
            const creditNames = [];
            const debitNames = [];

            // Process biweekly inflows
            this.rules.biweeklyInflows.forEach(inflow => {
                if (this.isBiweeklyDue(currentDate, inflow.anchor)) {
                    const adjustment = this.rules.oneTimeAdjustments[dateStr];
                    if (inflow.id === 'acrisure' && adjustment && adjustment.acrisureReduction) {
                        totalCredits += adjustment.acrisureReduction;
                        creditNames.push(`${inflow.name} (Reduced)`);
                    } else {
                        totalCredits += inflow.amount;
                        creditNames.push(inflow.name);
                    }
                }
            });

            // Process one-time early transfers
            const adjustment = this.rules.oneTimeAdjustments[dateStr];
            if (adjustment && adjustment.earlyTransfer) {
                totalCredits += adjustment.earlyTransfer;
                creditNames.push('Early Acrisure Transfer');
            }

            // Process monthly inflows
            this.rules.monthlyInflows.forEach(inflow => {
                if (currentDate.getDate() === inflow.day) {
                    totalCredits += inflow.amount;
                    creditNames.push(inflow.name);
                }
            });

            // Process biweekly bills
            this.rules.biweeklyBills.forEach(bill => {
                if (!disabledExpenses.has(bill.id) && this.isBiweeklyDue(currentDate, bill.anchor)) {
                    totalDebits += bill.amount;
                    debitNames.push(bill.name);
                }
            });

            // Process monthly bills
            this.rules.monthlyBills.forEach(bill => {
                if (!disabledExpenses.has(bill.id) && currentDate.getDate() === bill.day) {
                    totalDebits += bill.amount;
                    debitNames.push(bill.name);
                }
            });

            // Process weekday recurring
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                this.rules.weekdayRecurring.forEach(bill => {
                    if (!disabledExpenses.has(bill.id)) {
                        totalDebits += bill.amount;
                        debitNames.push(bill.name);
                    }
                });
            }

            // Process Friday allocations
            if (dayOfWeek === 5) {
                this.rules.fridayAllocations.forEach(allocation => {
                    if (!disabledExpenses.has(allocation.id)) {
                        totalDebits += allocation.amount;
                        debitNames.push(allocation.name);
                    }
                });
            }

            const endBalance = currentBalance + totalCredits - totalDebits;
            const flag = this.getFlag(endBalance);

            forecast.push({
                date: dateStr,
                startBalance: currentBalance,
                credits: totalCredits,
                debits: totalDebits,
                endBalance: endBalance,
                flag: flag,
                creditNames: creditNames.join(', '),
                debitNames: debitNames.join(', ')
            });

            currentBalance = endBalance;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return forecast;
    }

    isBiweeklyDue(date, anchorStr) {
        const anchor = new Date(anchorStr + 'T12:00:00');
        const diffTime = date - anchor;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % 14 === 0;
    }

    getFlag(balance) {
        if (balance < 0) return 'NEG';
        if (balance < 500) return 'LOW';
        return '';
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.TransactionRuleEngine = TransactionRuleEngine;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransactionRuleEngine;
}
