/**
 * E2E tests for Debt CRUD API Endpoints
 * Tests the complete HTTP request/response cycle for debt management
 * Following TDD: Write E2E tests first, then implement endpoints
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../server/index');

const prisma = new PrismaClient();

describe('Debt CRUD API - E2E Tests', () => {
    let authToken;
    let userId;
    let testDebt1, testDebt2, testDebt3;

    beforeAll(async () => {
        // Clean up any existing test user
        await prisma.user.deleteMany({ where: { email: 'debtapi@test.com' } });

        // Create test user and get auth token
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'debtapiuser',
                email: 'debtapi@test.com',
                password: 'SecurePass123!'
            });

        userId = registerResponse.body.user.id;

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'debtapi@test.com',
                password: 'SecurePass123!'
            });

        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        // Cleanup
        await prisma.debt.deleteMany({ where: { userId } });
        await prisma.user.deleteMany({ where: { email: 'debtapi@test.com' } });
        await prisma.$disconnect();
    });

    afterEach(async () => {
        // Clean up debts after each test
        await prisma.debt.deleteMany({ where: { userId } });
    });

    describe('POST /api/debts - Create Debt', () => {
        test('should create a new debt', async () => {
            const newDebt = {
                name: 'Credit Card',
                creditor: 'Chase',
                balance: 5000.00,
                apr: 18.99,
                minimumPayment: 150.00
            };

            const response = await request(app)
                .post('/api/debts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newDebt);

            expect(response.status).toBe(201);
            expect(response.body.debt).toBeDefined();
            expect(response.body.debt.name).toBe('Credit Card');
            expect(response.body.debt.creditor).toBe('Chase');
            expect(response.body.debt.balance).toBe(5000.00);
            expect(response.body.debt.apr).toBe(18.99);
            expect(response.body.debt.minimumPayment).toBe(150.00);
            expect(response.body.debt.isActive).toBe(true);
            expect(response.body.debt.userId).toBe(userId);
        });

        test('should reject debt creation without auth token', async () => {
            const newDebt = {
                name: 'Credit Card',
                creditor: 'Chase',
                balance: 5000.00,
                apr: 18.99,
                minimumPayment: 150.00
            };

            const response = await request(app)
                .post('/api/debts')
                .send(newDebt);

            expect(response.status).toBe(401);
        });

        test('should validate required fields', async () => {
            const invalidDebt = {
                name: 'Credit Card'
                // Missing required fields
            };

            const response = await request(app)
                .post('/api/debts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidDebt);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('GET /api/debts - List All Debts', () => {
        beforeEach(async () => {
            // Create test debts
            testDebt1 = await prisma.debt.create({
                data: {
                    userId,
                    name: 'Credit Card 1',
                    creditor: 'Chase',
                    balance: 5000,
                    apr: 18.99,
                    minimumPayment: 150,
                    isActive: true
                }
            });

            testDebt2 = await prisma.debt.create({
                data: {
                    userId,
                    name: 'Auto Loan',
                    creditor: 'Honda Finance',
                    balance: 12000,
                    apr: 5.5,
                    minimumPayment: 350,
                    isActive: true
                }
            });

            testDebt3 = await prisma.debt.create({
                data: {
                    userId,
                    name: 'Paid Off Card',
                    creditor: 'Discover',
                    balance: 0,
                    apr: 15.0,
                    minimumPayment: 0,
                    isActive: false
                }
            });
        });

        test('should list all active debts for user', async () => {
            const response = await request(app)
                .get('/api/debts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.debts).toBeDefined();
            expect(response.body.debts.length).toBe(2); // Only active debts
            expect(response.body.debts.every(d => d.isActive)).toBe(true);
        });

        test('should include inactive debts when requested', async () => {
            const response = await request(app)
                .get('/api/debts?includeInactive=true')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.debts.length).toBe(3); // All debts
        });

        test('should calculate summary metrics', async () => {
            const response = await request(app)
                .get('/api/debts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.summary).toBeDefined();
            expect(response.body.summary.totalDebt).toBe(17000); // 5000 + 12000
            expect(response.body.summary.totalMinimumPayments).toBe(500); // 150 + 350
            expect(response.body.summary.totalMonthlyInterest).toBeGreaterThan(0);
            expect(response.body.summary.averageAPR).toBeGreaterThan(0);
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .get('/api/debts');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/debts/:id - Get Single Debt', () => {
        beforeEach(async () => {
            testDebt1 = await prisma.debt.create({
                data: {
                    userId,
                    name: 'Test Card',
                    creditor: 'Test Bank',
                    balance: 3000,
                    apr: 16.5,
                    minimumPayment: 90
                }
            });
        });

        test('should get debt by ID', async () => {
            const response = await request(app)
                .get(`/api/debts/${testDebt1.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.debt).toBeDefined();
            expect(response.body.debt.id).toBe(testDebt1.id);
            expect(response.body.debt.name).toBe('Test Card');
        });

        test('should return 404 for non-existent debt', async () => {
            const response = await request(app)
                .get('/api/debts/99999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        test('should not allow access to other users debts', async () => {
            // Create another user
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'otheruser',
                    email: 'other@test.com',
                    password: 'Pass123!'
                });

            const otherLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'other@test.com',
                    password: 'Pass123!'
                });

            const otherToken = otherLogin.body.token;

            // Try to access first user's debt
            const response = await request(app)
                .get(`/api/debts/${testDebt1.id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(response.status).toBe(404); // Not found (security by obscurity)

            // Cleanup
            await prisma.user.deleteMany({ where: { email: 'other@test.com' } });
        });
    });

    describe('PUT /api/debts/:id - Update Debt', () => {
        beforeEach(async () => {
            testDebt1 = await prisma.debt.create({
                data: {
                    userId,
                    name: 'Test Card',
                    creditor: 'Test Bank',
                    balance: 3000,
                    apr: 16.5,
                    minimumPayment: 90
                }
            });
        });

        test('should update debt balance', async () => {
            const response = await request(app)
                .put(`/api/debts/${testDebt1.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    balance: 2500.00
                });

            expect(response.status).toBe(200);
            expect(response.body.debt.balance).toBe(2500.00);
            expect(response.body.debt.name).toBe('Test Card'); // Other fields unchanged
        });

        test('should update multiple fields', async () => {
            const response = await request(app)
                .put(`/api/debts/${testDebt1.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Card Name',
                    balance: 2800.00,
                    apr: 15.99,
                    minimumPayment: 85.00
                });

            expect(response.status).toBe(200);
            expect(response.body.debt.name).toBe('Updated Card Name');
            expect(response.body.debt.balance).toBe(2800.00);
            expect(response.body.debt.apr).toBe(15.99);
            expect(response.body.debt.minimumPayment).toBe(85.00);
        });

        test('should return 404 for non-existent debt', async () => {
            const response = await request(app)
                .put('/api/debts/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ balance: 1000 });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/debts/:id - Delete Debt (Soft Delete)', () => {
        beforeEach(async () => {
            testDebt1 = await prisma.debt.create({
                data: {
                    userId,
                    name: 'Test Card',
                    creditor: 'Test Bank',
                    balance: 3000,
                    apr: 16.5,
                    minimumPayment: 90,
                    isActive: true
                }
            });
        });

        test('should soft delete debt', async () => {
            const response = await request(app)
                .delete(`/api/debts/${testDebt1.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBeDefined();

            // Verify debt is marked inactive
            const debt = await prisma.debt.findUnique({
                where: { id: testDebt1.id }
            });
            expect(debt.isActive).toBe(false);
        });

        test('should return 404 for non-existent debt', async () => {
            const response = await request(app)
                .delete('/api/debts/99999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });
});
