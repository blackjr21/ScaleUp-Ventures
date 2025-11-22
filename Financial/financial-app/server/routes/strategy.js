/**
 * Debt Strategy Analysis API Routes
 * Endpoints for analyzing debt payoff strategies
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const DebtCalculator = require('../services/DebtCalculator');

const prisma = new PrismaClient();

/**
 * POST /api/strategy/analyze
 * Analyze all three debt payoff strategies and provide recommendation
 *
 * Request body:
 * {
 *   extraMonthlyPayment: number,
 *   consolidationAPR?: number,
 *   motivationStyle?: 'quick_wins' | 'optimization'
 * }
 */
router.post('/analyze', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { extraMonthlyPayment = 0, consolidationAPR = 15.0, motivationStyle = 'optimization' } = req.body;

        // Fetch user's active debts
        const debts = await prisma.debt.findMany({
            where: {
                userId,
                isActive: true
            },
            orderBy: { apr: 'desc' }
        });

        if (debts.length === 0) {
            return res.status(400).json({
                error: 'No active debts found',
                message: 'You must have at least one active debt to analyze payoff strategies'
            });
        }

        // Compare all three strategies
        const comparison = DebtCalculator.compareStrategies(
            debts,
            parseFloat(extraMonthlyPayment),
            parseFloat(consolidationAPR)
        );

        // Get personalized recommendation
        const recommendation = DebtCalculator.recommendStrategy(
            debts,
            parseFloat(extraMonthlyPayment),
            parseFloat(consolidationAPR),
            { motivationStyle }
        );

        // Save the recommended strategy to database
        const savedStrategy = await prisma.debtStrategy.create({
            data: {
                userId,
                strategyType: recommendation.recommended,
                extraMonthlyPayment: parseFloat(extraMonthlyPayment),
                totalDebt: comparison[recommendation.recommended].totalDebt,
                totalInterestPaid: comparison[recommendation.recommended].totalInterestPaid,
                payoffMonths: comparison[recommendation.recommended].payoffMonths,
                payoffDate: comparison[recommendation.recommended].payoffDate
            }
        });

        // Save payment schedule for recommended strategy
        const schedule = comparison[recommendation.recommended].schedule;
        const paymentRecords = schedule.map(entry => ({
            strategyId: savedStrategy.id,
            debtId: entry.debtId,
            monthNumber: entry.monthNumber,
            paymentDate: entry.paymentDate,
            paymentAmount: entry.paymentAmount,
            principal: entry.principal,
            interest: entry.interest,
            remainingBalance: entry.remainingBalance
        }));

        // Batch insert payment schedule
        await prisma.debtPayment.createMany({
            data: paymentRecords
        });

        res.json({
            strategyId: savedStrategy.id,
            recommendation: recommendation.recommended,
            reasoning: recommendation.reasoning,
            comparison: {
                avalanche: {
                    totalDebt: comparison.avalanche.totalDebt,
                    totalInterestPaid: comparison.avalanche.totalInterestPaid,
                    payoffMonths: comparison.avalanche.payoffMonths,
                    payoffDate: comparison.avalanche.payoffDate,
                    payoffOrder: comparison.avalanche.payoffOrder
                },
                snowball: {
                    totalDebt: comparison.snowball.totalDebt,
                    totalInterestPaid: comparison.snowball.totalInterestPaid,
                    payoffMonths: comparison.snowball.payoffMonths,
                    payoffDate: comparison.snowball.payoffDate,
                    payoffOrder: comparison.snowball.payoffOrder
                },
                consolidation: {
                    totalDebt: comparison.consolidation.totalDebt,
                    totalInterestPaid: comparison.consolidation.totalInterestPaid,
                    payoffMonths: comparison.consolidation.payoffMonths,
                    payoffDate: comparison.consolidation.payoffDate,
                    consolidatedAPR: comparison.consolidation.consolidatedAPR,
                    monthlyPayment: comparison.consolidation.monthlyPayment
                }
            },
            schedulePreview: schedule.slice(0, 12) // First year preview
        });
    } catch (error) {
        console.error('Error analyzing strategies:', error);
        res.status(500).json({ error: 'Failed to analyze debt strategies' });
    }
});

/**
 * GET /api/strategy/:id
 * Get a saved strategy with full payment schedule
 */
router.get('/:id', async (req, res) => {
    try {
        const strategyId = parseInt(req.params.id);
        const userId = req.user.userId;

        const strategy = await prisma.debtStrategy.findFirst({
            where: {
                id: strategyId,
                userId
            },
            include: {
                payments: {
                    orderBy: { monthNumber: 'asc' },
                    include: {
                        debt: true
                    }
                }
            }
        });

        if (!strategy) {
            return res.status(404).json({ error: 'Strategy not found' });
        }

        res.json({ strategy });
    } catch (error) {
        console.error('Error fetching strategy:', error);
        res.status(500).json({ error: 'Failed to fetch strategy' });
    }
});

module.exports = router;
