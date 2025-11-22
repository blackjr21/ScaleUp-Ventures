/**
 * RecommendationEngine - Dynamic recommendation engine based on strategy data
 * Extracts intelligent recommendations from phase JSON files
 */
class RecommendationEngine {
    constructor(inventoryData, phase1, phase2, phase3, phase4a, phase4b, phase4c) {
        this.inventory = inventoryData;
        this.phase1 = phase1;
        this.phase2 = phase2;
        this.phase3 = phase3;
        this.phase4a = phase4a;
        this.phase4b = phase4b;
        this.phase4c = phase4c;
    }

    /**
     * Get recommended strategy from phase2
     * @returns {Object} Recommendation object with strategy details
     */
    getRecommendedStrategy() {
        return {
            primaryStrategy: this.phase2.recommendation.primaryStrategy,
            reasoning: this.phase2.recommendation.reasoning,
            expectedResults: this.phase2.recommendation.expectedResults,
            alternativeStrategies: {
                avalanche: this.phase2.avalanche,
                snowball: this.phase2.snowball,
                consolidation: this.phase2.consolidation
            }
        };
    }

    /**
     * Get next N actions from phase4c based on current date
     * @param {number} count - Number of actions to return
     * @returns {Array} Array of next action objects
     */
    getNextActions(count = 3) {
        if (!this.phase4c.nextActions || this.phase4c.nextActions.length === 0) {
            return [];
        }

        // Filter actions that haven't been completed
        const pendingActions = this.phase4c.nextActions.filter(action =>
            !action.completed && action.status !== 'completed'
        );

        // Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
        const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        pendingActions.sort((a, b) => {
            const aPriority = priorityOrder[a.priority] ?? 4;
            const bPriority = priorityOrder[b.priority] ?? 4;
            return aPriority - bPriority;
        });

        return pendingActions.slice(0, count);
    }

    /**
     * Get complete payoff order from phase3
     * @returns {Array} Array of debts in recommended payoff order
     */
    getPayoffOrder() {
        return this.phase3.payoffOrder || [];
    }

    /**
     * Get milestones from phase4a
     * @returns {Array} Array of milestone objects
     */
    getMilestones() {
        return this.phase4a.milestones || [];
    }

    /**
     * Detect mortgages and return mortgage strategy
     * @returns {Object} Mortgage strategy information
     */
    getMortgageStrategy() {
        const mortgages = this.inventory.debts.filter(d => d.accountType === 'mortgage');

        if (mortgages.length === 0) {
            return {
                hasMortgages: false,
                mortgages: [],
                strategy: null
            };
        }

        // Calculate mortgage metrics
        const totalMortgageBalance = mortgages.reduce((sum, m) => sum + m.currentBalance, 0);
        const totalMortgagePayment = mortgages.reduce((sum, m) => sum + m.minimumPayment, 0);
        const avgMortgageAPR = mortgages.reduce((sum, m) => sum + m.apr, 0) / mortgages.length;

        // Identify refinancing opportunities (APR > 7%)
        const refinancingOpportunities = mortgages.filter(m => m.apr > 7.0);

        return {
            hasMortgages: true,
            mortgages: mortgages,
            totalBalance: totalMortgageBalance,
            totalPayment: totalMortgagePayment,
            avgAPR: avgMortgageAPR,
            strategy: 'Minimum payments only until unsecured debt eliminated',
            refinancingOpportunities: refinancingOpportunities,
            refinancingTriggers: refinancingOpportunities.map(m => ({
                creditor: m.creditorName,
                currentAPR: m.apr,
                targetAPR: 7.0,
                potentialSavings: this.calculateRefinancingSavings(m.currentBalance, m.apr, 7.0, m.minimumPayment)
            }))
        };
    }

    /**
     * Calculate potential savings from refinancing
     * @param {number} balance - Loan balance
     * @param {number} currentAPR - Current interest rate
     * @param {number} targetAPR - Target interest rate
     * @param {number} payment - Monthly payment
     * @returns {number} Estimated monthly savings
     */
    calculateRefinancingSavings(balance, currentAPR, targetAPR, payment) {
        const currentMonthlyInterest = (balance * currentAPR) / 100 / 12;
        const targetMonthlyInterest = (balance * targetAPR) / 100 / 12;
        return Math.round(currentMonthlyInterest - targetMonthlyInterest);
    }

