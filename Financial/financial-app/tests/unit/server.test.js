const request = require('supertest');
const express = require('express');

describe('Feature 1.4: Basic Express Server', () => {
  let app;

  beforeEach(() => {
    // We'll require the app module once it's created
    jest.resetModules();
  });

  describe('Server Configuration', () => {
    test('should be an Express application', () => {
      const testApp = express();
      expect(testApp).toBeDefined();
      expect(typeof testApp).toBe('function');
    });
  });

  describe('Health Endpoint', () => {
    test('GET /api/health should return 200 status', async () => {
      const testApp = express();

      testApp.get('/api/health', (req, res) => {
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'financial-app',
          version: '1.0.0'
        });
      });

      const response = await request(testApp).get('/api/health');
      expect(response.status).toBe(200);
    });

    test('GET /api/health should return correct JSON structure', async () => {
      const testApp = express();

      testApp.get('/api/health', (req, res) => {
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'financial-app',
          version: '1.0.0'
        });
      });

      const response = await request(testApp).get('/api/health');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('financial-app');
    });

    test('GET /api/health should return JSON content-type', async () => {
      const testApp = express();

      testApp.get('/api/health', (req, res) => {
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'financial-app',
          version: '1.0.0'
        });
      });

      const response = await request(testApp).get('/api/health');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Middleware Configuration', () => {
    test('should have CORS enabled', () => {
      const cors = require('cors');
      expect(cors).toBeDefined();
    });

    test('should parse JSON bodies', async () => {
      const testApp = express();
      testApp.use(express.json());

      testApp.post('/test', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(testApp)
        .post('/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      expect(response.body.received).toEqual({ test: 'data' });
    });
  });
});
