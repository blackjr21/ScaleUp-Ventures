const fs = require('fs');
const path = require('path');

describe('Feature 1.3: Prisma Database Setup', () => {
  const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');

  test('schema.prisma file should exist', () => {
    expect(fs.existsSync(schemaPath)).toBe(true);
  });

  describe('Prisma Schema Content', () => {
    let schemaContent;

    beforeAll(() => {
      if (fs.existsSync(schemaPath)) {
        schemaContent = fs.readFileSync(schemaPath, 'utf8');
      }
    });

    test('should have datasource db configured', () => {
      expect(schemaContent).toContain('datasource db');
      expect(schemaContent).toContain('provider');
      expect(schemaContent).toContain('url');
    });

    test('should have Prisma client generator', () => {
      expect(schemaContent).toContain('generator client');
      expect(schemaContent).toContain('provider = "prisma-client-js"');
    });

    test('should have User model defined', () => {
      expect(schemaContent).toContain('model User');
    });

    test('User model should have required fields', () => {
      const requiredFields = [
        'id',
        'username',
        'email',
        'passwordHash',
        'createdAt',
        'updatedAt'
      ];

      requiredFields.forEach(field => {
        expect(schemaContent).toContain(field);
      });
    });

    test('User model should have unique constraints', () => {
      expect(schemaContent).toMatch(/username.*@unique/);
      expect(schemaContent).toMatch(/email.*@unique/);
    });

    test('User model should have timestamp defaults', () => {
      expect(schemaContent).toMatch(/createdAt.*@default\(now\(\)\)/);
      expect(schemaContent).toMatch(/updatedAt.*@updatedAt/);
    });
  });

  describe('Prisma Client Generation', () => {
    test('should have @prisma/client in node_modules', () => {
      const prismaClientPath = path.join(__dirname, '../../node_modules/@prisma/client');
      expect(fs.existsSync(prismaClientPath)).toBe(true);
    });

    test('should have generated Prisma client', () => {
      const generatedClientPath = path.join(
        __dirname,
        '../../node_modules/.prisma/client'
      );
      expect(fs.existsSync(generatedClientPath)).toBe(true);
    });
  });

  describe('.env file', () => {
    test('.env file should exist', () => {
      const envPath = path.join(__dirname, '../../.env');
      expect(fs.existsSync(envPath)).toBe(true);
    });

    test('.env should have DATABASE_URL', () => {
      const envPath = path.join(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        expect(envContent).toContain('DATABASE_URL');
      }
    });
  });
});