    /**
     * Get promotional deadlines sorted by urgency
     * @returns {Array} Array of promotional debt objects with urgency metrics
     */
    getPromotionalDeadlines() {
        const promoDebts = this.inventory.debts.filter(d => d.promotionalAPR);

        if (promoDebts.length === 0) {
            return [];
        }

        // Calculate days until expiration and sort by urgency
        const today = new Date();
        const deadlines = promoDebts.map(debt => {
            const expirationDate = new Date(debt.promotionalAPR.expirationDate);
            const daysUntil = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

            let urgency = 'MEDIUM';
            if (daysUntil <= 30) urgency = 'CRITICAL';
            else if (daysUntil <= 60) urgency = 'HIGH';
            else if (daysUntil <= 90) urgency = 'MEDIUM';
            else urgency = 'LOW';

            return {
                creditorName: debt.creditorName,
                balance: debt.currentBalance,
                expirationDate: debt.promotionalAPR.expirationDate,
                daysUntil: daysUntil,
                deferredInterestAtRisk: debt.promotionalAPR.deferredInterestAtRisk,
                standardAPR: debt.promotionalAPR.standardAPR,
                urgency: urgency
            };
        });

        // Sort by days until expiration (most urgent first)
        deadlines.sort((a, b) => a.daysUntil - b.daysUntil);

        return deadlines;
    }

    /**
     * Get acceleration scenarios from phase4b
     * @returns {Array} Array of acceleration scenario objects
     */
    getAccelerationScenarios() {
        return this.phase4b.scenarios || [];
    }

    /**
     * Get key metrics summary
     * @returns {Object} Key financial metrics
     */
    getKeyMetrics() {
        // Handle both nested (summary.totalDebt) and flat (totalDebt) structures
        const source = this.phase1.summary || this.phase1;

        return {
            totalDebt: source.totalDebt,
            debtCount: this.inventory.debts.length,
            totalMinPayments: source.totalMinimumPayments,
            monthlyInterest: source.totalMonthlyInterest || this.calculateTotalMonthlyInterest(),
            dti: source.debtToIncomeRatio,
            weightedAPR: typeof source.weightedAvgAPR === 'object' ? source.weightedAvgAPR.allDebts : source.weightedAvgAPR,
            emergencyFund: source.emergencyFundStatus?.currentAmount || source.emergencyFund || 0,
            emergencyFundStatus: source.emergencyFundStatus?.adequacy || source.emergencyFundStatus || 'UNKNOWN'
        };
    }

    /**
     * Calculate total monthly interest from inventory
     * @returns {number} Total monthly interest
     */
    calculateTotalMonthlyInterest() {
        return this.inventory.debts.reduce((sum, debt) => {
            const monthlyInterest = (debt.currentBalance * debt.apr) / 100 / 12;
            return sum + monthlyInterest;
        }, 0);
    }

    /**
     * Get timeline information
     * @returns {Object} Timeline details
     */
    getTimeline() {
        const results = this.phase2.recommendation.expectedResults;
        return {
            debtFreeDate: results.debtFreeDate,
            monthsToPayoff: results.timelineMonths || results.totalMonths,
            yearsToPayoff: Math.ceil((results.timelineMonths || results.totalMonths) / 12),
            firstPayoffDate: results.firstPayoffDate,
            totalInterestPaid: results.totalInterestPaid,
            interestSavedVsSnowball: results.interestSavedVsSnowball,
            interestSavedVsMinimums: results.interestSavedVsMinimums
        };
    }

    /**
     * Check if strategy needs regeneration
     * @returns {boolean} True if strategy should be regenerated
     */
    needsRegeneration() {
        const inventoryDate = new Date(this.inventory.collectionDate);
        const strategyDate = this.phase2.metadata?.generatedDate
            ? new Date(this.phase2.metadata.generatedDate)
            : null;

        if (!strategyDate) return true;

        const daysDiff = Math.floor((inventoryDate - strategyDate) / (1000 * 60 * 60 * 24));
        return daysDiff > 1;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationEngine;
}
