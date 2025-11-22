/**
 * E2E tests for Strategy Analysis API
 * Tests debt payoff strategy calculation and recommendation
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../server/index');

const prisma = new PrismaClient();

describe('Strategy Analysis API - E2E Tests', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        // Clean up
        await prisma.user.deleteMany({ where: { email: 'strategytest@test.com' } });

        // Create test user
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'strategytest',
                email: 'strategytest@test.com',
                password: 'SecurePass123!'
            });

        userId = registerResponse.body.user.id;

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'strategytest@test.com',
                password: 'SecurePass123!'
            });

        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await prisma.debtPayment.deleteMany({ where: { strategy: { userId } } });
        await prisma.debtStrategy.deleteMany({ where: { userId } });
        await prisma.debt.deleteMany({ where: { userId } });
        await prisma.user.deleteMany({ where: { email: 'strategytest@test.com' } });
        await prisma.$disconnect();
    });

    afterEach(async () => {
        await prisma.debtPayment.deleteMany({ where: { strategy: { userId } } });
        await prisma.debtStrategy.deleteMany({ where: { userId } });
        await prisma.debt.deleteMany({ where: { userId } });
    });

    describe('POST /api/strategy/analyze', () => {
        test('should analyze strategies with multiple debts', async () => {
            // Create test debts
            await prisma.debt.createMany({
                data: [
                    {
                        userId,
                        name: 'High APR Card',
                        creditor: 'Chase',
                        balance: 5000,
                        apr: 24.0,
                        minimumPayment: 150,
                        isActive: true
                    },
                    {
                        userId,
                        name: 'Low Balance Card',
                        creditor: 'Discover',
                        balance: 1000,
                        apr: 18.0,
                        minimumPayment: 30,
                        isActive: true
                    },
                    {
                        userId,
                        name: 'Auto Loan',
                        creditor: 'Honda Finance',
                        balance: 10000,
                        apr: 5.5,
                        minimumPayment: 300,
                        isActive: true
                    }
                ]
            });

            const response = await request(app)
                .post('/api/strategy/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    extraMonthlyPayment: 500,
                    consolidationAPR: 12.0,
                    motivationStyle: 'optimization'
                });

            expect(response.status).toBe(200);
            expect(response.body.strategyId).toBeDefined();
            expect(response.body.recommendation).toBeDefined();
            expect(['avalanche', 'snowball', 'consolidation']).toContain(response.body.recommendation);
            expect(response.body.reasoning).toBeDefined();

            // Verify comparison data
            expect(response.body.comparison.avalanche).toBeDefined();
            expect(response.body.comparison.snowball).toBeDefined();
            expect(response.body.comparison.consolidation).toBeDefined();

            // Verify totals
            expect(response.body.comparison.avalanche.totalDebt).toBe(16000);
            expect(response.body.comparison.snowball.totalDebt).toBe(16000);
            expect(response.body.comparison.consolidation.totalDebt).toBe(16000);

            // Avalanche should have lowest or equal interest
            expect(response.body.comparison.avalanche.totalInterestPaid)
                .toBeLessThanOrEqual(response.body.comparison.snowball.totalInterestPaid + 1);
        });

        test('should recommend avalanche for optimization motivation', async () => {
            await prisma.debt.createMany({
                data: [
                    {
                        userId,
                        name: 'High APR',
                        creditor: 'Citi',
                        balance: 5000,
                        apr: 22.0,
                        minimumPayment: 150,
                        isActive: true
                    },
                    {
                        userId,
                        name: 'Low APR',
                        creditor: 'Bank',
                        balance: 5000,
                        apr: 12.0,
                        minimumPayment: 150,
                        isActive: true
                    }
                ]
            });

            const response = await request(app)
                .post('/api/strategy/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    extraMonthlyPayment: 200,
                    motivationStyle: 'optimization'
                });

            expect(response.status).toBe(200);
            expect(response.body.recommendation).toBe('avalanche');
        });

        test('should recommend snowball for quick_wins motivation', async () => {
            await prisma.debt.createMany({
                data: [
                    {
                        userId,
                        name: 'Small Balance',
                        creditor: 'Store Card',
                        balance: 500,
                        apr: 15.0,
                        minimumPayment: 25,
                        isActive: true
                    },
                    {
                        userId,
                        name: 'Large Balance',
                        creditor: 'Major Bank',
                        balance: 10000,
                        apr: 20.0,
                        minimumPayment: 200,
                        isActive: true
                    }
                ]
            });

            const response = await request(app)
                .post('/api/strategy/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    extraMonthlyPayment: 300,
                    motivationStyle: 'quick_wins'
                });

            expect(response.status).toBe(200);
            expect(response.body.recommendation).toBe('snowball');
        });

        test('should save strategy and payment schedule to database', async () => {
            await prisma.debt.create({
                data: {
                    userId,
                    name: 'Test Card',
                    creditor: 'Test Bank',
                    balance: 3000,
                    apr: 18.0,
                    minimumPayment: 90,
                    isActive: true
                }
            });

            const response = await request(app)
                .post('/api/strategy/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    extraMonthlyPayment: 200
                });

            expect(response.status).toBe(200);

            const strategyId = response.body.strategyId;

            // Verify strategy was saved
            const savedStrategy = await prisma.debtStrategy.findUnique({
                where: { id: strategyId },
                include: { payments: true }
            });

            expect(savedStrategy).toBeDefined();
            expect(savedStrategy.userId).toBe(userId);
            expect(savedStrategy.extraMonthlyPayment).toBe(200);
            expect(savedStrategy.payments.length).toBeGreaterThan(0);
        });

        test('should return 400 when no active debts exist', async () => {
            const response = await request(app)
                .post('/api/strategy/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    extraMonthlyPayment: 100
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('No active debts found');
        });

        test('should include schedule preview', async () => {
            await prisma.debt.create({
                data: {
                    userId,
                    name: 'Test Debt',
                    creditor: 'Test',
                    balance: 5000,
                    apr: 15.0,
                    minimumPayment: 100,
                    isActive: true
                }
            });

            const response = await request(app)
                .post('/api/strategy/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    extraMonthlyPayment: 200
                });

            expect(response.status).toBe(200);
            expect(response.body.schedulePreview).toBeDefined();
            expect(response.body.schedulePreview.length).toBeGreaterThan(0);
            expect(response.body.schedulePreview.length).toBeLessThanOrEqual(12);

            // Verify schedule structure
            const firstMonth = response.body.schedulePreview[0];
            expect(firstMonth.monthNumber).toBe(1);
            expect(firstMonth.paymentAmount).toBeDefined();
            expect(firstMonth.principal).toBeDefined();
            expect(firstMonth.interest).toBeDefined();
            expect(firstMonth.remainingBalance).toBeDefined();
        });
    });

    describe('GET /api/strategy/:id', () => {
        test('should retrieve saved strategy with payment schedule', async () => {
            // Create debt and strategy
            const debt = await prisma.debt.create({
                data: {
                    userId,
                    name: 'Test',
                    creditor: 'Test',
                    balance: 2000,
                    apr: 15.0,
                    minimumPayment: 60,
                    isActive: true
                }
            });

            const analyzeResponse = await request(app)
                .post('/api/strategy/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    extraMonthlyPayment: 100
                });

            const strategyId = analyzeResponse.body.strategyId;

            // Retrieve strategy
            const response = await request(app)
                .get(`/api/strategy/${strategyId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.strategy).toBeDefined();
            expect(response.body.strategy.id).toBe(strategyId);
            expect(response.body.strategy.payments).toBeDefined();
            expect(response.body.strategy.payments.length).toBeGreaterThan(0);
        });

        test('should return 404 for non-existent strategy', async () => {
            const response = await request(app)
                .get('/api/strategy/99999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });
});
