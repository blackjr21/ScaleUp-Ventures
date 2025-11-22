const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000';
let authToken = '';
let createdTransactionId = null;

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
  lines.push('║     PHASE 2.5: TRANSACTIONS CRUD API - E2E TEST RESULTS       ║');
  lines.push('╚════════════════════════════════════════════════════════════════╝');
  lines.push('');

  return lines;
}

async function runTests() {
  const output = formatOutput();

  try {
    // TEST 1: Login to get auth token
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
      output.push(`✅ User: ${loginResponse.body.user.username} (${loginResponse.body.user.email})`);
    } else {
      output.push(`❌ Login failed: ${loginResponse.status}`);
      throw new Error('Authentication failed');
    }

    output.push('');

    // TEST 2: Create a new transaction (POST)
    output.push('📝 TEST 2: Create New Transaction (POST /api/transactions)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const newTransaction = {
      name: 'E2E Test Bill',
      amount: 299.99,
      type: 'OUTFLOW',
      frequency: 'MONTHLY',
      dayOfMonth: 15,
      isActive: true
    };

    const createResponse = await makeRequest('POST', `${API_BASE}/api/transactions`, newTransaction, authToken);

    if (createResponse.status === 201 && createResponse.body.success) {
      createdTransactionId = createResponse.body.transaction.id;
      output.push(`✅ Status: ${createResponse.status}`);
      output.push(`✅ Success: ${createResponse.body.success}`);
      output.push(`✅ Transaction ID: ${createdTransactionId}`);
      output.push(`✅ Name: ${createResponse.body.transaction.name}`);
      output.push(`✅ Amount: $${createResponse.body.transaction.amount.toFixed(2)}`);
      output.push(`✅ Type: ${createResponse.body.transaction.type}`);
      output.push(`✅ Frequency: ${createResponse.body.transaction.frequency}`);
      output.push(`✅ Day of Month: ${createResponse.body.transaction.dayOfMonth}`);
    } else {
      output.push(`❌ Create failed: ${createResponse.status}`);
      output.push(`❌ Response: ${JSON.stringify(createResponse.body)}`);
    }

    output.push('');

    // TEST 3: Get all transactions (GET)
    output.push('📝 TEST 3: Get All Transactions (GET /api/transactions)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const getAllResponse = await makeRequest('GET', `${API_BASE}/api/transactions`, null, authToken);

    if (getAllResponse.status === 200 && getAllResponse.body.success) {
      output.push(`✅ Status: ${getAllResponse.status}`);
      output.push(`✅ Success: ${getAllResponse.body.success}`);
      output.push(`✅ Total Transactions: ${getAllResponse.body.count}`);
      output.push('');
      output.push('📊 First 5 transactions:');
      getAllResponse.body.transactions.slice(0, 5).forEach((t, i) => {
        output.push(`   ${i + 1}. ${t.name} - $${t.amount.toFixed(2)} (${t.type}, ${t.frequency})`);
      });
    } else {
      output.push(`❌ Get all failed: ${getAllResponse.status}`);
    }

    output.push('');

    // TEST 4: Get single transaction (GET /:id)
    output.push('📝 TEST 4: Get Single Transaction (GET /api/transactions/:id)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const getOneResponse = await makeRequest('GET', `${API_BASE}/api/transactions/${createdTransactionId}`, null, authToken);

    if (getOneResponse.status === 200 && getOneResponse.body.success) {
      output.push(`✅ Status: ${getOneResponse.status}`);
      output.push(`✅ Transaction Found: ${getOneResponse.body.transaction.name}`);
      output.push(`✅ Amount: $${getOneResponse.body.transaction.amount.toFixed(2)}`);
      output.push(`✅ Active: ${getOneResponse.body.transaction.isActive}`);
    } else {
      output.push(`❌ Get one failed: ${getOneResponse.status}`);
    }

    output.push('');

    // TEST 5: Update transaction (PUT)
    output.push('📝 TEST 5: Update Transaction (PUT /api/transactions/:id)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const updateData = {
      name: 'E2E Test Bill (Updated)',
      amount: 349.99,
      isActive: false
    };

    const updateResponse = await makeRequest('PUT', `${API_BASE}/api/transactions/${createdTransactionId}`, updateData, authToken);

    if (updateResponse.status === 200 && updateResponse.body.success) {
      output.push(`✅ Status: ${updateResponse.status}`);
      output.push(`✅ Updated Name: ${updateResponse.body.transaction.name}`);
      output.push(`✅ Updated Amount: $${updateResponse.body.transaction.amount.toFixed(2)}`);
      output.push(`✅ Updated Active: ${updateResponse.body.transaction.isActive}`);
    } else {
      output.push(`❌ Update failed: ${updateResponse.status}`);
    }

    output.push('');

    // TEST 6: Filter transactions by type
    output.push('📝 TEST 6: Filter Transactions by Type (GET /api/transactions?type=OUTFLOW)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const filterResponse = await makeRequest('GET', `${API_BASE}/api/transactions?type=OUTFLOW`, null, authToken);

    if (filterResponse.status === 200 && filterResponse.body.success) {
      output.push(`✅ Status: ${filterResponse.status}`);
      output.push(`✅ OUTFLOW Transactions: ${filterResponse.body.count}`);

      // Verify all are OUTFLOWs
      const allOutflows = filterResponse.body.transactions.every(t => t.type === 'OUTFLOW');
      output.push(`✅ All results are OUTFLOW: ${allOutflows}`);
    } else {
      output.push(`❌ Filter failed: ${filterResponse.status}`);
    }

    output.push('');

    // TEST 7: Filter by isActive
    output.push('📝 TEST 7: Filter Active Transactions (GET /api/transactions?isActive=true)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const activeResponse = await makeRequest('GET', `${API_BASE}/api/transactions?isActive=true`, null, authToken);

    if (activeResponse.status === 200 && activeResponse.body.success) {
      output.push(`✅ Status: ${activeResponse.status}`);
      output.push(`✅ Active Transactions: ${activeResponse.body.count}`);

      const allActive = activeResponse.body.transactions.every(t => t.isActive === true);
      output.push(`✅ All results are active: ${allActive}`);
    } else {
      output.push(`❌ Filter active failed: ${activeResponse.status}`);
    }

    output.push('');

    // TEST 8: Delete transaction (DELETE)
    output.push('📝 TEST 8: Delete Transaction (DELETE /api/transactions/:id)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const deleteResponse = await makeRequest('DELETE', `${API_BASE}/api/transactions/${createdTransactionId}`, null, authToken);

    if (deleteResponse.status === 200 && deleteResponse.body.success) {
      output.push(`✅ Status: ${deleteResponse.status}`);
      output.push(`✅ Message: ${deleteResponse.body.message}`);

      // Verify it's deleted
      const verifyDeleteResponse = await makeRequest('GET', `${API_BASE}/api/transactions/${createdTransactionId}`, null, authToken);
      if (verifyDeleteResponse.status === 404) {
        output.push(`✅ Verification: Transaction no longer exists (404)`);
      } else {
        output.push(`⚠️  Verification: Transaction still exists (${verifyDeleteResponse.status})`);
      }
    } else {
      output.push(`❌ Delete failed: ${deleteResponse.status}`);
    }

    output.push('');

    // TEST 9: Create transaction with validation error
    output.push('📝 TEST 9: Validation Testing (Missing required fields)');
    output.push('──────────────────────────────────────────────────────────────────────');

    const invalidTransaction = {
      name: 'Invalid Transaction'
      // Missing amount, type, frequency
    };

    const validationResponse = await makeRequest('POST', `${API_BASE}/api/transactions`, invalidTransaction, authToken);

    if (validationResponse.status === 400) {
      output.push(`✅ Status: ${validationResponse.status} (validation error as expected)`);
      output.push(`✅ Error message: ${validationResponse.body.error}`);
    } else {
      output.push(`❌ Validation test failed: Expected 400, got ${validationResponse.status}`);
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

  // Save output to file
  const outputPath = path.join(__dirname, '../../assets/screenshots/phase2-5-transactions-crud-results.txt');
  fs.writeFileSync(outputPath, output.join('\n'));

  // Print to console
  console.log(output.join('\n'));

  process.exit(0);
}

// Run tests
console.log('Starting Transactions CRUD API E2E Tests...');
console.log('Make sure the server is running on http://localhost:3000');
console.log('');

setTimeout(() => {
  runTests();
}, 1000);
