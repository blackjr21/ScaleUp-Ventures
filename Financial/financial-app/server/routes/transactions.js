const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * GET /api/transactions
 * Get all transactions for the authenticated user
 * Optional query params: type (INFLOW/OUTFLOW), isActive (true/false)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, isActive } = req.query;

    const where = {
      userId: req.user.userId
    };

    // Optional filters
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: req.user.userId // Ensure user can only access their own transactions
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction'
    });
  }
});

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, amount, type, frequency, dayOfMonth, anchorDate, isActive } = req.body;

    // Validation
    if (!name || !amount || !type || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, amount, type, frequency'
      });
    }

    // Validate type
    if (!['INFLOW', 'OUTFLOW'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be INFLOW or OUTFLOW'
      });
    }

    // Validate frequency
    const validFrequencies = ['ONE_TIME', 'MONTHLY', 'BIWEEKLY', 'WEEKDAY', 'FRIDAY'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: `Frequency must be one of: ${validFrequencies.join(', ')}`
      });
    }

    // Validate frequency-specific requirements
    if (frequency === 'MONTHLY' && !dayOfMonth) {
      return res.status(400).json({
        success: false,
        error: 'dayOfMonth is required for MONTHLY frequency'
      });
    }

    if ((frequency === 'BIWEEKLY' || frequency === 'ONE_TIME') && !anchorDate) {
      return res.status(400).json({
        success: false,
        error: `anchorDate is required for ${frequency} frequency`
      });
    }

    const transactionData = {
      userId: req.user.userId,
      name,
      amount: parseFloat(amount),
      type,
      frequency,
      isActive: isActive !== undefined ? isActive : true
    };

    // Add optional fields
    if (dayOfMonth) {
      transactionData.dayOfMonth = parseInt(dayOfMonth);
    }
    if (anchorDate) {
      transactionData.anchorDate = new Date(anchorDate);
    }

    const transaction = await prisma.transaction.create({
      data: transactionData
    });

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
});

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { name, amount, type, frequency, dayOfMonth, anchorDate, isActive } = req.body;

    // Verify transaction exists and belongs to user
    const existing = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: req.user.userId
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    const updateData = {};

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (type !== undefined) {
      if (!['INFLOW', 'OUTFLOW'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be INFLOW or OUTFLOW'
        });
      }
      updateData.type = type;
    }
    if (frequency !== undefined) {
      const validFrequencies = ['ONE_TIME', 'MONTHLY', 'BIWEEKLY', 'WEEKDAY', 'FRIDAY'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({
          success: false,
          error: `Frequency must be one of: ${validFrequencies.join(', ')}`
        });
      }
      updateData.frequency = frequency;
    }
    if (dayOfMonth !== undefined) {
      updateData.dayOfMonth = dayOfMonth ? parseInt(dayOfMonth) : null;
    }
    if (anchorDate !== undefined) {
      updateData.anchorDate = anchorDate ? new Date(anchorDate) : null;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData
    });

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction'
    });
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);

    // Verify transaction exists and belongs to user
    const existing = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: req.user.userId
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    await prisma.transaction.delete({
      where: { id: transactionId }
    });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction'
    });
  }
});

module.exports = router;
