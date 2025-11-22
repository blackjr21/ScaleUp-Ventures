const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const ScenarioEngine = require('../services/ScenarioEngine');

const prisma = new PrismaClient();

/**
 * GET /api/scenarios
 * Get all scenarios for authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { userId: req.user.userId },
      include: {
        modifications: {
          include: {
            transaction: {
              select: {
                id: true,
                name: true,
                amount: true,
                type: true,
                frequency: true
              }
            }
          }
        },
        results: {
          orderBy: { calculatedAt: 'desc' },
          take: 1 // Most recent result
        }
      },
      orderBy: [
        { isPreset: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    res.status(200).json({
      success: true,
      count: scenarios.length,
      scenarios
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenarios'
    });
  }
});

/**
 * GET /api/scenarios/:id
 * Get single scenario with modifications
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);

    const scenario = await prisma.scenario.findFirst({
      where: {
        id: scenarioId,
        userId: req.user.userId
      },
      include: {
        modifications: {
          include: {
            transaction: true
          }
        },
        results: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    res.status(200).json({
      success: true,
      scenario
    });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenario'
    });
  }
});

/**
 * POST /api/scenarios
 * Create new scenario
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, isPreset, modifications } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Scenario name is required'
      });
    }

    // Create scenario with modifications in transaction
    const scenario = await prisma.scenario.create({
      data: {
        userId: req.user.userId,
        name,
        description: description || null,
        isPreset: isPreset || false,
        modifications: modifications ? {
          create: modifications.map(mod => ({
            transactionId: mod.transactionId,
            action: mod.action,
            modifiedAmount: mod.modifiedAmount || null,
            modifiedDate: mod.modifiedDate ? new Date(mod.modifiedDate) : null
          }))
        } : undefined
      },
      include: {
        modifications: {
          include: {
            transaction: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      scenario
    });
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create scenario'
    });
  }
});

/**
 * PUT /api/scenarios/:id
 * Update scenario
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    const { name, description, isPreset, modifications } = req.body;

    // Verify ownership
    const existing = await prisma.scenario.findFirst({
      where: {
        id: scenarioId,
        userId: req.user.userId
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    // Update scenario and modifications in transaction
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPreset !== undefined) updateData.isPreset = isPreset;

    // If modifications provided, replace all existing ones
    if (modifications) {
      // Delete existing modifications
      await prisma.scenarioModification.deleteMany({
        where: { scenarioId }
      });

      // Create new modifications
      updateData.modifications = {
        create: modifications.map(mod => ({
          transactionId: mod.transactionId,
          action: mod.action,
          modifiedAmount: mod.modifiedAmount || null,
          modifiedDate: mod.modifiedDate ? new Date(mod.modifiedDate) : null
        }))
      };
    }

    const scenario = await prisma.scenario.update({
      where: { id: scenarioId },
      data: updateData,
      include: {
        modifications: {
          include: {
            transaction: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      scenario
    });
  } catch (error) {
    console.error('Error updating scenario:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scenario'
    });
  }
});

/**
 * DELETE /api/scenarios/:id
 * Delete scenario
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.scenario.findFirst({
      where: {
        id: scenarioId,
        userId: req.user.userId
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    await prisma.scenario.delete({
      where: { id: scenarioId }
    });

    res.status(200).json({
      success: true,
      message: 'Scenario deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scenario'
    });
  }
});

/**
 * POST /api/scenarios/:id/compare
 * Generate and cache scenario comparison
 */
router.post('/:id/compare', authenticateToken, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    const { startDate, startingBalance } = req.body;

    // Validation
    if (!startDate || startingBalance === undefined) {
      return res.status(400).json({
        success: false,
        error: 'startDate and startingBalance are required'
      });
    }

    // Get scenario with modifications
    const scenario = await prisma.scenario.findFirst({
      where: {
        id: scenarioId,
        userId: req.user.userId
      },
      include: {
        modifications: true
      }
    });

    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }

    // Get all user transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        isActive: true
      }
    });

    // Generate comparison using ScenarioEngine
    const comparison = ScenarioEngine.compareScenarios(
      transactions,
      scenario.modifications,
      new Date(startDate),
      parseFloat(startingBalance)
    );

    // Cache the result
    const forecastEndDate = new Date(comparison.comparison.endDate);
    const lowestBalanceDate = new Date(comparison.comparison.modified.lowestBalanceDate);

    await prisma.scenarioResult.create({
      data: {
        scenarioId,
        forecastStartDate: new Date(startDate),
        forecastEndDate,
        startingBalance: parseFloat(startingBalance),
        endingBalance: comparison.modified.summary.endingBalance,
        lowestBalance: comparison.modified.summary.lowestBalance,
        lowestBalanceDate,
        totalSavings: comparison.savings.totalSavings,
        dailyBalances: JSON.stringify(comparison.savings.dailySavings)
      }
    });

    res.status(200).json({
      success: true,
      comparison: {
        baseline: comparison.baseline,
        modified: comparison.modified,
        savings: comparison.savings,
        summary: comparison.comparison
      },
      metadata: {
        scenarioId,
        scenarioName: scenario.name,
        modificationsCount: scenario.modifications.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate comparison'
    });
  }
});

module.exports = router;
