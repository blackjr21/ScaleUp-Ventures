/**
 * Unit tests for Debt-related database schema
 * Tests the Debt, DebtStrategy, and DebtPayment models
 * Following TDD: Write tests first, then implement schema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Debt Schema - TDD Tests', () => {
    let testUser;

    beforeAll(async () => {
        // Create test user
        testUser = await prisma.user.create({
            data: {
                username: 'debtuser',
                email: 'debt@test.com',
                passwordHash: 'hashedpassword123'
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.debtPayment.deleteMany({});
        await prisma.debtStrategy.deleteMany({});
        await prisma.debt.deleteMany({});
        await prisma.user.deleteMany({ where: { email: 'debt@test.com' } });
        await prisma.$disconnect();
    });

    afterEach(async () => {
        // Clean up debts after each test
        await prisma.debtPayment.deleteMany({});
        await prisma.debtStrategy.deleteMany({});
        await prisma.debt.deleteMany({});
    });

    describe('Debt Model', () => {
        test('should create a debt with all required fields', async () => {
            const debt = await prisma.debt.create({
                data: {
                    userId: testUser.id,
                    name: 'Credit Card',
                    creditor: 'Chase',
                    balance: 5000.00,
                    apr: 18.99,
                    minimumPayment: 150.00,
                    isActive: true
                }
            });

            expect(debt.id).toBeDefined();
            expect(debt.userId).toBe(testUser.id);
            expect(debt.name).toBe('Credit Card');
            expect(debt.creditor).toBe('Chase');
            expect(debt.balance).toBe(5000.00);
            expect(debt.apr).toBe(18.99);
            expect(debt.minimumPayment).toBe(150.00);
            expect(debt.isActive).toBe(true);
            expect(debt.createdAt).toBeInstanceOf(Date);
            expect(debt.updatedAt).toBeInstanceOf(Date);
        });

        test('should create debt with optional fields omitted', async () => {
            const debt = await prisma.debt.create({
                data: {
                    userId: testUser.id,
                    name: 'Personal Loan',
                    creditor: 'Bank of America',
                    balance: 3000.00,
                    apr: 12.5,
                    minimumPayment: 100.00
                    // isActive defaults to true
                }
            });

            expect(debt.isActive).toBe(true);
        });

        test('should support soft delete via isActive flag', async () => {
            const debt = await prisma.debt.create({
                data: {
                    userId: testUser.id,
                    name: 'Auto Loan',
                    creditor: 'Honda Finance',
                    balance: 12000.00,
                    apr: 5.5,
                    minimumPayment: 350.00,
                    isActive: true
                }
            });

            // Soft delete
            const updated = await prisma.debt.update({
                where: { id: debt.id },
                data: { isActive: false }
            });

            expect(updated.isActive).toBe(false);

            // Verify it's still in database but marked inactive
            const found = await prisma.debt.findUnique({
                where: { id: debt.id }
            });
            expect(found).toBeDefined();
            expect(found.isActive).toBe(false);
        });

        test('should cascade delete when user is deleted', async () => {
            // Create temporary user
            const tempUser = await prisma.user.create({
                data: {
                    username: 'tempdebt',
                    email: 'tempdebt@test.com',
                    passwordHash: 'hash123'
                }
            });

            const debt = await prisma.debt.create({
                data: {
                    userId: tempUser.id,
                    name: 'Credit Card',
                    creditor: 'Citi',
                    balance: 2000.00,
                    apr: 20.0,
                    minimumPayment: 60.00
                }
            });

            // Delete user
            await prisma.user.delete({ where: { id: tempUser.id } });

            // Debt should be deleted via cascade
            const found = await prisma.debt.findUnique({
                where: { id: debt.id }
            });
            expect(found).toBeNull();
        });

        test('should query active debts only', async () => {
            await prisma.debt.createMany({
                data: [
                    {
                        userId: testUser.id,
                        name: 'Active Debt 1',
                        creditor: 'Creditor A',
                        balance: 1000,
                        apr: 15,
                        minimumPayment: 50,
                        isActive: true
                    },
                    {
                        userId: testUser.id,
                        name: 'Inactive Debt',
                        creditor: 'Creditor B',
                        balance: 2000,
                        apr: 18,
                        minimumPayment: 60,
                        isActive: false
                    },
                    {
                        userId: testUser.id,
                        name: 'Active Debt 2',
                        creditor: 'Creditor C',
                        balance: 3000,
                        apr: 12,
                        minimumPayment: 100,
                        isActive: true
                    }
                ]
            });

            const activeDebts = await prisma.debt.findMany({
                where: {
                    userId: testUser.id,
                    isActive: true
                }
            });

            expect(activeDebts.length).toBe(2);
            expect(activeDebts.every(d => d.isActive)).toBe(true);
        });
    });

    describe('DebtStrategy Model', () => {
        test('should create avalanche strategy with all fields', async () => {
            const strategy = await prisma.debtStrategy.create({
                data: {
                    userId: testUser.id,
                    strategyType: 'avalanche',
                    extraMonthlyPayment: 500.00,
                    totalDebt: 15000.00,
                    totalInterestPaid: 3245.67,
                    payoffMonths: 36,
                    payoffDate: new Date('2028-11-22')
                }
            });

            expect(strategy.id).toBeDefined();
            expect(strategy.strategyType).toBe('avalanche');
            expect(strategy.extraMonthlyPayment).toBe(500.00);
            expect(strategy.totalDebt).toBe(15000.00);
            expect(strategy.totalInterestPaid).toBe(3245.67);
            expect(strategy.payoffMonths).toBe(36);
            expect(strategy.payoffDate).toBeInstanceOf(Date);
            expect(strategy.createdAt).toBeInstanceOf(Date);
        });

        test('should create snowball strategy', async () => {
            const strategy = await prisma.debtStrategy.create({
                data: {
                    userId: testUser.id,
                    strategyType: 'snowball',
                    extraMonthlyPayment: 300.00,
                    totalDebt: 10000.00,
                    totalInterestPaid: 2100.50,
                    payoffMonths: 40,
                    payoffDate: new Date('2029-03-22')
                }
            });

            expect(strategy.strategyType).toBe('snowball');
        });

        test('should create consolidation strategy', async () => {
            const strategy = await prisma.debtStrategy.create({
                data: {
                    userId: testUser.id,
                    strategyType: 'consolidation',
                    extraMonthlyPayment: 0.00,
                    totalDebt: 20000.00,
                    totalInterestPaid: 4500.00,
                    payoffMonths: 60,
                    payoffDate: new Date('2030-11-22')
                }
            });

            expect(strategy.strategyType).toBe('consolidation');
        });

        test('should link strategy to user', async () => {
            const strategy = await prisma.debtStrategy.create({
                data: {
                    userId: testUser.id,
                    strategyType: 'avalanche',
                    extraMonthlyPayment: 400.00,
                    totalDebt: 8000.00,
                    totalInterestPaid: 1500.00,
                    payoffMonths: 24,
                    payoffDate: new Date('2027-11-22')
                },
                include: {
                    user: true
                }
            });

            expect(strategy.user.id).toBe(testUser.id);
            expect(strategy.user.email).toBe('debt@test.com');
        });
    });

    describe('DebtPayment Model (Monthly Payment Schedule)', () => {
        let testDebt;
        let testStrategy;

        beforeEach(async () => {
            // Create debt and strategy for payment tests
            testDebt = await prisma.debt.create({
                data: {
                    userId: testUser.id,
                    name: 'Test Credit Card',
                    creditor: 'Test Bank',
                    balance: 5000.00,
                    apr: 18.0,
                    minimumPayment: 150.00
                }
            });

            testStrategy = await prisma.debtStrategy.create({
                data: {
                    userId: testUser.id,
                    strategyType: 'avalanche',
                    extraMonthlyPayment: 500.00,
                    totalDebt: 5000.00,
                    totalInterestPaid: 800.00,
                    payoffMonths: 12,
                    payoffDate: new Date('2026-11-22')
                }
            });
        });

        test('should create monthly payment schedule entry', async () => {
            const payment = await prisma.debtPayment.create({
                data: {
                    strategyId: testStrategy.id,
                    debtId: testDebt.id,
                    monthNumber: 1,
                    paymentDate: new Date('2025-12-22'),
                    paymentAmount: 650.00,
                    principal: 575.00,
                    interest: 75.00,
                    remainingBalance: 4425.00
                }
            });

            expect(payment.id).toBeDefined();
            expect(payment.strategyId).toBe(testStrategy.id);
            expect(payment.debtId).toBe(testDebt.id);
            expect(payment.monthNumber).toBe(1);
            expect(payment.paymentAmount).toBe(650.00);
            expect(payment.principal).toBe(575.00);
            expect(payment.interest).toBe(75.00);
            expect(payment.remainingBalance).toBe(4425.00);
        });

        test('should create multiple months of payment schedule', async () => {
            const payments = await prisma.debtPayment.createMany({
                data: [
                    {
                        strategyId: testStrategy.id,
                        debtId: testDebt.id,
                        monthNumber: 1,
                        paymentDate: new Date('2025-12-22'),
                        paymentAmount: 650.00,
                        principal: 575.00,
                        interest: 75.00,
                        remainingBalance: 4425.00
                    },
                    {
                        strategyId: testStrategy.id,
                        debtId: testDebt.id,
                        monthNumber: 2,
                        paymentDate: new Date('2026-01-22'),
                        paymentAmount: 650.00,
                        principal: 583.38,
                        interest: 66.62,
                        remainingBalance: 3841.62
                    },
                    {
                        strategyId: testStrategy.id,
                        debtId: testDebt.id,
                        monthNumber: 3,
                        paymentDate: new Date('2026-02-22'),
                        paymentAmount: 650.00,
                        principal: 592.13,
                        interest: 57.87,
                        remainingBalance: 3249.49
                    }
                ]
            });

            expect(payments.count).toBe(3);

            // Query payment schedule
            const schedule = await prisma.debtPayment.findMany({
                where: { strategyId: testStrategy.id },
                orderBy: { monthNumber: 'asc' }
            });

            expect(schedule.length).toBe(3);
            expect(schedule[0].monthNumber).toBe(1);
            expect(schedule[2].monthNumber).toBe(3);
        });

        test('should link payment to strategy and debt', async () => {
            const payment = await prisma.debtPayment.create({
                data: {
                    strategyId: testStrategy.id,
                    debtId: testDebt.id,
                    monthNumber: 1,
                    paymentDate: new Date('2025-12-22'),
                    paymentAmount: 650.00,
                    principal: 575.00,
                    interest: 75.00,
                    remainingBalance: 4425.00
                },
                include: {
                    strategy: true,
                    debt: true
                }
            });

            expect(payment.strategy.strategyType).toBe('avalanche');
            expect(payment.debt.name).toBe('Test Credit Card');
        });

        test('should cascade delete payments when strategy is deleted', async () => {
            const payment = await prisma.debtPayment.create({
                data: {
                    strategyId: testStrategy.id,
                    debtId: testDebt.id,
                    monthNumber: 1,
                    paymentDate: new Date('2025-12-22'),
                    paymentAmount: 650.00,
                    principal: 575.00,
                    interest: 75.00,
                    remainingBalance: 4425.00
                }
            });

            // Delete strategy
            await prisma.debtStrategy.delete({ where: { id: testStrategy.id } });

            // Payment should be cascade deleted
            const found = await prisma.debtPayment.findUnique({
                where: { id: payment.id }
            });
            expect(found).toBeNull();
        });

        test('should cascade delete payments when debt is deleted', async () => {
            const payment = await prisma.debtPayment.create({
                data: {
                    strategyId: testStrategy.id,
                    debtId: testDebt.id,
                    monthNumber: 1,
                    paymentDate: new Date('2025-12-22'),
                    paymentAmount: 650.00,
                    principal: 575.00,
                    interest: 75.00,
                    remainingBalance: 4425.00
                }
            });

            // Delete debt
            await prisma.debt.delete({ where: { id: testDebt.id } });

            // Payment should be cascade deleted
            const found = await prisma.debtPayment.findUnique({
                where: { id: payment.id }
            });
            expect(found).toBeNull();
        });
    });

    describe('Debt Relationships', () => {
        test('should query user with all debts', async () => {
            await prisma.debt.createMany({
                data: [
                    {
                        userId: testUser.id,
                        name: 'Card 1',
                        creditor: 'Bank A',
                        balance: 1000,
                        apr: 15,
                        minimumPayment: 50
                    },
                    {
                        userId: testUser.id,
                        name: 'Card 2',
                        creditor: 'Bank B',
                        balance: 2000,
                        apr: 18,
                        minimumPayment: 60
                    }
                ]
            });

            const userWithDebts = await prisma.user.findUnique({
                where: { id: testUser.id },
                include: {
                    debts: true
                }
            });

            expect(userWithDebts.debts.length).toBe(2);
        });

        test('should query strategy with all payment schedules', async () => {
            const debt = await prisma.debt.create({
                data: {
                    userId: testUser.id,
                    name: 'Test Card',
                    creditor: 'Test Bank',
                    balance: 3000,
                    apr: 16,
                    minimumPayment: 90
                }
            });

            const strategy = await prisma.debtStrategy.create({
                data: {
                    userId: testUser.id,
                    strategyType: 'snowball',
                    extraMonthlyPayment: 200,
                    totalDebt: 3000,
                    totalInterestPaid: 400,
                    payoffMonths: 15,
                    payoffDate: new Date('2027-02-22')
                }
            });

            await prisma.debtPayment.createMany({
                data: [
                    {
                        strategyId: strategy.id,
                        debtId: debt.id,
                        monthNumber: 1,
                        paymentDate: new Date('2025-12-22'),
                        paymentAmount: 290,
                        principal: 250,
                        interest: 40,
                        remainingBalance: 2750
                    },
                    {
                        strategyId: strategy.id,
                        debtId: debt.id,
                        monthNumber: 2,
                        paymentDate: new Date('2026-01-22'),
                        paymentAmount: 290,
                        principal: 253.33,
                        interest: 36.67,
                        remainingBalance: 2496.67
                    }
                ]
            });

            const strategyWithPayments = await prisma.debtStrategy.findUnique({
                where: { id: strategy.id },
                include: {
                    payments: {
                        orderBy: { monthNumber: 'asc' }
                    }
                }
            });

            expect(strategyWithPayments.payments.length).toBe(2);
            expect(strategyWithPayments.payments[0].monthNumber).toBe(1);
        });
    });
});
