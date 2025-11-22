/**
 * SectionBuilder - Context-aware HTML section builder
 * Dynamically builds HTML sections based on strategy data
 */
class SectionBuilder {
    constructor() {
        this.formatter = window.FinancialCalculator || {
            formatCurrency: (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            formatLargeNumber: (amount) => {
                if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
                if (amount >= 100000) return `$${(amount / 1000).toFixed(0)}K`;
                return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            }
        };
    }

    /**
     * Build strategy overview section with real recommendations
     * @param {Object} recommendation - Recommendation from phase2
     * @param {Object} timeline - Timeline information
     * @returns {string} HTML string
     */
    buildStrategyOverview(recommendation, timeline) {
        const savings = timeline.interestSavedVsSnowball || 0;
        const savingsVsMinimums = timeline.interestSavedVsMinimums || 0;

        return `
            <div class="strategy-box">
                <h3 data-field="strategy-name">📋 ${recommendation.primaryStrategy}</h3>
                <p style="margin: 15px 0; font-size: 1.1em;">${recommendation.reasoning}</p>

                <div class="strategy-grid">
                    <div class="strategy-item">
                        <strong>Debt-Free Date:</strong><br>
                        <span data-field="debt-free-date" style="font-size: 1.3em; color: white;">${timeline.debtFreeDate}</span>
                    </div>
                    <div class="strategy-item">
                        <strong>Timeline:</strong><br>
                        <span style="font-size: 1.3em; color: white;">${timeline.monthsToPayoff} months (${timeline.yearsToPayoff} years)</span>
                    </div>
                    <div class="strategy-item">
                        <strong>Total Interest:</strong><br>
                        <span data-field="total-interest" style="font-size: 1.3em; color: white;">${this.formatter.formatCurrency(timeline.totalInterestPaid)}</span>
                    </div>
                    <div class="strategy-item">
                        <strong>Savings vs Snowball:</strong><br>
                        <span data-field="interest-saved" style="font-size: 1.3em; color: #ffd700;">${this.formatter.formatCurrency(savings)}</span>
                    </div>
                    <div class="strategy-item">
                        <strong>Savings vs Minimums:</strong><br>
                        <span style="font-size: 1.3em; color: #ffd700;">${this.formatter.formatCurrency(savingsVsMinimums)}</span>
                    </div>
                    <div class="strategy-item">
                        <strong>First Payoff:</strong><br>
                        <span style="font-size: 1.3em; color: white;">${timeline.firstPayoffDate || 'Calculating...'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Build execution timeline from payoff order and milestones
     * @param {Array} payoffOrder - Ordered list of debts
     * @param {Array} milestones - Major milestones
     * @returns {string} HTML string
     */
    buildExecutionTimeline(payoffOrder, milestones) {
        let html = '<div class="timeline">';

        // Group payoff order into phases
        const phases = this.groupIntoPhases(payoffOrder, milestones);

        phases.forEach((phase, index) => {
            const isComplete = phase.status === 'complete';
            html += `
                <div class="timeline-item ${isComplete ? 'complete' : ''}">
                    <div class="timeline-marker ${isComplete ? 'complete' : ''}"></div>
                    <h4>${phase.title} ${isComplete ? '✓' : ''}</h4>
                    <p style="color: #718096; font-weight: 600; margin: 5px 0;">${phase.timeline}</p>
                    <ul style="margin: 10px 0 0 20px; color: #4a5568;">
                        ${phase.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Group payoff order into execution phases
     * @param {Array} payoffOrder - Ordered list of debts
     * @param {Array} milestones - Major milestones
     * @returns {Array} Array of phase objects
     */
    groupIntoPhases(payoffOrder, milestones) {
        const phases = [];

        // Phase 1: Promotional Defense (if any 0% APR debts)
        const promoDebts = payoffOrder.filter(d => d.apr === 0 || d.apr < 1);
        if (promoDebts.length > 0) {
            phases.push({
                title: 'Phase 1: Promotional Defense',
                timeline: 'First 6 months',
                status: 'active',
                actions: [
                    `Eliminate ${promoDebts.length} promotional balances before expiration`,
                    'Avoid deferred interest charges',
                    `Save ${this.formatter.formatCurrency(promoDebts.reduce((sum, d) => sum + (d.deferredInterestAtRisk || 0), 0))} in deferred interest`
                ]
            });
        }

        // Phase 2: High-Rate Attack (APR >= 12%)
        const highRateDebts = payoffOrder.filter(d => d.apr >= 12 && d.apr > 1);
        if (highRateDebts.length > 0) {
            phases.push({
                title: 'Phase 2: High-Rate Avalanche Attack',
                timeline: promoDebts.length > 0 ? 'Months 7-36' : 'Months 1-30',
                status: 'pending',
                actions: [
                    `Target ${highRateDebts.length} debts with APR ≥ 12%`,
                    'Maximize interest savings',
                    'Snowball payments as debts are eliminated'
                ]
            });
        }

        // Phase 3: Moderate-Rate Elimination (APR 8-12%)
        const moderateRateDebts = payoffOrder.filter(d => d.apr >= 8 && d.apr < 12);
        if (moderateRateDebts.length > 0) {
            phases.push({
                title: 'Phase 3: Moderate-Rate Elimination',
                timeline: 'Mid-journey',
                status: 'pending',
                actions: [
                    `Clear ${moderateRateDebts.length} debts with 8-12% APR`,
                    'Maintain momentum',
                    'Consider refinancing opportunities'
                ]
            });
        }

        // Phase 4: Low-Rate Cleanup (APR < 8%)
        const lowRateDebts = payoffOrder.filter(d => d.apr < 8 && d.apr > 0);
        if (lowRateDebts.length > 0) {
            phases.push({
                title: 'Phase 4: Low-Rate Cleanup',
                timeline: 'Final phase',
                status: 'pending',
                actions: [
                    `Eliminate remaining ${lowRateDebts.length} low-rate debts`,
                    'Celebrate approaching debt freedom',
                    'Plan for post-debt financial goals'
                ]
            });
        }

        return phases;
    }

    /**
     * Build mortgage strategy section (conditional)
     * @param {Object} mortgageStrategy - Mortgage strategy from engine
     * @returns {string} HTML string or empty if no mortgages
     */
    buildMortgageSection(mortgageStrategy) {
        if (!mortgageStrategy.hasMortgages) {
            return '';
        }

        let html = `
            <div style="background: linear-gradient(135deg, #4299e1 0%, #2c5282 100%); color: white; padding: 30px; border-radius: 12px; margin: 30px 0;">
                <h2 style="color: white; border: none; margin: 0 0 20px 0;">🏠 Mortgage Strategy</h2>
                <p style="font-size: 1.1em; margin-bottom: 20px;">${mortgageStrategy.strategy}</p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px;">
                        <h4 style="color: white; margin: 0 0 10px 0;">Total Mortgage Debt</h4>
                        <div data-field="total-mortgage-balance" style="font-size: 2em; font-weight: 700;">${this.formatter.formatLargeNumber(mortgageStrategy.totalBalance)}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px;">
                        <h4 style="color: white; margin: 0 0 10px 0;">Monthly Payment</h4>
                        <div style="font-size: 2em; font-weight: 700;">${this.formatter.formatCurrency(mortgageStrategy.totalPayment)}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px;">
                        <h4 style="color: white; margin: 0 0 10px 0;">Average APR</h4>
                        <div style="font-size: 2em; font-weight: 700;">${mortgageStrategy.avgAPR.toFixed(2)}%</div>
                    </div>
                </div>

                <table style="width: 100%; background: white; color: #4a5568; border-radius: 8px; overflow: hidden;">
                    <thead style="background: #2c5282; color: white;">
                        <tr>
                            <th style="padding: 15px; text-align: left;">Property/Lender</th>
                            <th style="padding: 15px; text-align: right;">Balance</th>
                            <th style="padding: 15px; text-align: right;">APR</th>
                            <th style="padding: 15px; text-align: right;">Monthly Payment</th>
                            <th style="padding: 15px; text-align: center;">Strategy</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        mortgageStrategy.mortgages.forEach(mortgage => {
            const needsRefi = mortgage.apr > 7.0;
            html += `
                <tr data-mortgage="${mortgage.creditorName}" style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 15px;"><strong>${mortgage.creditorName}</strong></td>
                    <td data-field="balance" style="padding: 15px; text-align: right; font-weight: 700;">${this.formatter.formatCurrency(mortgage.currentBalance)}</td>
                    <td data-field="apr" style="padding: 15px; text-align: right; font-weight: 700; color: ${needsRefi ? '#e53e3e' : '#2c5282'};">${mortgage.apr.toFixed(3)}%</td>
                    <td data-field="payment" style="padding: 15px; text-align: right;">${this.formatter.formatCurrency(mortgage.minimumPayment)}</td>
                    <td style="padding: 15px; text-align: center;">
                        <span style="background: ${needsRefi ? '#fed7d7' : '#c6f6d5'}; color: ${needsRefi ? '#c53030' : '#2f855a'}; padding: 5px 10px; border-radius: 15px; font-size: 0.85em; font-weight: 600;">
                            ${needsRefi ? 'Consider Refi' : 'Minimums Only'}
                        </span>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
        `;

        // Add refinancing triggers if any
        if (mortgageStrategy.refinancingOpportunities.length > 0) {
            html += `
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="color: white; margin: 0 0 15px 0;">🎯 Refinancing Opportunities</h4>
            `;

            mortgageStrategy.refinancingTriggers.forEach(trigger => {
                html += `
                    <p style="margin: 10px 0;">
                        <strong>${trigger.creditor}</strong>: Refinance if rates drop to ${trigger.targetAPR}% or below<br>
                        <span style="font-size: 0.9em;">Potential savings: ~${this.formatter.formatCurrency(trigger.potentialSavings)}/month</span>
                    </p>
                `;
            });

            html += `
                </div>
            `;
        }

        html += `
            </div>
        `;

        return html;
    }

    /**
     * Build promotional deadlines alert (conditional)
     * @param {Array} deadlines - Promotional deadlines from engine
     * @returns {string} HTML string or empty if no promos
     */
    buildPromotionalAlert(deadlines) {
        if (deadlines.length === 0) {
            return '';
        }

        const totalAtRisk = deadlines.reduce((sum, d) => sum + d.deferredInterestAtRisk, 0);

        let html = `
            <div class="interest-alert" style="background: #fff5f5; border: 3px solid #e53e3e; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #c53030; margin: 0 0 15px 0;">⚠️ URGENT: Promotional Deadlines</h3>
                <p style="font-size: 1.2em; color: #4a5568; margin-bottom: 20px;">
                    <strong data-field="total-deferred-interest">${this.formatter.formatCurrency(totalAtRisk)}</strong> in deferred interest at risk across ${deadlines.length} promotional balances
                </p>

                <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden;">
                    <thead style="background: #c53030; color: white;">
                        <tr>
                            <th style="padding: 12px; text-align: left;">Debt</th>
                            <th style="padding: 12px; text-align: right;">Balance</th>
                            <th style="padding: 12px; text-align: center;">Expiration</th>
                            <th style="padding: 12px; text-align: center;">Days Left</th>
                            <th style="padding: 12px; text-align: right;">At Risk</th>
                            <th style="padding: 12px; text-align: center;">Urgency</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        deadlines.forEach(deadline => {
            const urgencyColor = {
                'CRITICAL': '#c53030',
                'HIGH': '#dd6b20',
                'MEDIUM': '#d69e2e',
                'LOW': '#38a169'
            }[deadline.urgency];

            const urgencyBg = {
                'CRITICAL': '#fed7d7',
                'HIGH': '#feebc8',
                'MEDIUM': '#fefcbf',
                'LOW': '#c6f6d5'
            }[deadline.urgency];

            html += `
                <tr data-promo-debt="${deadline.creditorName}" style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;"><strong>${deadline.creditorName}</strong></td>
                    <td data-field="balance" style="padding: 12px; text-align: right; font-weight: 700;">${this.formatter.formatCurrency(deadline.balance)}</td>
                    <td data-field="expiration" style="padding: 12px; text-align: center; font-weight: 600;">${deadline.expirationDate}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 700; color: ${urgencyColor};">${deadline.daysUntil} days</td>
                    <td data-field="deferred-interest" style="padding: 12px; text-align: right; font-weight: 700; color: #e53e3e;">${this.formatter.formatCurrency(deadline.deferredInterestAtRisk)}</td>
                    <td style="padding: 12px; text-align: center;">
                        <span style="background: ${urgencyBg}; color: ${urgencyColor}; padding: 5px 10px; border-radius: 15px; font-size: 0.85em; font-weight: 600;">
                            ${deadline.urgency}
                        </span>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    /**
     * Build next actions checklist
     * @param {Array} actions - Next actions from phase4c
     * @returns {string} HTML string
     */
    buildNextActionsChecklist(actions) {
        if (actions.length === 0) {
            return '<p>No pending actions at this time.</p>';
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">';

        actions.forEach((action, index) => {
            const priorityColor = {
                'CRITICAL': '#c53030',
                'HIGH': '#dd6b20',
                'MEDIUM': '#d69e2e',
                'LOW': '#38a169'
            }[action.priority] || '#4a5568';

            html += `
                <div class="checklist-section">
                    <h4>${index + 1}. ${action.timeline || 'Action Item'}</h4>
                    <div class="checklist-item" style="background: #f7fafc; padding: 15px; border-radius: 6px;">
                        <div data-field="description" style="font-weight: 600; margin-bottom: 10px;">${action.description}</div>
                        ${action.dueDate ? `<div data-field="due-date" style="color: #718096; font-size: 0.9em;">Due: ${action.dueDate}</div>` : ''}
                        <span data-field="priority" style="display: inline-block; margin-top: 10px; background: ${priorityColor}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.85em; font-weight: 600;">
                            ${action.priority || 'NORMAL'}
                        </span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionBuilder;
}
