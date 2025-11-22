const fs = require('fs');
const path = require('path');
const { migrateCashFlowData } = require('../../server/utils/migrate-cash-flow-data');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const transactions = [];
  return {
    PrismaClient: jest.fn(() => ({
      transaction: {
        create: jest.fn((data) => {
          transactions.push(data.data);
          return Promise.resolve(data.data);
        }),
        findMany: jest.fn(() => Promise.resolve(transactions))
      },
      $disconnect: jest.fn(() => Promise.resolve())
    }))
  };
});

describe('Feature 2.2: Data Migration Script', () => {
  const testDataPath = path.join(__dirname, '../fixtures/test-cash-flow-data.md');

  beforeAll(() => {
    // Create test fixture
    const testData = `# Cash Flow Transaction Data

## INFLOWS (Biweekly - every 14 days from anchor)

- Acrisure: $4,487 | Anchor: 2025-08-08
- WakeMed: $1,000 | Anchor: 2025-08-07

## INFLOWS - Monthly

- Day 15: 103 Grandmont Rent $1,530.00

## OUTFLOWS - Monthly

- Day 1: Vitruvian Membership $39; Apple Card $30.00
- Day 5: LoanCare Mortgage $3,566.24

## OUTFLOWS - Weekday Recurring

- NFCU Volvo Loan: $33 every weekday

## OUTFLOWS - Friday Recurring

- Savings: $200
- Tithe: $100

## OUTFLOWS - Biweekly

- MMI: $852 | Anchor: 2025-08-08
- Groceries: $500 | Anchor: 2025-11-28
`;

    fs.mkdirSync(path.dirname(testDataPath), { recursive: true });
    fs.writeFileSync(testDataPath, testData);
  });

  afterAll(() => {
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
    }
  });

  test('should parse biweekly inflows correctly', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 1);

    const biweeklyInflows = transactions.filter(t =>
      t.type === 'INFLOW' && t.frequency === 'BIWEEKLY'
    );

    expect(biweeklyInflows.length).toBe(2);
    expect(biweeklyInflows[0].name).toBe('Acrisure');
    expect(biweeklyInflows[0].amount).toBe(4487);
    expect(biweeklyInflows[0].anchorDate).toEqual(new Date('2025-08-08'));
  });

  test('should parse monthly inflows correctly', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 1);

    const monthlyInflows = transactions.filter(t =>
      t.type === 'INFLOW' && t.frequency === 'MONTHLY'
    );

    expect(monthlyInflows.length).toBe(1);
    expect(monthlyInflows[0].name).toBe('103 Grandmont Rent');
    expect(monthlyInflows[0].amount).toBe(1530);
    expect(monthlyInflows[0].dayOfMonth).toBe(15);
  });

  test('should parse monthly outflows correctly', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 1);

    const monthlyOutflows = transactions.filter(t =>
      t.type === 'OUTFLOW' && t.frequency === 'MONTHLY'
    );

    expect(monthlyOutflows.length).toBeGreaterThanOrEqual(3);

    const vitruvian = monthlyOutflows.find(t => t.name === 'Vitruvian Membership');
    expect(vitruvian).toBeDefined();
    expect(vitruvian.amount).toBe(39);
    expect(vitruvian.dayOfMonth).toBe(1);
  });

  test('should parse weekday recurring outflows', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 1);

    const weekdayOutflows = transactions.filter(t => t.frequency === 'WEEKDAY');

    expect(weekdayOutflows.length).toBe(1);
    expect(weekdayOutflows[0].name).toBe('NFCU Volvo Loan');
    expect(weekdayOutflows[0].amount).toBe(33);
  });

  test('should parse Friday recurring outflows', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 1);

    const fridayOutflows = transactions.filter(t => t.frequency === 'FRIDAY');

    expect(fridayOutflows.length).toBe(2);
    expect(fridayOutflows.map(t => t.name)).toContain('Savings');
    expect(fridayOutflows.map(t => t.name)).toContain('Tithe');
  });

  test('should parse biweekly outflows correctly', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 1);

    const biweeklyOutflows = transactions.filter(t =>
      t.type === 'OUTFLOW' && t.frequency === 'BIWEEKLY'
    );

    expect(biweeklyOutflows.length).toBe(2);

    const mmi = biweeklyOutflows.find(t => t.name === 'MMI');
    expect(mmi).toBeDefined();
    expect(mmi.amount).toBe(852);
  });

  test('should assign correct userId to all transactions', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 123);

    transactions.forEach(t => {
      expect(t.userId).toBe(123);
    });
  });

  test('should handle amounts with commas correctly', async () => {
    const transactions = await migrateCashFlowData(testDataPath, 1);

    const mortgage = transactions.find(t => t.name === 'LoanCare Mortgage');
    expect(mortgage).toBeDefined();
    expect(mortgage.amount).toBe(3566.24);
  });
});
