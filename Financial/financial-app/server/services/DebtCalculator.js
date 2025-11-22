/**
 * DebtCalculator Service
 * Ported from Financial/Debt Payoff/js/financial-calculator.js
 *
 * Pure calculation engine for debt payoff strategies:
 * - Avalanche (highest APR first)
 * - Snowball (lowest balance first)
 * - Consolidation (single loan with weighted APR)
 */

class DebtCalculator {
    /**
     * Calculate monthly interest for a single debt
     * @param {number} balance - Current balance
     * @param {number} apr - Annual Percentage Rate (as number, e.g., 17.89)
     * @returns {number} Monthly interest amount
     */
    static calculateMonthlyInterest(balance, apr) {
        if (balance <= 0 || apr < 0) return 0;
        return (balance * (apr / 100)) / 12;
    }

    /**
     * Calculate total monthly interest for array of debts
     * @param {Array} debts - Array of debt objects with balance and apr
     * @returns {number} Total monthly interest
     */
    static calculateTotalMonthlyInterest(debts) {
        return debts.reduce((sum, debt) => {
            return sum + this.calculateMonthlyInterest(debt.balance, debt.apr);
        }, 0);
    }

    /**
     * Calculate debt-to-income ratio
     * @param {number} monthlyDebtService - Total monthly debt payments
     * @param {number} monthlyIncome - Monthly income
     * @returns {number} DTI as percentage (e.g., 40.6)
     */
    static calculateDTI(monthlyDebtService, monthlyIncome) {
        if (monthlyIncome <= 0) return 0;
        return (monthlyDebtService / monthlyIncome) * 100;
    }

    /**
     * Calculate weighted average APR across all debts
     * @param {Array} debts - Array of debt objects with balance and apr
     * @returns {number} Weighted average APR
     */
    static calculateWeightedAPR(debts) {
        const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
        if (totalBalance === 0) return 0;

        const weightedSum = debts.reduce((sum, debt) => {
            return sum + (debt.balance * debt.apr);
        }, 0);

        return weightedSum / totalBalance;
    }

    /**
     * Calculate avalanche strategy (pay highest APR first)
     * @param {Array} debts - Array of debt objects
     * @param {number} extraPayment - Extra monthly payment beyond minimums
     * @returns {Object} Strategy result with payoff schedule
     */
    static calculateAvalanche(debts, extraPayment = 0) {
        if (!debts || debts.length === 0) {
            throw new Error('No debts provided');
        }

        // Ensure non-negative extra payment
        extraPayment = Math.max(0, extraPayment);

        // Sort by APR descending (highest first)
        const sortedDebts = [...debts].sort((a, b) => b.apr - a.apr);

        return this._calculatePayoffSchedule(sortedDebts, extraPayment, 'avalanche');
    }

    /**
     * Calculate snowball strategy (pay lowest balance first)
     * @param {Array} debts - Array of debt objects
     * @param {number} extraPayment - Extra monthly payment beyond minimums
     * @returns {Object} Strategy result with payoff schedule
     */
    static calculateSnowball(debts, extraPayment = 0) {
        if (!debts || debts.length === 0) {
            throw new Error('No debts provided');
        }

        // Ensure non-negative extra payment
        extraPayment = Math.max(0, extraPayment);

        // Sort by balance ascending (lowest first)
        const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);

