/**
 * StrategyLoader - Multi-file data loading system for intelligent debt strategy
 * Loads all 7 JSON files and validates strategy data
 */
class StrategyLoader {
    constructor() {
        this.files = {
            inventory: 'debt-inventory.json',
            phase1: 'phase1-debt-analysis-current.json',
            phase2: 'phase2-strategy-comparison-current.json',
            phase3: 'phase3-payoff-roadmap-current.json',
            phase4a: 'phase4a-motivation-plan-current.json',
            phase4b: 'phase4b-acceleration-optimizer-current.json',
            phase4c: 'phase4c-monitoring-protocol-current.json'
        };
    }

    /**
     * Load all strategy data files in parallel
     * @returns {Promise<Object>} Object containing all loaded data
     */
    async loadAllStrategyData() {
        try {
            const loadPromises = Object.entries(this.files).map(async ([key, filename]) => {
                const response = await fetch(filename);
                if (!response.ok) {
                    throw new Error(`Failed to load ${filename}: ${response.statusText}`);
                }
                const data = await response.json();
                return [key, data];
            });

            const results = await Promise.all(loadPromises);
            const data = Object.fromEntries(results);

            // Validate loaded data
            this.validateStrategyData(data);

            return data;
        } catch (error) {
            console.error('Error loading strategy data:', error);
            throw error;
        }
    }

    /**
     * Detect if strategy files are stale compared to inventory
     * @param {Object} inventory - Debt inventory data
     * @param {Object} phase2 - Strategy comparison data
     * @returns {Object} { isStale: boolean, reason: string }
     */
    detectStrategyStale(inventory, phase2) {
        const inventoryDate = new Date(inventory.collectionDate);
        const strategyDate = phase2.metadata?.generatedDate
            ? new Date(phase2.metadata.generatedDate)
            : null;

        if (!strategyDate) {
            return {
                isStale: true,
                reason: 'Strategy files missing generation date - may be outdated'
            };
        }

        // If inventory is newer than strategy by more than 1 day
        const daysDiff = Math.floor((inventoryDate - strategyDate) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) {
            return {
                isStale: true,
                reason: `Inventory updated ${daysDiff} days after strategy generation. Please regenerate strategy.`
            };
        }

        return {
            isStale: false,
            reason: 'Strategy is current'
        };
    }

    /**
     * Validate that all required fields exist in strategy data
     * @param {Object} data - Complete strategy data object
     * @throws {Error} If validation fails
     */
    validateStrategyData(data) {
        // Validate inventory
        if (!data.inventory || !data.inventory.debts || !Array.isArray(data.inventory.debts)) {
            throw new Error('Invalid inventory data: missing debts array');
        }

        // Validate phase1 - debt analysis (handle both nested and flat structures)
        if (!data.phase1) {
            throw new Error('Invalid phase1 data: missing phase1');
        }
        // Accept either phase1.summary.totalDebt OR phase1.totalDebt
        const phase1Source = data.phase1.summary || data.phase1;
        if (!phase1Source.totalDebt) {
            throw new Error('Invalid phase1 data: missing totalDebt');
        }

        // Validate phase2 - strategy comparison
        if (!data.phase2 || !data.phase2.recommendation) {
            throw new Error('Invalid phase2 data: missing recommendation');
        }

        // Validate phase3 - payoff roadmap
        if (!data.phase3 || !data.phase3.payoffOrder || !Array.isArray(data.phase3.payoffOrder)) {
            throw new Error('Invalid phase3 data: missing payoffOrder array');
        }

        // Validate phase4a - motivation plan
        if (!data.phase4a || !data.phase4a.milestones || !Array.isArray(data.phase4a.milestones)) {
            throw new Error('Invalid phase4a data: missing milestones array');
        }

        // Validate phase4b - acceleration optimizer
        if (!data.phase4b || !data.phase4b.scenarios || !Array.isArray(data.phase4b.scenarios)) {
            throw new Error('Invalid phase4b data: missing scenarios array');
        }

        // Validate phase4c - monitoring protocol
        if (!data.phase4c || !data.phase4c.nextActions || !Array.isArray(data.phase4c.nextActions)) {
            throw new Error('Invalid phase4c data: missing nextActions array');
        }

        // Cross-validate debt counts
        const inventoryDebtCount = data.inventory.debts.length;
        const phase1DebtCount = data.phase1.summary.debtCount;

        if (inventoryDebtCount !== phase1DebtCount) {
            console.warn(`Warning: Debt count mismatch - Inventory: ${inventoryDebtCount}, Phase1: ${phase1DebtCount}`);
        }

        return true;
    }

    /**
     * Get summary of loaded data for debugging
     * @param {Object} data - Complete strategy data object
     * @returns {Object} Summary information
     */
    getDataSummary(data) {
        return {
            inventoryDate: data.inventory.collectionDate,
            totalDebts: data.inventory.debts.length,
            totalBalance: data.phase1.summary.totalDebt,
            recommendedStrategy: data.phase2.recommendation.primaryStrategy,
            debtFreeDate: data.phase2.recommendation.expectedResults?.debtFreeDate,
            milestoneCount: data.phase4a.milestones.length,
            scenarioCount: data.phase4b.scenarios.length,
            nextActionCount: data.phase4c.nextActions.length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrategyLoader;
}
