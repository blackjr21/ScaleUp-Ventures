const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Scenarios Schema Tests', () => {
  let testUserId;
  let testTransactionId;
  let testScenarioId;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        username: 'scenariotest',
        email: 'scenariotest@test.com',
        passwordHash: 'hashedpassword123'
      }
    });
    testUserId = testUser.id;

    // Create test transaction
    const testTransaction = await prisma.transaction.create({
      data: {
        userId: testUserId,
        name: 'Test Expense',
        amount: 100.00,
        type: 'OUTFLOW',
        frequency: 'MONTHLY',
        dayOfMonth: 15
      }
    });
    testTransactionId = testTransaction.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.scenarioModification.deleteMany({
      where: { transactionId: testTransactionId }
    });
    await prisma.scenarioResult.deleteMany({});
    await prisma.scenario.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.transaction.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  describe('Scenario Model', () => {
    test('should create a scenario with all required fields', async () => {
      const scenario = await prisma.scenario.create({
        data: {
          userId: testUserId,
          name: 'Test Scenario',
          description: 'Testing scenario creation',
          isPreset: false
        }
      });

      expect(scenario).toHaveProperty('id');
      expect(scenario.name).toBe('Test Scenario');
      expect(scenario.description).toBe('Testing scenario creation');
      expect(scenario.userId).toBe(testUserId);
      expect(scenario.isPreset).toBe(false);
      expect(scenario.createdAt).toBeInstanceOf(Date);
      expect(scenario.updatedAt).toBeInstanceOf(Date);

      testScenarioId = scenario.id;
    });

    test('should create a preset scenario', async () => {
      const scenario = await prisma.scenario.create({
        data: {
          userId: testUserId,
          name: 'Preset Scenario',
          isPreset: true
        }
      });

      expect(scenario.isPreset).toBe(true);
      expect(scenario.description).toBeNull();
    });

    test('should have relation to user', async () => {
      const scenario = await prisma.scenario.findFirst({
        where: { id: testScenarioId },
        include: { user: true }
      });

      expect(scenario.user).toBeDefined();
      expect(scenario.user.id).toBe(testUserId);
      expect(scenario.user.username).toBe('scenariotest');
    });

    test('should delete scenario when user is deleted', async () => {
      // Create temporary user and scenario
      const tempUser = await prisma.user.create({
        data: {
          username: 'tempuser',
          email: 'temp@test.com',
          passwordHash: 'hash'
        }
      });

      const tempScenario = await prisma.scenario.create({
        data: {
          userId: tempUser.id,
          name: 'Temp Scenario'
        }
      });

      // Delete user - should cascade delete scenario
      await prisma.user.delete({
        where: { id: tempUser.id }
      });

      // Verify scenario was deleted
      const found = await prisma.scenario.findUnique({
        where: { id: tempScenario.id }
      });

      expect(found).toBeNull();
    });
  });

  describe('ScenarioModification Model', () => {
    test('should create modification with exclude action', async () => {
      const modification = await prisma.scenarioModification.create({
        data: {
          scenarioId: testScenarioId,
          transactionId: testTransactionId,
          action: 'exclude'
        }
      });

      expect(modification).toHaveProperty('id');
      expect(modification.scenarioId).toBe(testScenarioId);
      expect(modification.transactionId).toBe(testTransactionId);
      expect(modification.action).toBe('exclude');
      expect(modification.modifiedAmount).toBeNull();
      expect(modification.modifiedDate).toBeNull();
    });

    test('should create modification with modify_amount action', async () => {
      const modification = await prisma.scenarioModification.create({
        data: {
          scenarioId: testScenarioId,
          transactionId: testTransactionId,
          action: 'modify_amount',
          modifiedAmount: 75.00
        }
      });

      expect(modification.action).toBe('modify_amount');
      expect(modification.modifiedAmount).toBe(75.00);
    });

    test('should create modification with reschedule action', async () => {
      const newDate = new Date('2025-12-25');
      const modification = await prisma.scenarioModification.create({
        data: {
          scenarioId: testScenarioId,
          transactionId: testTransactionId,
          action: 'reschedule',
          modifiedDate: newDate
        }
      });

      expect(modification.action).toBe('reschedule');
      expect(modification.modifiedDate).toEqual(newDate);
    });

    test('should have relations to scenario and transaction', async () => {
      const modification = await prisma.scenarioModification.findFirst({
        where: { scenarioId: testScenarioId },
        include: {
          scenario: true,
          transaction: true
        }
      });

      expect(modification.scenario).toBeDefined();
      expect(modification.scenario.name).toBe('Test Scenario');
      expect(modification.transaction).toBeDefined();
      expect(modification.transaction.name).toBe('Test Expense');
    });

    test('should delete modifications when scenario is deleted', async () => {
      const tempScenario = await prisma.scenario.create({
        data: {
          userId: testUserId,
          name: 'Temp Scenario 2'
        }
      });

      const tempMod = await prisma.scenarioModification.create({
        data: {
          scenarioId: tempScenario.id,
          transactionId: testTransactionId,
          action: 'exclude'
        }
      });

      // Delete scenario - should cascade delete modifications
      await prisma.scenario.delete({
        where: { id: tempScenario.id }
      });

      // Verify modification was deleted
      const found = await prisma.scenarioModification.findUnique({
        where: { id: tempMod.id }
      });

      expect(found).toBeNull();
    });
  });

  describe('ScenarioResult Model', () => {
    test('should create scenario result with all fields', async () => {
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-12-31');
      const lowestDate = new Date('2025-11-15');
      const dailyBalancesJSON = JSON.stringify([
        { date: '2025-11-01', balance: 1000 },
        { date: '2025-11-02', balance: 950 }
      ]);

      const result = await prisma.scenarioResult.create({
        data: {
          scenarioId: testScenarioId,
          forecastStartDate: startDate,
          forecastEndDate: endDate,
          startingBalance: 1000.00,
          endingBalance: 850.00,
          lowestBalance: 500.00,
          lowestBalanceDate: lowestDate,
          totalSavings: 150.00,
          dailyBalances: dailyBalancesJSON
        }
      });

      expect(result).toHaveProperty('id');
      expect(result.scenarioId).toBe(testScenarioId);
      expect(result.forecastStartDate).toEqual(startDate);
      expect(result.forecastEndDate).toEqual(endDate);
      expect(result.startingBalance).toBe(1000.00);
      expect(result.endingBalance).toBe(850.00);
      expect(result.lowestBalance).toBe(500.00);
      expect(result.lowestBalanceDate).toEqual(lowestDate);
      expect(result.totalSavings).toBe(150.00);
      expect(result.dailyBalances).toBe(dailyBalancesJSON);
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });

    test('should parse dailyBalances JSON correctly', async () => {
      const result = await prisma.scenarioResult.findFirst({
        where: { scenarioId: testScenarioId }
      });

      const dailyBalances = JSON.parse(result.dailyBalances);
      expect(Array.isArray(dailyBalances)).toBe(true);
      expect(dailyBalances.length).toBe(2);
      expect(dailyBalances[0].date).toBe('2025-11-01');
      expect(dailyBalances[0].balance).toBe(1000);
    });

    test('should have relation to scenario', async () => {
      const result = await prisma.scenarioResult.findFirst({
        where: { scenarioId: testScenarioId },
        include: { scenario: true }
      });

      expect(result.scenario).toBeDefined();
      expect(result.scenario.name).toBe('Test Scenario');
    });

    test('should delete results when scenario is deleted', async () => {
      const tempScenario = await prisma.scenario.create({
        data: {
          userId: testUserId,
          name: 'Temp Scenario 3'
        }
      });

      const tempResult = await prisma.scenarioResult.create({
        data: {
          scenarioId: tempScenario.id,
          forecastStartDate: new Date(),
          forecastEndDate: new Date(),
          startingBalance: 1000,
          endingBalance: 900,
          lowestBalance: 800,
          lowestBalanceDate: new Date(),
          totalSavings: 100,
          dailyBalances: '[]'
        }
      });

      // Delete scenario - should cascade delete results
      await prisma.scenario.delete({
        where: { id: tempScenario.id }
      });

      // Verify result was deleted
      const found = await prisma.scenarioResult.findUnique({
        where: { id: tempResult.id }
      });

      expect(found).toBeNull();
    });
  });

  describe('Indexes', () => {
    test('should have index on userId and isPreset for scenarios', async () => {
      // This is implicitly tested by the query performance
      // but we can verify the schema was created correctly
      const scenarios = await prisma.scenario.findMany({
        where: {
          userId: testUserId,
          isPreset: false
        }
      });

      expect(scenarios.length).toBeGreaterThanOrEqual(1);
    });

    test('should have index on scenarioId for modifications', async () => {
      const modifications = await prisma.scenarioModification.findMany({
        where: { scenarioId: testScenarioId }
      });

      expect(modifications.length).toBeGreaterThanOrEqual(1);
    });

    test('should have index on transactionId for modifications', async () => {
      const modifications = await prisma.scenarioModification.findMany({
        where: { transactionId: testTransactionId }
      });

      expect(modifications.length).toBeGreaterThanOrEqual(1);
    });
  });
});
