const { test, expect } = require('@playwright/test');
const FinancialCalculator = require('../../js/financial-calculator.js');

test.describe('FinancialCalculator', () => {
    test.describe('calculateMonthlyInterest', () => {
        test('should calculate monthly interest correctly for SoFi loan', () => {
            // SoFi: $40,735.15 @ 17.89% = $607.29/month
            const interest = FinancialCalculator.calculateMonthlyInterest(40735.15, 17.89);
            expect(interest).toBeCloseTo(607.29, 1);
        });

        test('should calculate monthly interest for Navy Federal CC', () => {
            // Navy Federal CC: $21,961.40 @ 16.7% = $305.63/month
            const interest = FinancialCalculator.calculateMonthlyInterest(21961.40, 16.7);
            expect(interest).toBeCloseTo(305.63, 1);
        });

        test('should return 0 for zero balance', () => {
            const interest = FinancialCalculator.calculateMonthlyInterest(0, 17.89);
            expect(interest).toBe(0);
        });

        test('should return 0 for negative balance', () => {
            const interest = FinancialCalculator.calculateMonthlyInterest(-1000, 17.89);
            expect(interest).toBe(0);
        });

        test('should return 0 for negative APR', () => {
            const interest = FinancialCalculator.calculateMonthlyInterest(1000, -5);
            expect(interest).toBe(0);
        });
    });

    test.describe('calculateTotalInterest', () => {
        test('should calculate total for multiple debts', () => {
            const debts = [
                { currentBalance: 40735.15, apr: 17.89 }, // SoFi
                { currentBalance: 21961.40, apr: 16.7 }   // Navy Federal
            ];
            const total = FinancialCalculator.calculateTotalInterest(debts);
            // 607.29 + 305.63 = 912.92
            expect(total).toBeCloseTo(912.92, 1);
        });

        test('should handle empty array', () => {
            const total = FinancialCalculator.calculateTotalInterest([]);
            expect(total).toBe(0);
        });

        test('should skip debts with zero balance', () => {
            const debts = [
                { currentBalance: 1000, apr: 10 },
                { currentBalance: 0, apr: 20 }
            ];
            const total = FinancialCalculator.calculateTotalInterest(debts);
            expect(total).toBeCloseTo(8.33, 2);
        });
    });

    test.describe('calculateAnnualInterest', () => {
        test('should multiply monthly by 12', () => {
            const annual = FinancialCalculator.calculateAnnualInterest(1502);
            expect(annual).toBe(18024);
        });

        test('should handle decimals', () => {
            const annual = FinancialCalculator.calculateAnnualInterest(606.35);
            expect(annual).toBeCloseTo(7276.2, 1);
        });
    });

    test.describe('calculateInterestSaved', () => {
        test('should calculate interest saved by payment', () => {
            // Paying $750 on Marriott Amex @ 28.74%
            // Old balance: $5,022, New balance: $4,272
            // Old interest: ~$120.12/mo, New interest: ~$102.16/mo
            // Saved: ~$17.96/mo
            const saved = FinancialCalculator.calculateInterestSaved(5022.01, 28.74, 750);
            expect(saved).toBeCloseTo(17.96, 1);
        });

        test('should handle zero payment', () => {
            const saved = FinancialCalculator.calculateInterestSaved(5000, 28.74, 0);
            expect(saved).toBe(0);
        });

        test('should handle payment equal to balance', () => {
            const saved = FinancialCalculator.calculateInterestSaved(1000, 10, 1000);
            expect(saved).toBeCloseTo(8.33, 2);
        });
    });

    test.describe('calculateDTI', () => {
        test('should calculate DTI correctly', () => {
            // $9,942/mo debt service, $24,500 income = 40.6% DTI
            const dti = FinancialCalculator.calculateDTI(9942, 24500);
            expect(dti).toBeCloseTo(40.6, 1);
        });

        test('should return 0 for zero income', () => {
            const dti = FinancialCalculator.calculateDTI(1000, 0);
            expect(dti).toBe(0);
        });

        test('should handle high DTI', () => {
            const dti = FinancialCalculator.calculateDTI(5000, 5000);
            expect(dti).toBe(100);
        });
    });

    test.describe('formatCurrency', () => {
        test('should format standard amounts', () => {
            expect(FinancialCalculator.formatCurrency(1234.56)).toBe('$1,234.56');
        });

        test('should format large amounts', () => {
            expect(FinancialCalculator.formatCurrency(240583.76)).toBe('$240,583.76');
        });

        test('should format small amounts', () => {
            expect(FinancialCalculator.formatCurrency(5.99)).toBe('$5.99');
        });

        test('should handle zero', () => {
            expect(FinancialCalculator.formatCurrency(0)).toBe('$0.00');
        });
    });

    test.describe('formatLargeNumber', () => {
        test('should format millions', () => {
            expect(FinancialCalculator.formatLargeNumber(1500000)).toBe('$1.5M');
        });

        test('should format thousands', () => {
            expect(FinancialCalculator.formatLargeNumber(240584)).toBe('$241K');
        });

        test('should format 883K correctly', () => {
            expect(FinancialCalculator.formatLargeNumber(883642)).toBe('$884K');
        });

        test('should use currency format for small numbers', () => {
            expect(FinancialCalculator.formatLargeNumber(999)).toBe('$999.00');
        });
    });
});
