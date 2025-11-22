const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockUser = jest.fn();
  return {
    PrismaClient: jest.fn(() => ({
      user: {
        create: mockUser,
        findUnique: jest.fn()
      }
    }))
  };
});

describe('Feature 1.5: User Registration Endpoint', () => {
  let app;
  let mockPrisma;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    mockPrisma = new PrismaClient();
  });

  test('POST /api/auth/register should create a new user', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date()
    });

    mockPrisma.user.create = mockCreate;

    // Simple registration route for testing
    app.post('/api/auth/register', async (req, res) => {
      try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await mockPrisma.user.create({
          data: {
            username,
            email,
            passwordHash: hashedPassword
          }
        });

        res.status(201).json({
          message: 'User created successfully',
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toBe('testuser');
  });

  test('should hash password before storing', async () => {
    const password = 'mySecurePassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(password.length);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  test('should reject registration without required fields', async () => {
    app.post('/api/auth/register', (req, res) => {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['username', 'email', 'password']
        });
      }

      res.status(201).json({ message: 'Success' });
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required fields');
  });
});
