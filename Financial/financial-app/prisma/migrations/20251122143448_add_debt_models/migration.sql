-- CreateTable
CREATE TABLE "debts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "creditor" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "apr" REAL NOT NULL,
    "minimumPayment" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "debt_strategies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "strategyType" TEXT NOT NULL,
    "extraMonthlyPayment" REAL NOT NULL,
    "totalDebt" REAL NOT NULL,
    "totalInterestPaid" REAL NOT NULL,
    "payoffMonths" INTEGER NOT NULL,
    "payoffDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "debt_strategies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "debt_payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "strategyId" INTEGER NOT NULL,
    "debtId" INTEGER NOT NULL,
    "monthNumber" INTEGER NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paymentAmount" REAL NOT NULL,
    "principal" REAL NOT NULL,
    "interest" REAL NOT NULL,
    "remainingBalance" REAL NOT NULL,
    CONSTRAINT "debt_payments_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "debt_strategies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "debt_payments_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "debts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "debts_userId_isActive_idx" ON "debts"("userId", "isActive");

-- CreateIndex
CREATE INDEX "debt_strategies_userId_strategyType_idx" ON "debt_strategies"("userId", "strategyType");

-- CreateIndex
CREATE INDEX "debt_payments_strategyId_idx" ON "debt_payments"("strategyId");

-- CreateIndex
CREATE INDEX "debt_payments_debtId_idx" ON "debt_payments"("debtId");
