/**
 * DebtClassifier - Business rules for tier classification
 * Classifies debts into 5 tiers based on urgency and strategic priority
 */
class DebtClassifier {
    /**
     * Classify a debt into one of 5 tiers
     * @param {Object} debt - Debt object
     * @returns {Object} Classification with tier, label, priority
     */
    static classifyDebt(debt) {
        // Tier 1: Crisis/Urgent - Immediate threats
        if (debt.isPastDue || debt.isOverlimit || this.hasImminentPromo(debt)) {
            return {
                tier: 1,
                label: 'CRISIS/URGENT',
                priority: 'CRITICAL',
                reason: this.getCrisisReason(debt)
            };
        }

        // Tier 2: Promotional Defense - Save deferred interest
        // If promotionalAPR is true or has promotional balance, classify as Tier 2
        if (debt.promotionalAPR === true || (debt.promotionalAPR && this.hasPromotionalBalance(debt))) {
            let daysUntil = null;
            if (typeof debt.promotionalAPR === 'object' && debt.promotionalAPR.expirationDate) {
                daysUntil = this.getDaysUntilExpiration(debt.promotionalAPR.expirationDate);
            }
            return {
                tier: 2,
                label: 'PROMOTIONAL DEFENSE',
                priority: (daysUntil && daysUntil <= 60) ? 'URGENT' : 'HIGH',
                daysUntilExpiration: daysUntil,
                reason: 'Active promotional balance - pay off before expiration to avoid deferred interest'
            };
        }

        // Tier 3: Toxic High-Rate (≥12%) - Primary attack targets
        if (debt.apr >= 12.0) {
            return {
                tier: 3,
                label: 'TOXIC HIGH-RATE',
                priority: 'HIGH',
                category: this.getHighRateCategory(debt.apr)
            };
        }

        // Tier 4: Moderate Rate (8-12%) - Secondary targets
        if (debt.apr >= 8.0) {
            return {
                tier: 4,
                label: 'MODERATE RATE',
                priority: 'MEDIUM'
            };
        }

        // Tier 5: Low-Rate Strategic Holds (<8%) - Last priority
        return {
            tier: 5,
            label: 'LOW-RATE HOLDS',
            priority: 'LOW',
            note: debt.creditorName.includes('SBA') ? 'Consider keeping long-term' : null
        };
    }

    /**
     * Check if promotional expiration is imminent (≤30 days)
     * @param {Object} debt - Debt object
     * @returns {boolean}
     */
    static hasImminentPromo(debt) {
        if (!debt.promotionalAPR || !debt.promotionalAPR.expirationDate) return false;
        const daysUntil = this.getDaysUntilExpiration(debt.promotionalAPR.expirationDate);
        return daysUntil > 0 && daysUntil <= 30;
    }

    /**
     * Calculate days until promotional expiration
     * @param {string} dateString - ISO date string (YYYY-MM-DD)
     * @returns {number} Days until expiration (negative if expired)
     */
    static getDaysUntilExpiration(dateString) {
        const expiration = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for accurate day count
        const diffTime = expiration - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Check if debt has a promotional balance
     * @param {Object} debt - Debt object
     * @returns {boolean}
     */
    static hasPromotionalBalance(debt) {
        return debt.promotionalAPR &&
               debt.promotionalAPR.promotionalBalance &&
               debt.promotionalAPR.promotionalBalance > 0;
    }

    /**
     * Group debts by tier
     * @param {Array} debts - Array of debt objects
     * @returns {Object} Object with tiers 1-5 as keys, arrays of debts as values
     */
    static groupByTier(debts) {
        const groups = { 1: [], 2: [], 3: [], 4: [], 5: [] };

        debts.forEach(debt => {
            const classification = this.classifyDebt(debt);
            const enrichedDebt = {
                ...debt,
                classification
            };
            groups[classification.tier].push(enrichedDebt);
        });

        // Sort each tier
        // Tier 1: Past due first, then overlimit, then imminent promos
        groups[1].sort((a, b) => {
            if (a.isPastDue && !b.isPastDue) return -1;
            if (!a.isPastDue && b.isPastDue) return 1;
            if (a.isOverlimit && !b.isOverlimit) return -1;
            if (!a.isOverlimit && b.isOverlimit) return 1;
            return 0;
        });

        // Tier 2: Sort by expiration date (soonest first)
        groups[2].sort((a, b) => {
            const daysA = this.getDaysUntilExpiration(a.promotionalAPR.expirationDate);
            const daysB = this.getDaysUntilExpiration(b.promotionalAPR.expirationDate);
            return daysA - daysB;
        });

        // Tiers 3-5: Sort by APR (highest first - avalanche method)
        for (let tier = 3; tier <= 5; tier++) {
            groups[tier].sort((a, b) => b.apr - a.apr);
        }

        return groups;
    }

    /**
     * Get reason for crisis classification
     * @param {Object} debt - Debt object
     * @returns {string}
     */
    static getCrisisReason(debt) {
        if (debt.isPastDue) return 'Past Due';
        if (debt.isOverlimit) return 'Over Credit Limit';
        if (this.hasImminentPromo(debt)) {
            const days = this.getDaysUntilExpiration(debt.promotionalAPR.expirationDate);
            return `Promo expires in ${days} days`;
        }
        return 'Crisis';
    }

    /**
     * Categorize high-rate debts
     * @param {number} apr - Annual Percentage Rate
     * @returns {string}
     */
    static getHighRateCategory(apr) {
        if (apr >= 25) return 'Extremely High (≥25%)';
        if (apr >= 18) return 'Very High (18-25%)';
        if (apr >= 15) return 'High (15-18%)';
        return 'Moderate-High (12-15%)';
    }

    /**
     * Get tier label
     * @param {number} tier - Tier number (1-5)
     * @returns {string}
     */
    static getTierLabel(tier) {
        const labels = {
            1: 'CRISIS/URGENT',
            2: 'PROMOTIONAL DEFENSE',
            3: 'TOXIC HIGH-RATE',
            4: 'MODERATE RATE',
            5: 'LOW-RATE HOLDS'
        };
        return labels[tier] || 'UNKNOWN';
    }

    /**
     * Get priority badge color
     * @param {string} priority - Priority level
     * @returns {string}
     */
    static getPriorityColor(priority) {
        const colors = {
            'CRITICAL': '#c53030',  // Red
            'URGENT': '#dd6b20',    // Orange
            'HIGH': '#9c1c1c',      // Dark red
            'MEDIUM': '#d69e2e',    // Yellow
            'LOW': '#38a169'        // Green
        };
        return colors[priority] || '#718096';
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebtClassifier;
}
