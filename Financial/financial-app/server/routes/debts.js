/**
 * Debt CRUD API Routes
 * Endpoints for managing user debts
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const DebtCalculator = require('../services/DebtCalculator');

const prisma = new PrismaClient();

/**
 * POST /api/debts
 * Create a new debt
 */
router.post('/', async (req, res) => {
    try {
        const { name, creditor, balance, apr, minimumPayment } = req.body;
        const userId = req.user.userId;

        // Validate required fields
        if (!name || !creditor || balance === undefined || apr === undefined || minimumPayment === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: name, creditor, balance, apr, minimumPayment'
            });
        }

        // Create debt
        const debt = await prisma.debt.create({
            data: {
                userId,
                name,
                creditor,
                balance: parseFloat(balance),
                apr: parseFloat(apr),
                minimumPayment: parseFloat(minimumPayment),
                isActive: true
            }
        });

        res.status(201).json({ debt });
    } catch (error) {
        console.error('Error creating debt:', error);
        res.status(500).json({ error: 'Failed to create debt' });
    }
});

/**
 * GET /api/debts
 * List all debts for the authenticated user
 * Query params:
 *   - includeInactive=true to include soft-deleted debts
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const includeInactive = req.query.includeInactive === 'true';

        // Build query
        const where = { userId };
        if (!includeInactive) {
            where.isActive = true;
        }

        // Fetch debts
        const debts = await prisma.debt.findMany({
            where,
            orderBy: [
                { isActive: 'desc' },
                { apr: 'desc' }
            ]
        });

        // Calculate summary metrics
        const activeDebts = debts.filter(d => d.isActive);
        const summary = {
            totalDebt: activeDebts.reduce((sum, d) => sum + d.balance, 0),
            totalMinimumPayments: activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0),
            totalMonthlyInterest: DebtCalculator.calculateTotalMonthlyInterest(activeDebts),
            averageAPR: activeDebts.length > 0
                ? DebtCalculator.calculateWeightedAPR(activeDebts)
                : 0,
            debtCount: activeDebts.length
        };

        res.json({ debts, summary });
    } catch (error) {
        console.error('Error fetching debts:', error);
        res.status(500).json({ error: 'Failed to fetch debts' });
    }
});

/**
 * GET /api/debts/:id
 * Get a single debt by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const debtId = parseInt(req.params.id);
        const userId = req.user.userId;

        const debt = await prisma.debt.findFirst({
            where: {
                id: debtId,
                userId // Ensure user can only access their own debts
            }
        });

        if (!debt) {
            return res.status(404).json({ error: 'Debt not found' });
        }

        res.json({ debt });
    } catch (error) {
        console.error('Error fetching debt:', error);
        res.status(500).json({ error: 'Failed to fetch debt' });
    }
});

/**
 * PUT /api/debts/:id
 * Update a debt
 */
router.put('/:id', async (req, res) => {
    try {
        const debtId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { name, creditor, balance, apr, minimumPayment, isActive } = req.body;

        // Verify debt exists and belongs to user
        const existing = await prisma.debt.findFirst({
            where: {
                id: debtId,
                userId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Debt not found' });
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (creditor !== undefined) updateData.creditor = creditor;
        if (balance !== undefined) updateData.balance = parseFloat(balance);
        if (apr !== undefined) updateData.apr = parseFloat(apr);
        if (minimumPayment !== undefined) updateData.minimumPayment = parseFloat(minimumPayment);
        if (isActive !== undefined) updateData.isActive = isActive;

        // Update debt
        const debt = await prisma.debt.update({
            where: { id: debtId },
            data: updateData
        });

        res.json({ debt });
    } catch (error) {
        console.error('Error updating debt:', error);
        res.status(500).json({ error: 'Failed to update debt' });
    }
});

/**
 * DELETE /api/debts/:id
 * Soft delete a debt (mark as inactive)
 */
router.delete('/:id', async (req, res) => {
    try {
        const debtId = parseInt(req.params.id);
        const userId = req.user.userId;

        // Verify debt exists and belongs to user
        const existing = await prisma.debt.findFirst({
            where: {
                id: debtId,
                userId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Debt not found' });
        }

        // Soft delete (mark as inactive)
        await prisma.debt.update({
            where: { id: debtId },
            data: { isActive: false }
        });

        res.json({ message: 'Debt deleted successfully' });
    } catch (error) {
        console.error('Error deleting debt:', error);
        res.status(500).json({ error: 'Failed to delete debt' });
    }
});

module.exports = router;
