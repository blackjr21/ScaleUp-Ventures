-- CreateTable
CREATE TABLE "scenarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "scenarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scenario_modifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scenarioId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "modifiedAmount" REAL,
    "modifiedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scenario_modifications_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "scenario_modifications_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scenario_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scenarioId" INTEGER NOT NULL,
    "forecastStartDate" DATETIME NOT NULL,
    "forecastEndDate" DATETIME NOT NULL,
    "startingBalance" REAL NOT NULL,
    "endingBalance" REAL NOT NULL,
    "lowestBalance" REAL NOT NULL,
    "lowestBalanceDate" DATETIME NOT NULL,
    "totalSavings" REAL NOT NULL,
    "dailyBalances" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scenario_results_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "scenarios_userId_isPreset_idx" ON "scenarios"("userId", "isPreset");

-- CreateIndex
CREATE INDEX "scenario_modifications_scenarioId_idx" ON "scenario_modifications"("scenarioId");

-- CreateIndex
CREATE INDEX "scenario_modifications_transactionId_idx" ON "scenario_modifications"("transactionId");

-- CreateIndex
CREATE INDEX "scenario_results_scenarioId_idx" ON "scenario_results"("scenarioId");
