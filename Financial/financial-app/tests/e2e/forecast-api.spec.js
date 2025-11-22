const { test, expect } = require('@playwright/test');

test.describe('Phase 2 E2E: Forecast API Tests', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'test@financial-app.com',
        password: 'testpass123'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token;
    console.log('✅ Authentication successful');
  });

  test('should generate 60-day forecast with real transactions', async ({ request }) => {
    const forecastResponse = await request.post('http://localhost:3000/api/forecast', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        startDate: '2025-11-22',
        startingBalance: 2500
      }
    });

    expect(forecastResponse.ok()).toBeTruthy();
    const forecastData = await forecastResponse.json();

    // Verify response structure
    expect(forecastData.success).toBe(true);
    expect(forecastData.forecast).toBeDefined();
    expect(forecastData.metadata).toBeDefined();

    // Verify forecast has 60 days
    expect(forecastData.forecast.days.length).toBe(60);

    // Verify metadata
    expect(forecastData.metadata.transactionCount).toBe(52);

    // Verify summary
    const summary = forecastData.forecast.summary;
    expect(summary.startingBalance).toBe(2500);
    expect(summary.endingBalance).toBeDefined();
    expect(summary.netChange).toBeDefined();
    expect(summary.lowestBalance).toBeDefined();
    expect(summary.lowestBalanceDate).toBeDefined();

    // Verify first day calculations
    const firstDay = forecastData.forecast.days[0];
    expect(firstDay.date).toBe('2025-11-22');
    expect(firstDay.dayOfWeek).toBe('Fri');
    expect(firstDay.balance).toBeDefined();
    expect(firstDay.credits).toBeDefined();
    expect(firstDay.debits).toBeDefined();
    expect(firstDay.flag).toMatch(/^(OK|LOW|NEG)$/);

    // Log results for screenshot
    console.log('\n📊 FORECAST RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Success: ${forecastData.success}`);
    console.log(`📈 Transaction Count: ${forecastData.metadata.transactionCount}`);
    console.log(`📅 Forecast Days: ${forecastData.forecast.days.length}`);
    console.log('\n💰 SUMMARY:');
    console.log(`   Starting Balance: $${summary.startingBalance.toFixed(2)}`);
    console.log(`   Ending Balance: $${summary.endingBalance.toFixed(2)}`);
    console.log(`   Net Change: $${summary.netChange.toFixed(2)}`);
    console.log(`   Lowest Balance: $${summary.lowestBalance.toFixed(2)} on ${summary.lowestBalanceDate}`);
    console.log('\n📅 FIRST 5 DAYS:');
    forecastData.forecast.days.slice(0, 5).forEach(day => {
      console.log(`   ${day.date} (${day.dayOfWeek}): Balance $${day.balance.toFixed(2)} | Credits: $${day.credits.toFixed(2)} | Debits: $${day.debits.toFixed(2)} | Flag: ${day.flag}`);
    });
    console.log('\n🚨 ALERTS:');
    if (forecastData.forecast.alerts.length > 0) {
      forecastData.forecast.alerts.slice(0, 5).forEach(alert => {
        console.log(`   ${alert.date}: ${alert.type} - ${alert.message}`);
      });
      console.log(`   ... ${forecastData.forecast.alerts.length} total alerts`);
    } else {
      console.log('   No alerts');
    }
    console.log('═══════════════════════════════════════\n');
  });

  test('should handle biweekly transactions correctly', async ({ request }) => {
    const forecastResponse = await request.post('http://localhost:3000/api/forecast', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        startDate: '2025-11-22',
        startingBalance: 10000
      }
    });

    const forecastData = await forecastResponse.json();

    // Find days with biweekly transactions
    const daysWithBiweekly = forecastData.forecast.days.filter(day =>
      day.transactions.some(t => t.name === 'Acrisure' || t.name === 'WakeMed' || t.name === 'MMI')
    );

    console.log('\n📊 BIWEEKLY TRANSACTION VERIFICATION:');
    console.log('═══════════════════════════════════════');
    console.log(`Found ${daysWithBiweekly.length} days with biweekly transactions`);
    daysWithBiweekly.slice(0, 6).forEach(day => {
      const biweeklyTxs = day.transactions.filter(t =>
        t.name === 'Acrisure' || t.name === 'WakeMed' || t.name === 'MMI'
      );
      console.log(`   ${day.date}: ${biweeklyTxs.map(t => `${t.name} $${t.amount}`).join(', ')}`);
    });
    console.log('═══════════════════════════════════════\n');

    expect(daysWithBiweekly.length).toBeGreaterThan(0);
  });

  test('should handle monthly transactions correctly', async ({ request }) => {
    const forecastResponse = await request.post('http://localhost:3000/api/forecast', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        startDate: '2025-12-01',
        startingBalance: 5000
      }
    });

    const forecastData = await forecastResponse.json();

    // Check day 1 (should have many monthly transactions)
    const day1 = forecastData.forecast.days.find(d => d.date === '2025-12-01');
    expect(day1).toBeDefined();

    console.log('\n📊 MONTHLY TRANSACTION VERIFICATION:');
    console.log('═══════════════════════════════════════');
    console.log(`Day 1 transactions: ${day1.transactions.length}`);
    console.log(`Day 1 debits: $${day1.debits.toFixed(2)}`);
    console.log('Transactions on Dec 1:');
    day1.transactions.forEach(t => {
      console.log(`   ${t.type === 'OUTFLOW' ? '💸' : '💰'} ${t.name}: $${t.amount}`);
    });
    console.log('═══════════════════════════════════════\n');

    expect(day1.transactions.length).toBeGreaterThan(0);
  });

  test('should handle Friday recurring transactions', async ({ request }) => {
    const forecastResponse = await request.post('http://localhost:3000/api/forecast', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        startDate: '2025-11-22', // This is a Friday
        startingBalance: 3000
      }
    });

    const forecastData = await forecastResponse.json();

    // Find all Fridays
    const fridays = forecastData.forecast.days.filter(d => d.dayOfWeek === 'Fri');

    console.log('\n📊 FRIDAY RECURRING VERIFICATION:');
    console.log('═══════════════════════════════════════');
    console.log(`Found ${fridays.length} Fridays in forecast`);
    fridays.slice(0, 4).forEach(day => {
      const fridayTxs = day.transactions.filter(t =>
        t.name === 'Savings' || t.name === 'Tithe' || t.name === 'Debt Payoff'
      );
      if (fridayTxs.length > 0) {
        console.log(`   ${day.date}: ${fridayTxs.map(t => `${t.name} $${t.amount}`).join(', ')}`);
      }
    });
    console.log('═══════════════════════════════════════\n');

    // Every Friday should have Friday recurring transactions
    const fridaysWithRecurring = fridays.filter(day =>
      day.transactions.some(t => t.name === 'Savings' || t.name === 'Tithe')
    );

    expect(fridaysWithRecurring.length).toBe(fridays.length);
  });

  test('should handle weekday recurring transactions', async ({ request }) => {
    const forecastResponse = await request.post('http://localhost:3000/api/forecast', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        startDate: '2025-11-24', // Monday
        startingBalance: 2000
      }
    });

    const forecastData = await forecastResponse.json();

    // Find weekdays (Mon-Fri)
    const weekdays = forecastData.forecast.days.filter(d =>
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d.dayOfWeek)
    );

    // Find weekends
    const weekends = forecastData.forecast.days.filter(d =>
      ['Sat', 'Sun'].includes(d.dayOfWeek)
    );

    console.log('\n📊 WEEKDAY RECURRING VERIFICATION:');
    console.log('═══════════════════════════════════════');
    console.log(`Total weekdays: ${weekdays.length}`);
    console.log(`Total weekends: ${weekends.length}`);

    // Check that weekdays have NFCU Volvo Loan
    const weekdaysWithNFCU = weekdays.filter(day =>
      day.transactions.some(t => t.name === 'NFCU Volvo Loan')
    );
    console.log(`Weekdays with NFCU Volvo: ${weekdaysWithNFCU.length}`);

    // Check that weekends DON'T have NFCU Volvo Loan
    const weekendsWithNFCU = weekends.filter(day =>
      day.transactions.some(t => t.name === 'NFCU Volvo Loan')
    );
    console.log(`Weekends with NFCU Volvo: ${weekendsWithNFCU.length} (should be 0)`);
    console.log('═══════════════════════════════════════\n');

    expect(weekdaysWithNFCU.length).toBe(weekdays.length);
    expect(weekendsWithNFCU.length).toBe(0);
  });
});