        return this._calculatePayoffSchedule(sortedDebts, extraPayment, 'snowball');
    }

    /**
     * Calculate consolidation strategy (single loan)
     * @param {Array} debts - Array of debt objects
     * @param {number} consolidationAPR - APR for consolidation loan
     * @returns {Object} Strategy result
     */
    static calculateConsolidation(debts, consolidationAPR) {
        if (!debts || debts.length === 0) {
            throw new Error('No debts provided');
        }

        const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
        const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

        // Create single consolidated debt
        const consolidatedDebt = {
            id: 'consolidated',
            name: 'Consolidated Loan',
            balance: totalDebt,
            apr: consolidationAPR,
            minimumPayment: totalMinimumPayment
        };

        const result = this._calculatePayoffSchedule([consolidatedDebt], 0, 'consolidation');

        return {
            ...result,
            consolidatedAPR: consolidationAPR,
            monthlyPayment: totalMinimumPayment,
            originalDebts: debts.map(d => ({
                name: d.name,
                balance: d.balance,
                apr: d.apr
            }))
        };
    }

    /**
     * Core payoff schedule calculation engine
     * @private
     * @param {Array} sortedDebts - Debts sorted in payoff order
     * @param {number} extraPayment - Extra monthly payment
     * @param {string} strategyType - 'avalanche', 'snowball', or 'consolidation'
     * @returns {Object} Complete strategy result
     */
    static _calculatePayoffSchedule(sortedDebts, extraPayment, strategyType) {
        // Clone debts to avoid mutation - maintain sorted order
        let activeDebts = sortedDebts.map(d => ({
            ...d,
            remainingBalance: d.balance,
            originalBalance: d.balance
        }));

        const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
        const schedule = [];
        let monthNumber = 1;
        let totalInterestPaid = 0;
        const payoffOrder = [];

        const startDate = new Date();

        while (activeDebts.some(d => d.remainingBalance > 0)) {
            const monthDate = new Date(startDate);
            monthDate.setMonth(startDate.getMonth() + monthNumber);

            // Calculate minimum payments for all debts
            const totalMinimums = activeDebts.reduce((sum, d) => {
                return d.remainingBalance > 0 ? sum + d.minimumPayment : sum;
            }, 0);

            // Total available payment = minimums + extra
            const totalPayment = totalMinimums + extraPayment;

            // Distribute payments: minimums to all, extra to first debt in sorted order
            // Find the target debt (first one with remaining balance - activeDebts is already sorted)
            const targetDebt = activeDebts.find(d => d.remainingBalance > 0);

            for (let debt of activeDebts) {
                if (debt.remainingBalance <= 0) continue;

                const isTargetDebt = targetDebt && debt.id === targetDebt.id;

                // Calculate interest for this debt
                const interest = this.calculateMonthlyInterest(debt.remainingBalance, debt.apr);

                // Minimum payment for this debt
                let payment = debt.minimumPayment;

                // If this is the target debt, add extra payment
                if (isTargetDebt) {
                    payment += extraPayment;
                }

                // Don't pay more than the remaining balance + interest
                const maxPayment = debt.remainingBalance + interest;
                payment = Math.min(payment, maxPayment);

                // Principal is payment minus interest, but can't exceed remaining balance
                let principal = payment - interest;

                // If this payment will fully pay off the debt, adjust
                if (debt.remainingBalance <= principal) {
                    principal = debt.remainingBalance;
                    debt.remainingBalance = 0;
                } else {
                    debt.remainingBalance -= principal;
                }

                totalInterestPaid += interest;

                schedule.push({
                    debtId: debt.id,
                    debtName: debt.name,
                    monthNumber,
                    paymentDate: new Date(monthDate),
                    paymentAmount: parseFloat(payment.toFixed(2)),
                    principal: parseFloat(principal.toFixed(2)),
                    interest: parseFloat(interest.toFixed(2)),
                    remainingBalance: Math.max(0, parseFloat(debt.remainingBalance.toFixed(2)))
                });
            }

            // Check for paid-off debts
            activeDebts.forEach(debt => {
                if (debt.remainingBalance <= 0.01 && !payoffOrder.find(d => d.id === debt.id)) {
                    payoffOrder.push({
                        id: debt.id,
                        name: debt.name,
                        balance: debt.balance,
                        apr: debt.apr,
                        monthPaidOff: monthNumber
                    });
                }
            });

            monthNumber++;

            // Safety check: prevent infinite loops
            if (monthNumber > 600) {
                throw new Error('Payoff calculation exceeded 600 months');
            }
        }

        const payoffMonths = monthNumber - 1;
        const payoffDate = new Date(startDate);
        payoffDate.setMonth(startDate.getMonth() + payoffMonths);

        return {
            strategyType,
            totalDebt,
            extraMonthlyPayment: extraPayment,
            payoffMonths,
            payoffDate,
            totalInterestPaid: parseFloat(totalInterestPaid.toFixed(2)),
            schedule,
            payoffOrder
        };
    }

    /**
     * Compare all three strategies
     * @param {Array} debts - Array of debt objects
     * @param {number} extraPayment - Extra monthly payment
     * @param {number} consolidationAPR - APR for consolidation option
     * @returns {Object} Comparison of all strategies
     */
    static compareStrategies(debts, extraPayment, consolidationAPR) {
        const avalanche = this.calculateAvalanche(debts, extraPayment);
        const snowball = this.calculateSnowball(debts, extraPayment);
        const consolidation = this.calculateConsolidation(debts, consolidationAPR);

        return {
            avalanche,
            snowball,
            consolidation,
            summary: {
                lowestInterest: avalanche.totalInterestPaid <= snowball.totalInterestPaid &&
                                avalanche.totalInterestPaid <= consolidation.totalInterestPaid
                    ? 'avalanche'
                    : (snowball.totalInterestPaid <= consolidation.totalInterestPaid ? 'snowball' : 'consolidation'),
                fastestPayoff: avalanche.payoffMonths <= snowball.payoffMonths &&
                               avalanche.payoffMonths <= consolidation.payoffMonths
                    ? 'avalanche'
                    : (snowball.payoffMonths <= consolidation.payoffMonths ? 'snowball' : 'consolidation')
            }
        };
    }

    /**
     * Recommend best strategy based on user preferences
     * @param {Array} debts - Array of debt objects
     * @param {number} extraPayment - Extra monthly payment
     * @param {number} consolidationAPR - APR for consolidation
     * @param {Object} preferences - User preferences (motivationStyle, etc.)
     * @returns {Object} Recommendation with reasoning
     */
    static recommendStrategy(debts, extraPayment, consolidationAPR, preferences = {}) {
        const comparison = this.compareStrategies(debts, extraPayment, consolidationAPR);
        const { motivationStyle = 'optimization' } = preferences;

        let recommended;
        let reasoning;

        if (motivationStyle === 'quick_wins') {
            // Snowball for psychological wins
            recommended = 'snowball';
            reasoning = 'Snowball method recommended for quick wins and motivation. ' +
                       `You'll pay off your first debt in ${comparison.snowball.payoffOrder[0].monthPaidOff} months, ` +
                       `providing early psychological victory.`;
        } else if (motivationStyle === 'optimization') {
            // Avalanche for math optimization
            recommended = 'avalanche';
            const savings = comparison.snowball.totalInterestPaid - comparison.avalanche.totalInterestPaid;
            reasoning = 'Avalanche method recommended for optimal savings. ' +
                       `Saves $${savings.toFixed(2)} in interest compared to snowball method.`;
        } else {
            // Check if consolidation is beneficial
            const currentWeightedAPR = this.calculateWeightedAPR(debts);
            if (consolidationAPR < currentWeightedAPR) {
                recommended = 'consolidation';
                reasoning = 'Consolidation recommended due to lower APR. ' +
                           `Reduces rate from ${currentWeightedAPR.toFixed(2)}% to ${consolidationAPR}%.`;
            } else {
                recommended = 'avalanche';
                reasoning = 'Avalanche method recommended for lowest total interest paid.';
            }
        }

        return {
            recommended,
            reasoning,
            comparison,
            preferences
        };
    }
}

module.exports = DebtCalculator;
