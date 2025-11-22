/**
 * FinancialCalculator - Pure math functions for debt calculations
 * No dependencies, no side effects - just calculations
 */
class FinancialCalculator {
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
     * @param {Array} debts - Array of debt objects with currentBalance and apr
     * @returns {number} Total monthly interest
     */
    static calculateTotalInterest(debts) {
        return debts.reduce((sum, debt) => {
            return sum + this.calculateMonthlyInterest(debt.currentBalance, debt.apr);
        }, 0);
    }

    /**
     * Calculate annual interest from monthly
     * @param {number} monthlyInterest - Monthly interest amount
     * @returns {number} Annual interest
     */
    static calculateAnnualInterest(monthlyInterest) {
        return monthlyInterest * 12;
    }

    /**
     * Calculate interest saved by making a payment
     * @param {number} balance - Current balance
     * @param {number} apr - Annual Percentage Rate
     * @param {number} payment - Payment amount
     * @returns {number} Monthly interest saved
     */
    static calculateInterestSaved(balance, apr, payment) {
        const oldInterest = this.calculateMonthlyInterest(balance, apr);
        const newInterest = this.calculateMonthlyInterest(balance - payment, apr);
        return oldInterest - newInterest;
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
     * Format currency for display
     * @param {number} amount - Dollar amount
     * @returns {string} Formatted currency string
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format large numbers (e.g., $884K)
     * @param {number} amount - Dollar amount
     * @returns {string} Formatted string
     */
    static formatLargeNumber(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${Math.round(amount / 1000)}K`;
        }
        return this.formatCurrency(amount);
    }
}

// Export for Node.js (tests) and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialCalculator;
}
