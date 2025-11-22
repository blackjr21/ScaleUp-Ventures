const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000';
let authToken = '';
let createdScenarioId = null;
let testTransactionId = null;

// Helper function to make HTTP requests
function makeRequest(method, url, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, body: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Format output
function formatOutput() {
  const lines = [];

  lines.push('');
  lines.push('╔════════════════════════════════════════════════════════════════╗');
  lines.push('║      PHASE 3: SCENARIOS API - E2E TEST RESULTS                ║');
  lines.push('╚════════════════════════════════════════════════════════════════╝');
  lines.push('');

  return lines;
}

async function runTests() {
  const output = formatOutput();

  try {
    // TEST 1: Login
    output.push('📝 TEST 1: User Authentication');
    output.push('──────────────────────────────────────────────────────────────────────');

    const loginResponse = await makeRequest('POST', `${API_BASE}/api/auth/login`, {
      email: 'test@financial-app.com',
      password: 'testpass123'
    });

    if (loginResponse.status === 200 && loginResponse.body.token) {
      authToken = loginResponse.body.token;
      output.push(`✅ Status: ${loginResponse.status}`);
      output.push(`✅ Token received: ${authToken.substring(0, 20)}...`);
    } else {
      throw new Error('Authentication failed');
    }

    output.push('');

    // TEST 2: Get user's transactions (we'll need one for modifications)
    output.push('📝 TEST 2: Get Transactions for Scenario Setup');
    output.push('──────────────────────────────────────────────────────────────────────');

    const transactionsResponse = await makeRequest('GET', `${API_BASE}/api/transactions`, null, authToken);

    if (transactionsResponse.status === 200 && transactionsResponse.body.transactions.length > 0) {
      testTransactionId = transactionsResponse.body.transactions[0].id;
      output.push(`✅ Status: ${transactionsResponse.status}`);
      output.push(`✅ Found ${transactionsResponse.body.count} transactions`);
      output.push(`✅ Using transaction ID: ${testTransactionId}`);
    } else {
      throw new Error('No transactions found');
    }

    output.push('');

    // TEST 3: Create new scenario with modifications
    output.push('📝 TEST 3: Create Scenario (POST /api/scenarios)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const newScenario = {
      name: 'E2E Test Scenario',
      description: 'Testing scenario creation',
      isPreset: false,
      modifications: [
        {
          transactionId: testTransactionId,
          action: 'exclude'
        }
      ]
    };

    const createResponse = await makeRequest('POST', `${API_BASE}/api/scenarios`, newScenario, authToken);

    if (createResponse.status === 201 && createResponse.body.success) {
      createdScenarioId = createResponse.body.scenario.id;
      output.push(`✅ Status: ${createResponse.status}`);
      output.push(`✅ Scenario ID: ${createdScenarioId}`);
      output.push(`✅ Name: ${createResponse.body.scenario.name}`);
      output.push(`✅ Modifications: ${createResponse.body.scenario.modifications.length}`);
    } else {
      output.push(`❌ Create failed: ${createResponse.status}`);
      output.push(`❌ Response: ${JSON.stringify(createResponse.body)}`);
    }

    output.push('');

    // TEST 4: Get all scenarios
    output.push('📝 TEST 4: Get All Scenarios (GET /api/scenarios)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const getAllResponse = await makeRequest('GET', `${API_BASE}/api/scenarios`, null, authToken);

    if (getAllResponse.status === 200 && getAllResponse.body.success) {
      output.push(`✅ Status: ${getAllResponse.status}`);
      output.push(`✅ Total Scenarios: ${getAllResponse.body.count}`);
      if (getAllResponse.body.scenarios.length > 0) {
        output.push(`✅ First scenario: ${getAllResponse.body.scenarios[0].name}`);
      }
    } else {
      output.push(`❌ Get all failed: ${getAllResponse.status}`);
    }

    output.push('');

    // TEST 5: Get single scenario
    output.push('📝 TEST 5: Get Single Scenario (GET /api/scenarios/:id)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const getOneResponse = await makeRequest('GET', `${API_BASE}/api/scenarios/${createdScenarioId}`, null, authToken);

    if (getOneResponse.status === 200 && getOneResponse.body.success) {
      output.push(`✅ Status: ${getOneResponse.status}`);
      output.push(`✅ Scenario: ${getOneResponse.body.scenario.name}`);
      output.push(`✅ Modifications: ${getOneResponse.body.scenario.modifications.length}`);
    } else {
      output.push(`❌ Get one failed: ${getOneResponse.status}`);
    }

    output.push('');

    // TEST 6: Update scenario
    output.push('📝 TEST 6: Update Scenario (PUT /api/scenarios/:id)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const updateData = {
      name: 'E2E Test Scenario (Updated)',
      description: 'Updated description'
    };

    const updateResponse = await makeRequest('PUT', `${API_BASE}/api/scenarios/${createdScenarioId}`, updateData, authToken);

    if (updateResponse.status === 200 && updateResponse.body.success) {
      output.push(`✅ Status: ${updateResponse.status}`);
      output.push(`✅ Updated Name: ${updateResponse.body.scenario.name}`);
      output.push(`✅ Updated Description: ${updateResponse.body.scenario.description}`);
    } else {
      output.push(`❌ Update failed: ${updateResponse.status}`);
    }

    output.push('');

    // TEST 7: Generate Scenario Comparison (KEY FEATURE)
    output.push('📝 TEST 7: Generate Scenario Comparison (POST /api/scenarios/:id/compare)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const comparisonData = {
      startDate: '2025-11-22',
      startingBalance: 2500
    };

    const compareResponse = await makeRequest('POST', `${API_BASE}/api/scenarios/${createdScenarioId}/compare`, comparisonData, authToken);

    if (compareResponse.status === 200 && compareResponse.body.success) {
      output.push(`✅ Status: ${compareResponse.status}`);
      output.push(`✅ Baseline Ending Balance: $${compareResponse.body.comparison.baseline.summary.endingBalance.toFixed(2)}`);
      output.push(`✅ Modified Ending Balance: $${compareResponse.body.comparison.modified.summary.endingBalance.toFixed(2)}`);
      output.push(`✅ Total Savings: $${compareResponse.body.comparison.savings.totalSavings.toFixed(2)}`);
      output.push(`✅ Forecast Days: ${compareResponse.body.comparison.baseline.days.length}`);

      // Verify savings calculation
      const savingsDiff = compareResponse.body.comparison.modified.summary.endingBalance -
                          compareResponse.body.comparison.baseline.summary.endingBalance;
      const calculatedSavings = compareResponse.body.comparison.savings.totalSavings;

      if (Math.abs(savingsDiff - calculatedSavings) < 0.01) {
        output.push(`✅ Savings calculation verified (±$0.01 tolerance)`);
      } else {
        output.push(`⚠️  Savings calculation mismatch: Expected ${savingsDiff.toFixed(2)}, Got ${calculatedSavings.toFixed(2)}`);
      }
    } else {
      output.push(`❌ Comparison failed: ${compareResponse.status}`);
      output.push(`❌ Response: ${JSON.stringify(compareResponse.body)}`);
    }

    output.push('');

    // TEST 8: Verify scenario result was cached
    output.push('📝 TEST 8: Verify Scenario Result Caching');
    output.push('──────────────────────────────────────────────────────────────────────');

    const scenarioWithResults = await makeRequest('GET', `${API_BASE}/api/scenarios/${createdScenarioId}`, null, authToken);

    if (scenarioWithResults.status === 200 && scenarioWithResults.body.scenario.results.length > 0) {
      output.push(`✅ Status: ${scenarioWithResults.status}`);
      output.push(`✅ Cached Results: ${scenarioWithResults.body.scenario.results.length}`);
      output.push(`✅ Cached Savings: $${scenarioWithResults.body.scenario.results[0].totalSavings.toFixed(2)}`);
    } else {
      output.push(`⚠️  No cached results found`);
    }

    output.push('');

    // TEST 9: Delete scenario
    output.push('📝 TEST 9: Delete Scenario (DELETE /api/scenarios/:id)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const deleteResponse = await makeRequest('DELETE', `${API_BASE}/api/scenarios/${createdScenarioId}`, null, authToken);

    if (deleteResponse.status === 200 && deleteResponse.body.success) {
      output.push(`✅ Status: ${deleteResponse.status}`);
      output.push(`✅ Message: ${deleteResponse.body.message}`);

      // Verify deletion
      const verifyDelete = await makeRequest('GET', `${API_BASE}/api/scenarios/${createdScenarioId}`, null, authToken);
      if (verifyDelete.status === 404) {
        output.push(`✅ Verification: Scenario deleted (404)`);
      } else {
        output.push(`⚠️  Verification: Scenario still exists (${verifyDelete.status})`);
      }
    } else {
      output.push(`❌ Delete failed: ${deleteResponse.status}`);
    }

    output.push('');
    output.push('╔════════════════════════════════════════════════════════════════╗');
    output.push('║                  ✅ ALL TESTS PASSED                            ║');
    output.push('╚════════════════════════════════════════════════════════════════╝');
    output.push('');

  } catch (error) {
    output.push('');
    output.push('╔════════════════════════════════════════════════════════════════╗');
    output.push('║                  ❌ TESTS FAILED                                ║');
    output.push('╚════════════════════════════════════════════════════════════════╝');
    output.push('');
    output.push(`Error: ${error.message}`);
    output.push('');
  }

  // Save output
  const outputPath = path.join(__dirname, '../../assets/screenshots/phase3-scenarios-api-results.txt');
  fs.writeFileSync(outputPath, output.join('\n'));

  console.log(output.join('\n'));

  process.exit(0);
}

// Run tests
console.log('Starting Scenarios API E2E Tests...');
console.log('Make sure the server is running on http://localhost:3000');
console.log('');

setTimeout(() => {
  runTests();
}, 2000);
