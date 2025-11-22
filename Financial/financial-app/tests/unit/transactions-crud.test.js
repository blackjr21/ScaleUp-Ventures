const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Transactions CRUD Operations', () => {
  let testUserId;
  let testTransactionId;

  beforeAll(async () => {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        username: 'transactiontestuser',
        email: 'transactiontest@test.com',
        passwordHash: 'hashedpassword123'
      }
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test transactions and user
    await prisma.transaction.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  describe('CREATE Transaction', () => {
    test('should create a new transaction with all required fields', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUserId,
          name: 'Test Monthly Bill',
          amount: 150.00,
          type: 'OUTFLOW',
          frequency: 'MONTHLY',
          dayOfMonth: 15,
          isActive: true
        }
      });

      expect(transaction).toHaveProperty('id');
      expect(transaction.name).toBe('Test Monthly Bill');
      expect(transaction.amount).toBe(150.00);
      expect(transaction.type).toBe('OUTFLOW');
      expect(transaction.frequency).toBe('MONTHLY');
      expect(transaction.dayOfMonth).toBe(15);
      expect(transaction.isActive).toBe(true);

      testTransactionId = transaction.id;
    });

    test('should create a biweekly transaction with anchor date', async () => {
      const anchorDate = new Date('2025-11-22');
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUserId,
          name: 'Biweekly Paycheck',
          amount: 2000.00,
          type: 'INFLOW',
          frequency: 'BIWEEKLY',
          anchorDate: anchorDate,
          isActive: true
        }
      });

      expect(transaction.frequency).toBe('BIWEEKLY');
      expect(transaction.anchorDate).toEqual(anchorDate);
      expect(transaction.type).toBe('INFLOW');
    });

    test('should create a one-time transaction', async () => {
      const oneTimeDate = new Date('2025-12-25');
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUserId,
          name: 'Holiday Bonus',
          amount: 500.00,
          type: 'INFLOW',
          frequency: 'ONE_TIME',
          anchorDate: oneTimeDate,
          isActive: true
        }
      });

      expect(transaction.frequency).toBe('ONE_TIME');
      expect(transaction.anchorDate).toEqual(oneTimeDate);
    });
  });

  describe('READ Transactions', () => {
    test('should retrieve all transactions for a user', async () => {
      const transactions = await prisma.transaction.findMany({
        where: { userId: testUserId }
      });

      expect(transactions.length).toBeGreaterThanOrEqual(3);
      expect(transactions[0]).toHaveProperty('id');
      expect(transactions[0]).toHaveProperty('name');
      expect(transactions[0]).toHaveProperty('amount');
    });

    test('should retrieve a single transaction by id', async () => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: testTransactionId }
      });

      expect(transaction).not.toBeNull();
      expect(transaction.id).toBe(testTransactionId);
      expect(transaction.name).toBe('Test Monthly Bill');
    });

    test('should filter active transactions only', async () => {
      const activeTransactions = await prisma.transaction.findMany({
        where: {
          userId: testUserId,
          isActive: true
        }
      });

      expect(activeTransactions.length).toBeGreaterThanOrEqual(3);
      activeTransactions.forEach(t => {
        expect(t.isActive).toBe(true);
      });
    });

    test('should filter by transaction type', async () => {
      const outflows = await prisma.transaction.findMany({
        where: {
          userId: testUserId,
          type: 'OUTFLOW'
        }
      });

      outflows.forEach(t => {
        expect(t.type).toBe('OUTFLOW');
      });
    });
  });

  describe('UPDATE Transaction', () => {
    test('should update transaction amount', async () => {
      const updated = await prisma.transaction.update({
        where: { id: testTransactionId },
        data: { amount: 175.00 }
      });

      expect(updated.amount).toBe(175.00);
      expect(updated.id).toBe(testTransactionId);
    });

    test('should update transaction name', async () => {
      const updated = await prisma.transaction.update({
        where: { id: testTransactionId },
        data: { name: 'Updated Monthly Bill' }
      });

      expect(updated.name).toBe('Updated Monthly Bill');
    });

    test('should deactivate a transaction', async () => {
      const updated = await prisma.transaction.update({
        where: { id: testTransactionId },
        data: { isActive: false }
      });

      expect(updated.isActive).toBe(false);
    });

    test('should update frequency and related fields', async () => {
      const updated = await prisma.transaction.update({
        where: { id: testTransactionId },
        data: {
          frequency: 'BIWEEKLY',
          anchorDate: new Date('2025-12-01'),
          dayOfMonth: null
        }
      });

      expect(updated.frequency).toBe('BIWEEKLY');
      expect(updated.anchorDate).not.toBeNull();
      expect(updated.dayOfMonth).toBeNull();
    });
  });

  describe('DELETE Transaction', () => {
    test('should delete a transaction', async () => {
      const deleted = await prisma.transaction.delete({
        where: { id: testTransactionId }
      });

      expect(deleted.id).toBe(testTransactionId);

      // Verify it's deleted
      const found = await prisma.transaction.findUnique({
        where: { id: testTransactionId }
      });

      expect(found).toBeNull();
    });

    test('should return null when deleting non-existent transaction', async () => {
      await expect(
        prisma.transaction.delete({
          where: { id: 99999 }
        })
      ).rejects.toThrow();
    });
  });

  describe('Validation', () => {
    test('should not allow missing required fields', async () => {
      await expect(
        prisma.transaction.create({
          data: {
            userId: testUserId,
            name: 'Invalid Transaction'
            // Missing amount, type, frequency
          }
        })
      ).rejects.toThrow();
    });

    test('should not allow transaction without userId', async () => {
      await expect(
        prisma.transaction.create({
          data: {
            name: 'No User Transaction',
            amount: 100,
            type: 'OUTFLOW',
            frequency: 'MONTHLY'
          }
        })
      ).rejects.toThrow();
    });
  });
});
