/**
 * Transaction Rules - Cash flow transaction data
 * Exported from dashboard.html
 */

const TRANSACTION_RULES = {
    monthlyBills: [
        { id: 'vitruvian-membership', name: 'Vitruvian Membership', amount: 39, day: 1 },
        { id: 'transamerica', name: 'TRANSAMERICA Insurance', amount: 245.65, day: 1 },
        { id: 'apple-card', name: 'Apple Card', amount: 30.00, day: 1 },
        { id: 'supplements', name: 'Supplements', amount: 300, day: 1 },
        { id: 'payment-coordinator', name: 'Payment Coordinator', amount: 500, day: 1 },
        { id: 'synchrony-bank', name: 'SYNCHRONY Bank Bill Payment', amount: 58.00, day: 3 },
        { id: 'synchrony-credit', name: 'SYNCHRONY Credit Card', amount: 87.00, day: 3 },
        { id: 'bill-me-later', name: 'Bill Me Later', amount: 125.00, day: 3 },
        { id: 'connell-gelb', name: 'Connell & Gelb', amount: 500, day: 4 },
        { id: 'loancare-mortgage', name: 'LoanCare Mortgage', amount: 3566.24, day: 5 },
        { id: 'sleep-number', name: 'Sleep Number', amount: 434.58, day: 7 },
        { id: 'hexclad', name: 'HexClad Pots', amount: 126, day: 9 },
        { id: 'duke-energy', name: 'Duke Energy NC', amount: 86.00, day: 9 },
        { id: 'ashley-venture', name: 'Ashley Venture', amount: 67, day: 10 },
        { id: 'netflix', name: 'Netflix', amount: 25, day: 10 },
        { id: 'att', name: 'AT&T', amount: 52.50, day: 10 },
        { id: 'sba-eidl', name: 'SBA EIDL Loan', amount: 315.00, day: 14 },
        { id: 'chaundra-1', name: 'Chaundra Williams', amount: 270.29, day: 15 },
        { id: '2nd-mortgage', name: '2nd Mortgage', amount: 1540.69, day: 15 },
        { id: 'nc529', name: 'NC529 College Savings', amount: 50.00, day: 15 },
        { id: 'ashley-quicksilver', name: 'Ashley QuickSilver', amount: 126, day: 18 },
        { id: 'c3-baseball', name: 'C3 Baseball Training', amount: 312.00, day: 18 },
        { id: 'allstate', name: 'ALLSTATE Insurance', amount: 243.84, day: 20 },
        { id: 'merry-maids', name: 'Merry Maids', amount: 175, day: 20 },
        { id: 'pliability', name: 'pliability', amount: 13.99, day: 22 },
        { id: 'loan-feb-2022', name: 'Loan (Feb 17, 2022)', amount: 322.60, day: 22 },
        { id: 'loan-mar-2025', name: 'Loan (Mar 19, 2025)', amount: 376.54, day: 22 },
        { id: 'vitruvian-equipment', name: 'Vitruvian Equipment', amount: 99.21, day: 23 },
        { id: 'container-store', name: 'The Container Store', amount: 144, day: 26 },
        { id: 'aven-card', name: 'Aven Card', amount: 477, day: 27 },
        { id: 'sofi-loan', name: 'Sofi Loan', amount: 1042.78, day: 27 },
        { id: 'myfitnesspal', name: 'MyFitnessPal', amount: 19.99, day: 29 },
        { id: 'chaundra-2', name: 'Chaundra Williams', amount: 270.29, day: 30 },
        { id: 'club-pilates', name: 'Club Pilates', amount: 219, day: 30 }
    ],
    biweeklyBills: [
        { id: 'mmi', name: 'MMI', amount: 852, anchor: '2025-08-08' },
        { id: 'charleston-mgmt', name: 'Charleston Management', amount: 49, anchor: '2025-04-24' },
        { id: 'buffalo-grove', name: 'Buffalo Grove HOA', amount: 51.28, anchor: '2025-09-05' },
        { id: 'groceries', name: 'Groceries', amount: 500, anchor: '2025-11-28' },
        { id: 'gas', name: 'Gas', amount: 100, anchor: '2025-11-28' },
        { id: 'eating-out', name: 'Eating Out', amount: 250, anchor: '2025-11-28' },
        { id: 'principal-loan', name: 'Principal Loan', amount: 198, anchor: '2025-11-14' }
    ],
    weekdayRecurring: [
        { id: 'nfcu-volvo', name: 'NFCU Volvo Loan', amount: 33 }
    ],
    fridayAllocations: [
        { id: 'savings', name: 'Savings', amount: 200 },
        { id: 'tithe', name: 'Tithe', amount: 100 },
        { id: 'debt-payoff', name: 'Debt Payoff', amount: 1000 }
    ],
    biweeklyInflows: [
        { id: 'acrisure', name: 'Acrisure', amount: 4487, anchor: '2025-08-08' },
        { id: 'wakemed', name: 'WakeMed', amount: 1000, anchor: '2025-08-07' },
        { id: 'claritev', name: 'Claritev', amount: 3500, anchor: '2025-12-05' }
    ],
    monthlyInflows: [
        { id: 'grandmont-rent', name: '103 Grandmont Rent', amount: 1530.00, day: 15 }
    ],
    oneTimeAdjustments: {
        '2025-11-28': { acrisureReduction: 1987 },
        '2025-11-20': { earlyTransfer: 1000 },
        '2025-11-21': { earlyTransfer: 500 },
        '2025-11-25': { earlyTransfer: 1000 }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.TRANSACTION_RULES = TRANSACTION_RULES;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TRANSACTION_RULES;
}
