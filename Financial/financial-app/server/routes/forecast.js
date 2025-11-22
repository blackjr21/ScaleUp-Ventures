const express = require('express');
const { PrismaClient } = require('@prisma/client');
const ForecastEngine = require('../services/ForecastEngine');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/forecast - Generate cash flow forecast
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, startingBalance } = req.body;

    if (!startDate || startingBalance === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['startDate', 'startingBalance']
      });
    }

    // Get user's active transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        isActive: true
      }
    });

    // Generate forecast
    const forecast = ForecastEngine.generateForecast(
      transactions,
      new Date(startDate),
      startingBalance
    );

    res.status(200).json({
      success: true,
      forecast,
      metadata: {
        transactionCount: transactions.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate forecast'
    });
  }
});

module.exports = router;
