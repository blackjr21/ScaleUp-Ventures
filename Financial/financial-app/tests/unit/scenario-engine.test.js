const ScenarioEngine = require('../../server/services/ScenarioEngine');

describe('ScenarioEngine Service', () => {
  const sampleTransactions = [
    {
      id: 1,
      name: 'Rent',
      amount: 1500,
      type: 'OUTFLOW',
      frequency: 'MONTHLY',
      dayOfMonth: 1
    },
    {
      id: 2,
      name: 'Groceries',
      amount: 400,
      type: 'OUTFLOW',
      frequency: 'MONTHLY',
      dayOfMonth: 15
    },
    {
      id: 3,
      name: 'Gym',
      amount: 50,
      type: 'OUTFLOW',
      frequency: 'MONTHLY',
      dayOfMonth: 10
    },
    {
      id: 4,
      name: 'Paycheck',
      amount: 3000,
      type: 'INFLOW',
      frequency: 'BIWEEKLY',
      anchorDate: new Date('2025-11-01')
    }
  ];

  const startDate = new Date('2025-11-01');
  const startingBalance = 2000;

  describe('applyModifications', () => {
    test('should exclude transactions with exclude action', () => {
      const modifications = [
        { transactionId: 3, action: 'exclude' } // Exclude Gym
      ];

      const result = ScenarioEngine.applyModifications(sampleTransactions, modifications);

      expect(result.length).toBe(3); // Should have 3 transactions (Gym excluded)
      expect(result.find(t => t.id === 3)).toBeUndefined();
      expect(result.find(t => t.id === 1)).toBeDefined();
    });

    test('should modify transaction amount with modify_amount action', () => {
      const modifications = [
        { transactionId: 2, action: 'modify_amount', modifiedAmount: 300 } // Reduce Groceries
      ];

      const result = ScenarioEngine.applyModifications(sampleTransactions, modifications);

      const groceries = result.find(t => t.id === 2);
      expect(groceries.amount).toBe(300);
    });

    test('should reschedule transaction with reschedule action', () => {
      const newDate = new Date('2025-12-25');
      const modifications = [
        { transactionId: 1, action: 'reschedule', modifiedDate: newDate } // Reschedule Rent
      ];

      const result = ScenarioEngine.applyModifications(sampleTransactions, modifications);

      const rent = result.find(t => t.id === 1);
      expect(rent.frequency).toBe('ONE_TIME');
      expect(rent.anchorDate).toEqual(newDate);
      expect(rent.dayOfMonth).toBeNull();
    });

    test('should handle multiple modifications', () => {
      const modifications = [
        { transactionId: 2, action: 'modify_amount', modifiedAmount: 350 },
        { transactionId: 3, action: 'exclude' }
      ];

      const result = ScenarioEngine.applyModifications(sampleTransactions, modifications);

      expect(result.length).toBe(3);
      expect(result.find(t => t.id === 3)).toBeUndefined();
      expect(result.find(t => t.id === 2).amount).toBe(350);
    });

    test('should return original transactions if no modifications', () => {
      const result = ScenarioEngine.applyModifications(sampleTransactions, []);

      expect(result.length).toBe(4);
      expect(result).toEqual(sampleTransactions);
    });
  });

  describe('calculateSavings', () => {
    test('should calculate total savings correctly', () => {
      const baseline = {
        summary: { endingBalance: 500 },
        days: [
          { date: '2025-11-01', balance: 2000 },
          { date: '2025-11-02', balance: 1500 },
          { date: '2025-11-03', balance: 500 }
        ]
      };

      const modified = {
        summary: { endingBalance: 800 },
        days: [
          { date: '2025-11-01', balance: 2000 },
          { date: '2025-11-02', balance: 1600 },
          { date: '2025-11-03', balance: 800 }
        ]
      };

      const result = ScenarioEngine.calculateSavings(baseline, modified);

      expect(result.totalSavings).toBe(300); // 800 - 500
      expect(result.baselineEndingBalance).toBe(500);
      expect(result.modifiedEndingBalance).toBe(800);
      expect(result.dailySavings).toHaveLength(3);
      expect(result.dailySavings[2].dailySavings).toBe(300);
    });

    test('should handle negative savings (worse outcome)', () => {
      const baseline = {
        summary: { endingBalance: 1000 },
        days: [{ date: '2025-11-01', balance: 1000 }]
      };

      const modified = {
        summary: { endingBalance: 800 },
        days: [{ date: '2025-11-01', balance: 800 }]
      };

      const result = ScenarioEngine.calculateSavings(baseline, modified);

      expect(result.totalSavings).toBe(-200);
    });
  });

  describe('generateComparison', () => {
    test('should generate complete comparison summary', () => {
      const baseline = {
        days: [
          { date: '2025-11-01' },
          { date: '2025-11-30' }
        ],
        summary: {
          startingBalance: 2000,
          endingBalance: 500,
          netChange: -1500,
          lowestBalance: 300,
          lowestBalanceDate: '2025-11-15'
        },
        alerts: [{ type: 'LOW' }, { type: 'LOW' }]
      };

      const modified = {
        days: [
          { date: '2025-11-01' },
          { date: '2025-11-30' }
        ],
        summary: {
          startingBalance: 2000,
          endingBalance: 800,
          netChange: -1200,
          lowestBalance: 600,
          lowestBalanceDate: '2025-11-20'
        },
        alerts: [{ type: 'LOW' }]
      };

      const savings = {
        totalSavings: 300,
        baselineEndingBalance: 500,
        modifiedEndingBalance: 800
      };

      const result = ScenarioEngine.generateComparison(baseline, modified, savings);

      expect(result.dayCount).toBe(2);
      expect(result.baseline.endingBalance).toBe(500);
      expect(result.modified.endingBalance).toBe(800);
      expect(result.improvement.totalSavings).toBe(300);
      expect(result.improvement.lowestBalanceImprovement).toBe(300);
      expect(result.improvement.alertsReduced).toBe(1);
      expect(result.improvement.percentageImprovement).toBe(60);
    });
  });

  describe('helper methods', () => {
    test('getExcludedTransactions should return excluded transaction IDs', () => {
      const modifications = [
        { transactionId: 1, action: 'exclude' },
        { transactionId: 2, action: 'modify_amount', modifiedAmount: 100 },
        { transactionId: 3, action: 'exclude' }
      ];

      const result = ScenarioEngine.getExcludedTransactions(modifications);

      expect(result).toEqual([1, 3]);
    });

    test('getModifiedAmounts should return modified amounts', () => {
      const modifications = [
        { transactionId: 1, action: 'exclude' },
        { transactionId: 2, action: 'modify_amount', modifiedAmount: 100 },
        { transactionId: 3, action: 'modify_amount', modifiedAmount: 200 }
      ];

      const result = ScenarioEngine.getModifiedAmounts(modifications);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ transactionId: 2, modifiedAmount: 100 });
      expect(result[1]).toEqual({ transactionId: 3, modifiedAmount: 200 });
    });

    test('getRescheduled should return rescheduled transactions', () => {
      const date1 = new Date('2025-12-01');
      const date2 = new Date('2025-12-15');

      const modifications = [
        { transactionId: 1, action: 'exclude' },
        { transactionId: 2, action: 'reschedule', modifiedDate: date1 },
        { transactionId: 3, action: 'reschedule', modifiedDate: date2 }
      ];

      const result = ScenarioEngine.getRescheduled(modifications);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ transactionId: 2, modifiedDate: date1 });
      expect(result[1]).toEqual({ transactionId: 3, modifiedDate: date2 });
    });
  });

  describe('compareScenarios integration', () => {
    test('should compare baseline vs scenario with excluded expense', () => {
      const modifications = [
        { transactionId: 3, action: 'exclude' } // Exclude Gym ($50)
      ];

      const result = ScenarioEngine.compareScenarios(
        sampleTransactions,
        modifications,
        startDate,
        startingBalance
      );

      expect(result).toHaveProperty('baseline');
      expect(result).toHaveProperty('modified');
      expect(result).toHaveProperty('savings');
      expect(result).toHaveProperty('comparison');

      // Both forecasts should have the same starting balance
      expect(result.baseline.summary.startingBalance).toBe(startingBalance);
      expect(result.modified.summary.startingBalance).toBe(startingBalance);

      // Verify the comparison structure
      expect(result.comparison).toHaveProperty('baseline');
      expect(result.comparison).toHaveProperty('modified');
      expect(result.comparison).toHaveProperty('improvement');
    });

    test('should compare baseline vs scenario with reduced expense', () => {
      const modifications = [
        { transactionId: 2, action: 'modify_amount', modifiedAmount: 300 } // Reduce Groceries from $400 to $300
      ];

      const result = ScenarioEngine.compareScenarios(
        sampleTransactions,
        modifications,
        startDate,
        startingBalance
      );

      // Both forecasts should start with same balance
      expect(result.baseline.summary.startingBalance).toBe(startingBalance);
      expect(result.modified.summary.startingBalance).toBe(startingBalance);

      // Verify savings calculation exists
      expect(result.savings).toHaveProperty('totalSavings');
      expect(result.savings).toHaveProperty('baselineEndingBalance');
      expect(result.savings).toHaveProperty('modifiedEndingBalance');
      expect(result.savings).toHaveProperty('dailySavings');

      // Daily savings should have entries for each forecast day
      expect(result.savings.dailySavings.length).toBe(result.baseline.days.length);
    });
  });
});
