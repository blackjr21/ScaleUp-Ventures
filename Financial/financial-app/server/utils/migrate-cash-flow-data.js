const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Parse cash-flow-data.md and migrate to database
 * @param {string} filePath - Path to cash-flow-data.md
 * @param {number} userId - User ID to assign transactions to
 */
async function migrateCashFlowData(filePath, userId) {
  const content = fs.readFileSync(filePath, 'utf8');
  const transactions = [];

  // Parse INFLOWS - Biweekly
  const biweeklyInflowsMatch = content.match(/##\s+INFLOWS\s+\(Biweekly.*?\)(.*?)---/s);
  if (biweeklyInflowsMatch) {
    const lines = biweeklyInflowsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      // Format: - Name: $amount | Anchor: YYYY-MM-DD
      const match = line.match(/-\s+(.+?):\s+\$([0-9,]+(?:\.[0-9]{2})?)\s+\|\s+Anchor:\s+(\d{4}-\d{2}-\d{2})/);
      if (match) {
        transactions.push({
          name: match[1].trim(),
          amount: parseFloat(match[2].replace(/,/g, '')),
          type: 'INFLOW',
          frequency: 'BIWEEKLY',
          anchorDate: new Date(match[3]),
          userId
        });
      }
    });
  }

  // Parse INFLOWS - Monthly
  const monthlyInflowsMatch = content.match(/##\s+INFLOWS\s+-\s+Monthly(.*?)---/s);
  if (monthlyInflowsMatch) {
    const lines = monthlyInflowsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      // Format: - Day X: Name $amount
      const match = line.match(/-\s+Day\s+(\d+):\s+(.+?)\s+\$([0-9,]+(?:\.[0-9]{2})?)/);
      if (match) {
        transactions.push({
          name: match[2].trim(),
          amount: parseFloat(match[3].replace(/,/g, '')),
          type: 'INFLOW',
          frequency: 'MONTHLY',
          dayOfMonth: parseInt(match[1]),
          userId
        });
      }
    });
  }

  // Parse OUTFLOWS - Monthly
  const monthlyOutflowsMatch = content.match(/##\s+OUTFLOWS\s+-\s+Monthly(.*?)(?:---|\*\*TBD)/s);
  if (monthlyOutflowsMatch) {
    const lines = monthlyOutflowsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      // Format: - Day X: Name1 $amount1; Name2 $amount2
      const dayMatch = line.match(/-\s+Day\s+(\d+):\s+(.+)/);
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        const items = dayMatch[2].split(';');

        items.forEach(item => {
          const itemMatch = item.trim().match(/(.+?)\s+\$([0-9,]+(?:\.[0-9]{2})?)/);
          if (itemMatch) {
            transactions.push({
              name: itemMatch[1].trim(),
              amount: parseFloat(itemMatch[2].replace(/,/g, '')),
              type: 'OUTFLOW',
              frequency: 'MONTHLY',
              dayOfMonth: day,
              userId
            });
          }
        });
      }
    });
  }

  // Parse OUTFLOWS - Weekday Recurring
  const weekdayOutflowsMatch = content.match(/##\s+OUTFLOWS\s+-\s+Weekday\s+Recurring(.*?)---/s);
  if (weekdayOutflowsMatch) {
    const lines = weekdayOutflowsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      // Format: - Name: $amount every weekday
      const match = line.match(/-\s+(.+?):\s+\$([0-9,]+(?:\.[0-9]{2})?)/);
      if (match) {
        transactions.push({
          name: match[1].trim(),
          amount: parseFloat(match[2].replace(/,/g, '')),
          type: 'OUTFLOW',
          frequency: 'WEEKDAY',
          userId
        });
      }
    });
  }

  // Parse OUTFLOWS - Friday Recurring
  const fridayOutflowsMatch = content.match(/##\s+OUTFLOWS\s+-\s+Friday\s+Recurring(.*?)---/s);
  if (fridayOutflowsMatch) {
    const lines = fridayOutflowsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      // Format: - Name: $amount
      const match = line.match(/-\s+(.+?):\s+\$([0-9,]+(?:\.[0-9]{2})?)/);
      if (match) {
        transactions.push({
          name: match[1].trim(),
          amount: parseFloat(match[2].replace(/,/g, '')),
          type: 'OUTFLOW',
          frequency: 'FRIDAY',
          userId
        });
      }
    });
  }

  // Parse OUTFLOWS - Biweekly
  const biweeklyOutflowsMatch = content.match(/##\s+OUTFLOWS\s+-\s+Biweekly(.*?)---/s);
  if (biweeklyOutflowsMatch) {
    const lines = biweeklyOutflowsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      // Format: - Name: $amount | Anchor: YYYY-MM-DD
      const match = line.match(/-\s+(.+?):\s+\$([0-9,]+(?:\.[0-9]{2})?)\s+\|\s+Anchor:\s+(\d{4}-\d{2}-\d{2})/);
      if (match) {
        transactions.push({
          name: match[1].trim(),
          amount: parseFloat(match[2].replace(/,/g, '')),
          type: 'OUTFLOW',
          frequency: 'BIWEEKLY',
          anchorDate: new Date(match[3]),
          userId
        });
      }
    });
  }

  // Parse INFLOWS - One-Time
  const oneTimeInflowsMatch = content.match(/##\s+INFLOWS\s+-\s+One-Time(.*?)(?:\*\*TODO|---)/s);
  if (oneTimeInflowsMatch) {
    const lines = oneTimeInflowsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      // Format: - MMM DD, YYYY: Name $amount
      const match = line.match(/-\s+([A-Za-z]+\s+\d+,\s+\d{4}):\s+(.+?)\s+\$([0-9,]+(?:\.[0-9]{2})?)/);
      if (match) {
        transactions.push({
          name: match[2].trim(),
          amount: parseFloat(match[3].replace(/,/g, '')),
          type: 'INFLOW',
          frequency: 'ONE_TIME',
          anchorDate: new Date(match[1]),
          userId
        });
      }
    });
  }

  console.log(`Parsed ${transactions.length} transactions from ${filePath}`);

  // Insert transactions into database
  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction
    });
  }

  console.log(`Successfully migrated ${transactions.length} transactions to database`);
  return transactions;
}

module.exports = { migrateCashFlowData };

// If run directly from command line
if (require.main === module) {
  const userId = process.argv[2] ? parseInt(process.argv[2]) : 1;
  const cashFlowDataPath = process.argv[3] || '/Users/calvinwilliamsjr/Personal AI Enablement/Personal/Financial/Cash Flow Forecasts/data/cash-flow-data.md';

  migrateCashFlowData(cashFlowDataPath, userId)
    .then(() => {
      console.log('Migration complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
