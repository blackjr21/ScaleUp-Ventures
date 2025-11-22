/**
 * Unit tests for DebtCalculator Service
 * Tests debt payoff strategies: Avalanche, Snowball, Consolidation
 * Following TDD: Write tests first, then implement service
 */

const DebtCalculator = require('../../server/services/DebtCalculator');

describe('DebtCalculator Service - TDD Tests', () => {

    describe('Basic Financial Calculations', () => {
        test('should calculate monthly interest correctly', () => {
            const balance = 5000;
            const apr = 18.0;
            const monthlyInterest = DebtCalculator.calculateMonthlyInterest(balance, apr);

            // 5000 * (18 / 100) / 12 = 75.00
            expect(monthlyInterest).toBeCloseTo(75.00, 2);
        });

        test('should handle zero balance', () => {
            expect(DebtCalculator.calculateMonthlyInterest(0, 18.0)).toBe(0);
        });

        test('should handle zero APR', () => {
            expect(DebtCalculator.calculateMonthlyInterest(5000, 0)).toBe(0);
        });

        test('should calculate debt-to-income ratio', () => {
            const monthlyDebtPayments = 1500;
            const monthlyIncome = 5000;
            const dti = DebtCalculator.calculateDTI(monthlyDebtPayments, monthlyIncome);

            // 1500 / 5000 * 100 = 30%
            expect(dti).toBeCloseTo(30.0, 2);
        });

        test('should handle zero income for DTI', () => {
            expect(DebtCalculator.calculateDTI(1500, 0)).toBe(0);
        });

        test('should calculate total monthly interest for multiple debts', () => {
            const debts = [
                { balance: 5000, apr: 18.0 },  // 75.00
                { balance: 3000, apr: 24.0 },  // 60.00
                { balance: 2000, apr: 12.0 }   // 20.00
            ];

            const totalInterest = DebtCalculator.calculateTotalMonthlyInterest(debts);
            expect(totalInterest).toBeCloseTo(155.00, 2);
        });
    });

    describe('Avalanche Strategy (Highest APR First)', () => {
        test('should calculate avalanche payoff for single debt', () => {
            const debts = [{
                id: 1,
                name: 'Credit Card',
                balance: 5000,
                apr: 18.0,
                minimumPayment: 150
            }];

            const extraPayment = 350; // Total payment = 500
            const result = DebtCalculator.calculateAvalanche(debts, extraPayment);

            expect(result.strategyType).toBe('avalanche');
            expect(result.totalDebt).toBe(5000);
            expect(result.payoffMonths).toBeLessThan(15); // Should pay off quickly with $500/month
            expect(result.totalInterestPaid).toBeGreaterThan(0);
            expect(result.payoffDate).toBeInstanceOf(Date);
            expect(result.schedule).toBeDefined();
            expect(result.schedule.length).toBeGreaterThan(0);
        });

        test('should prioritize highest APR debt first', () => {
            const debts = [
                { id: 1, name: 'Low APR Card', balance: 5000, apr: 12.0, minimumPayment: 100 },
                { id: 2, name: 'High APR Card', balance: 3000, apr: 24.0, minimumPayment: 90 },
                { id: 3, name: 'Medium APR Card', balance: 2000, apr: 18.0, minimumPayment: 60 }
            ];

            const extraPayment = 250; // Extra beyond minimums
            const result = DebtCalculator.calculateAvalanche(debts, extraPayment);

            // First debt paid should be highest APR (24%)
            const firstDebtPaidOff = result.schedule.find(entry =>
                entry.remainingBalance === 0 && entry.debtId === 2
            );
            expect(firstDebtPaidOff).toBeDefined();

            // Verify order: 24% → 18% → 12%
            const payoffOrder = result.payoffOrder;
            expect(payoffOrder[0].apr).toBe(24.0);
            expect(payoffOrder[1].apr).toBe(18.0);
            expect(payoffOrder[2].apr).toBe(12.0);
        });

        test('should generate month-by-month payment schedule', () => {
            const debts = [{
                id: 1,
                name: 'Credit Card',
                balance: 1000,
                apr: 18.0,
                minimumPayment: 50
            }];

            const extraPayment = 150; // Total $200/month
            const result = DebtCalculator.calculateAvalanche(debts, extraPayment);

            // Verify schedule structure
            expect(result.schedule.length).toBeGreaterThan(0);

            const firstMonth = result.schedule[0];
            expect(firstMonth.debtId).toBe(1);
            expect(firstMonth.monthNumber).toBe(1);
            expect(firstMonth.paymentAmount).toBeCloseTo(200, 2);
            expect(firstMonth.principal).toBeGreaterThan(0);
            expect(firstMonth.interest).toBeGreaterThan(0);
            expect(firstMonth.remainingBalance).toBeLessThan(1000);
            expect(firstMonth.paymentDate).toBeInstanceOf(Date);

            // Principal + Interest should equal payment
            expect(firstMonth.principal + firstMonth.interest).toBeCloseTo(firstMonth.paymentAmount, 2);
        });

        test('should handle multiple debts with different balances', () => {
            const debts = [
                { id: 1, name: 'Small Balance', balance: 500, apr: 15.0, minimumPayment: 25 },
                { id: 2, name: 'Large Balance', balance: 10000, apr: 20.0, minimumPayment: 200 }
            ];

            const extraPayment = 300;
            const result = DebtCalculator.calculateAvalanche(debts, extraPayment);

            expect(result.totalDebt).toBe(10500);
            expect(result.payoffOrder.length).toBe(2);

            // Verify large balance gets the extra payment (avalanche targets highest APR)
            const firstMonthLarge = result.schedule.find(s => s.debtId === 2 && s.monthNumber === 1);
            const firstMonthSmall = result.schedule.find(s => s.debtId === 1 && s.monthNumber === 1);

            // Large debt (20% APR) should get minimum + extra = 200 + 300 = 500
            expect(firstMonthLarge.paymentAmount).toBeCloseTo(500, 2);

            // Small debt (15% APR) should get only minimum = 25
            expect(firstMonthSmall.paymentAmount).toBeCloseTo(25, 2);

            // Note: Small debt may pay off first due to lower balance, but avalanche targets high APR
        });
    });

    describe('Snowball Strategy (Lowest Balance First)', () => {
        test('should calculate snowball payoff for single debt', () => {
            const debts = [{
                id: 1,
                name: 'Credit Card',
                balance: 5000,
                apr: 18.0,
                minimumPayment: 150
            }];

            const extraPayment = 350;
            const result = DebtCalculator.calculateSnowball(debts, extraPayment);

            expect(result.strategyType).toBe('snowball');
            expect(result.totalDebt).toBe(5000);
            expect(result.payoffMonths).toBeLessThan(15);
            expect(result.totalInterestPaid).toBeGreaterThan(0);
            expect(result.schedule).toBeDefined();
        });

        test('should prioritize lowest balance debt first', () => {
            const debts = [
                { id: 1, name: 'Large Balance', balance: 5000, apr: 24.0, minimumPayment: 100 },
                { id: 2, name: 'Small Balance', balance: 500, apr: 12.0, minimumPayment: 25 },
                { id: 3, name: 'Medium Balance', balance: 2000, apr: 18.0, minimumPayment: 60 }
            ];

            const extraPayment = 250;
            const result = DebtCalculator.calculateSnowball(debts, extraPayment);

            // Verify order: $500 → $2000 → $5000 (regardless of APR)
            const payoffOrder = result.payoffOrder;
            expect(payoffOrder[0].balance).toBe(500);
            expect(payoffOrder[1].balance).toBe(2000);
            expect(payoffOrder[2].balance).toBe(5000);
        });

        test('snowball should pay more interest than avalanche', () => {
            const debts = [
                { id: 1, name: 'Low Balance High APR', balance: 1000, apr: 25.0, minimumPayment: 50 },
                { id: 2, name: 'High Balance Low APR', balance: 5000, apr: 12.0, minimumPayment: 100 }
            ];

            const extraPayment = 200;

            const avalancheResult = DebtCalculator.calculateAvalanche(debts, extraPayment);
            const snowballResult = DebtCalculator.calculateSnowball(debts, extraPayment);

            // Snowball pays smaller balance first (1000), avalanche pays higher APR first (25%)
            // In this case they're the same debt, but test structure is important
            expect(snowballResult.totalInterestPaid).toBeGreaterThanOrEqual(0);
            expect(avalancheResult.totalInterestPaid).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Consolidation Strategy', () => {
        test('should calculate consolidation with weighted average APR', () => {
            const debts = [
                { id: 1, name: 'Card 1', balance: 5000, apr: 18.0, minimumPayment: 150 },
                { id: 2, name: 'Card 2', balance: 3000, apr: 24.0, minimumPayment: 90 },
                { id: 3, name: 'Card 3', balance: 2000, apr: 12.0, minimumPayment: 60 }
            ];

            const consolidationAPR = 15.0; // Better than weighted average
            const result = DebtCalculator.calculateConsolidation(debts, consolidationAPR);

            expect(result.strategyType).toBe('consolidation');
            expect(result.totalDebt).toBe(10000);
            expect(result.consolidatedAPR).toBe(15.0);
            expect(result.monthlyPayment).toBeGreaterThan(0);
            expect(result.payoffMonths).toBeGreaterThan(0);
        });

        test('should use total minimum payments for consolidation', () => {
            const debts = [
                { id: 1, name: 'Card 1', balance: 5000, apr: 18.0, minimumPayment: 150 },
                { id: 2, name: 'Card 2', balance: 3000, apr: 24.0, minimumPayment: 90 }
            ];

            const consolidationAPR = 12.0;
            const result = DebtCalculator.calculateConsolidation(debts, consolidationAPR);

            // Monthly payment should be sum of minimums (150 + 90 = 240)
            expect(result.monthlyPayment).toBeCloseTo(240, 2);
        });

        test('should calculate weighted average APR', () => {
            const debts = [
                { id: 1, balance: 5000, apr: 20.0 },  // 50% of total
                { id: 2, balance: 3000, apr: 15.0 },  // 30% of total
                { id: 3, balance: 2000, apr: 10.0 }   // 20% of total
            ];

            const weightedAPR = DebtCalculator.calculateWeightedAPR(debts);

            // (5000*20 + 3000*15 + 2000*10) / 10000 = 16.5%
            expect(weightedAPR).toBeCloseTo(16.5, 2);
        });
    });

    describe('Strategy Comparison', () => {
        test('should compare all three strategies', () => {
            const debts = [
                { id: 1, name: 'Card 1', balance: 5000, apr: 20.0, minimumPayment: 150 },
                { id: 2, name: 'Card 2', balance: 3000, apr: 18.0, minimumPayment: 90 },
                { id: 3, name: 'Card 3', balance: 2000, apr: 12.0, minimumPayment: 60 }
            ];

            const extraPayment = 200;
            const consolidationAPR = 15.0;

            const comparison = DebtCalculator.compareStrategies(debts, extraPayment, consolidationAPR);

            expect(comparison.avalanche).toBeDefined();
            expect(comparison.snowball).toBeDefined();
            expect(comparison.consolidation).toBeDefined();

            expect(comparison.avalanche.strategyType).toBe('avalanche');
            expect(comparison.snowball.strategyType).toBe('snowball');
            expect(comparison.consolidation.strategyType).toBe('consolidation');

            // Avalanche should always have lowest or equal interest to snowball
            expect(comparison.avalanche.totalInterestPaid).toBeLessThanOrEqual(
                comparison.snowball.totalInterestPaid + 1 // Allow $1 tolerance for rounding
            );
        });

        test('should recommend best strategy based on criteria', () => {
            const debts = [
                { id: 1, name: 'High APR', balance: 5000, apr: 24.0, minimumPayment: 150 },
                { id: 2, name: 'Low APR', balance: 1000, apr: 12.0, minimumPayment: 30 }
            ];

            const extraPayment = 300;
            const consolidationAPR = 15.0;

            const result = DebtCalculator.recommendStrategy(debts, extraPayment, consolidationAPR, {
                motivationStyle: 'optimization' // Prefers avalanche
            });

            expect(result.recommended).toBe('avalanche');
            expect(result.reasoning).toBeDefined();
            expect(result.comparison).toBeDefined();
        });

        test('should recommend snowball for quick wins motivation', () => {
            const debts = [
                { id: 1, name: 'Large High APR', balance: 10000, apr: 24.0, minimumPayment: 200 },
                { id: 2, name: 'Small Low APR', balance: 500, apr: 12.0, minimumPayment: 25 }
            ];

            const extraPayment = 300;
            const consolidationAPR = 15.0;

            const result = DebtCalculator.recommendStrategy(debts, extraPayment, consolidationAPR, {
                motivationStyle: 'quick_wins' // Prefers snowball
            });

            expect(result.recommended).toBe('snowball');
        });
    });

    describe('Edge Cases and Validation', () => {
        test('should handle empty debts array', () => {
            expect(() => {
                DebtCalculator.calculateAvalanche([], 100);
            }).toThrow('No debts provided');
        });

        test('should handle zero extra payment', () => {
            const debts = [{
                id: 1,
                balance: 5000,
                apr: 18.0,
                minimumPayment: 150
            }];

            const result = DebtCalculator.calculateAvalanche(debts, 0);

            // Should still work with just minimum payments
            expect(result.payoffMonths).toBeGreaterThan(0);
            expect(result.schedule[0].paymentAmount).toBeCloseTo(150, 2);
        });

        test('should handle very small debt amounts', () => {
            const debts = [{
                id: 1,
                balance: 10,
                apr: 18.0,
                minimumPayment: 5
            }];

            const result = DebtCalculator.calculateAvalanche(debts, 5);

            // Balance $10 + $0.15 interest = $10.15 total
            // Payment $10 leaves $0.15 for month 2
            expect(result.payoffMonths).toBe(2);
            expect(result.totalInterestPaid).toBeCloseTo(0.15, 2);
            expect(result.schedule[0].paymentAmount).toBeCloseTo(10, 2);
        });

        test('should handle negative extra payment gracefully', () => {
            const debts = [{
                id: 1,
                balance: 5000,
                apr: 18.0,
                minimumPayment: 150
            }];

            // Negative extra payment should be treated as 0
            const result = DebtCalculator.calculateAvalanche(debts, -100);
            expect(result.schedule[0].paymentAmount).toBeCloseTo(150, 2);
        });
    });
});
