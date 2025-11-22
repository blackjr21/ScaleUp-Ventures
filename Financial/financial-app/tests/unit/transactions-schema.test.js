const fs = require('fs');
const path = require('path');

describe('Feature 2.1: Transactions Database Schema', () => {
  const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
  let schemaContent;

  beforeAll(() => {
    schemaContent = fs.readFileSync(schemaPath, 'utf8');
  });

  describe('Transaction Model', () => {
    test('should have Transaction model defined', () => {
      expect(schemaContent).toContain('model Transaction');
    });

    test('should have all required fields', () => {
      const requiredFields = [
        'id',
        'userId',
        'name',
        'amount',
        'type',
        'frequency',
        'dayOfMonth',
        'anchorDate',
        'isActive',
        'createdAt',
        'updatedAt'
      ];

      requiredFields.forEach(field => {
        expect(schemaContent).toContain(field);
      });
    });

    test('should have userId foreign key to User model', () => {
      expect(schemaContent).toMatch(/userId.*Int/);
      expect(schemaContent).toMatch(/user.*User.*@relation/);
    });

    test('should have type field as String', () => {
      expect(schemaContent).toMatch(/type\s+String.*INFLOW.*OUTFLOW/);
    });

    test('should have frequency field as String with all types documented', () => {
      expect(schemaContent).toMatch(/frequency\s+String/);
      expect(schemaContent).toContain('ONE_TIME');
      expect(schemaContent).toContain('MONTHLY');
      expect(schemaContent).toContain('BIWEEKLY');
      expect(schemaContent).toContain('WEEKDAY');
      expect(schemaContent).toContain('FRIDAY');
    });

    test('should have optional dayOfMonth and anchorDate fields', () => {
      expect(schemaContent).toMatch(/dayOfMonth.*Int\?/);
      expect(schemaContent).toMatch(/anchorDate.*DateTime\?/);
    });

    test('should have isActive with default true', () => {
      expect(schemaContent).toMatch(/isActive.*Boolean.*@default\(true\)/);
    });

    test('should have timestamps with proper defaults', () => {
      expect(schemaContent).toMatch(/createdAt.*DateTime.*@default\(now\(\)\)/);
      expect(schemaContent).toMatch(/updatedAt.*DateTime.*@updatedAt/);
    });

    test('should have index on userId and isActive', () => {
      expect(schemaContent).toMatch(/@@index.*userId.*isActive/);
    });
  });

  describe('User Model Update', () => {
    test('should have transactions relation in User model', () => {
      expect(schemaContent).toMatch(/transactions.*Transaction\[\]/);
    });
  });
});
