// This script loads the forecast data from JSON
// Falls back to parsing markdown if JSON is not available

async function loadForecastData() {
    try {
        // Try to load JSON first (faster and more reliable)
        const jsonResponse = await fetch('forecast-2025-11-20.json');
        if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            console.log('✅ Loaded forecast data from JSON');
            return transformJsonToDataFormat(jsonData);
        }
    } catch (error) {
        console.log('JSON not available, falling back to markdown parsing');
    }

    // Fallback to markdown parsing
    try {
        const response = await fetch('forecast-2025-11-20.md');
        const markdown = await response.text();

        console.log('⚠️ Loaded forecast data from markdown (slower)');
        const data = parseForecastMarkdown(markdown);
        return data;
    } catch (error) {
        console.error('Error loading forecast:', error);
        // Return embedded data as fallback
        return getEmbeddedForecastData();
    }
}

// Transform JSON format to the format expected by dashboard
function transformJsonToDataFormat(json) {
    return {
        startBalance: json.summary.startBalance,
        endBalance: json.summary.endBalance,
        netChange: json.summary.netChange,
        lowestBalance: json.summary.lowestBalance,
        daysLow: json.summary.daysLow,
        daysNeg: json.summary.daysNeg,
        forecastPeriod: json.summary.forecastPeriod,
        transactions: json.transactions,
        alerts: json.alerts.map(alert => ({
            date: alert.date,
            type: alert.type,
            balance: alert.balance || '$0.00'
        })),
        suggestions: json.suggestions || []
    };
}

function parseForecastMarkdown(markdown) {
    const lines = markdown.split('\n');

    // Extract summary data
    const startBalance = extractValue(lines, 'Starting EOD Balance:') || extractValue(lines, 'Starting balance:');

    // Extract end balance from "Start → End: **$1,362.00 → $7,142.57**"
    let endBalance = 0;
    for (const line of lines) {
        if (line.includes('Start → End:') || line.includes('Start ->  End:')) {
            const matches = line.match(/\$[\d,]+\.?\d*/g);
            if (matches && matches.length >= 2) {
                endBalance = parseFloat(matches[1].replace(/[$,]/g, ''));
                break;
            }
        }
    }
    if (endBalance === 0) {
        endBalance = extractValue(lines, 'Ending balance (Day 60):');
    }

    const netChange = extractValue(lines, 'Net change:');

    // Extract lowest balance from "Lowest day:** **Dec 10** at **$-492.65**"
    let lowestBalance = 0;
    for (const line of lines) {
        if (line.includes('Lowest day:') || line.includes('Lowest balance:')) {
            const match = line.match(/\$[-\d,]+\.?\d*/);
            if (match) {
                lowestBalance = parseFloat(match[0].replace(/[$,]/g, ''));
                break;
            }
        }
    }

    const daysLow = extractNumber(lines, 'LOW (<$500):') || extractNumber(lines, 'Days below $500:');
    const daysNeg = extractNumber(lines, 'NEG (<$0):') || extractNumber(lines, 'Days negative:');

    // Extract date range
    const forecastPeriod = extractDateRange(lines);

    // Parse transaction table
    const transactions = parseTransactionTable(lines);

    // Parse alerts
    const alerts = parseAlerts(lines);

    return {
        startBalance,
        endBalance,
        netChange,
        lowestBalance,
        daysLow,
        daysNeg,
        forecastPeriod,
        transactions,
        alerts
    };
}

function extractValue(lines, prefix) {
    for (const line of lines) {
        if (line.includes(prefix)) {
            const match = line.match(/\$[\d,.-]+/);
            return match ? parseFloat(match[0].replace(/[$,]/g, '')) : 0;
        }
    }
    return 0;
}

function extractNumber(lines, prefix) {
    for (const line of lines) {
        if (line.includes(prefix)) {
            // For patterns like "LOW (<$500): 4 days", extract the number after the colon
            const parts = line.split(prefix);
            if (parts.length > 1) {
                const match = parts[1].match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            }
        }
    }
    return 0;
}

function extractDateRange(lines) {
    for (const line of lines) {
        if (line.includes('Forecast period:') || line.includes('Range:')) {
            const match = line.match(/(\d{4}-\d{2}-\d{2})[^\d]*(\d{4}-\d{2}-\d{2})/);
            return match ? { start: match[1], end: match[2] } : null;
        }
    }
    return null;
}

function parseTransactionTable(lines) {
    const transactions = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for table header - look for line with Date, Debits, Credits, etc
        if (!inTable && line.includes('Date') && line.includes('Debits') && line.includes('Credits')) {
            inTable = true;
            console.log('Found transaction table header at line', i);
            continue;
        }

        if (!inTable) continue;

        // Skip separator lines
        if (line.includes('---') || line.includes('| ---')) {
            continue;
        }

        // Break on empty line or section header
        if (line.trim() === '' || line.startsWith('##')) {
            break;
        }

        // Parse transaction line
        if (line.includes('|')) {
            const parts = line.split('|').map(s => s.trim()).filter(s => s);
            if (parts.length >= 7) {
                // Clean up date (remove day of week in parentheses)
                const dateClean = parts[0].replace(/\s*\([^)]*\)/, '');

                transactions.push({
                    date: dateClean,
                    debits: parts[1],
                    credits: parts[2],
                    netChange: parts[3],
                    endBalance: parts[4],
                    flag: parts[5],
                    debitDetails: parts[6] || '',
                    creditDetails: parts[7] || ''
                });
            }
        }
    }

    console.log('Parsed', transactions.length, 'transactions');
    return transactions;
}

function parseAlerts(lines) {
    const alerts = [];
    let inAlerts = false;

    for (const line of lines) {
        if (line.includes('## 4) Alerts') || line.includes('## 4. ALERTS')) {
            inAlerts = true;
            continue;
        }

        if (!inAlerts) continue;
        if (line.includes('##')) break;

        // Parse format: "* **NEG (<$0):** Dec 07, Dec 08, Dec 09, Dec 10"
        if (line.includes('**NEG') || line.includes('**NEGATIVE')) {
            const dates = line.split(':')[1];
            if (dates) {
                const dateList = dates.split(',').map(d => d.trim());
                dateList.forEach(date => {
                    if (date) {
                        alerts.push({
                            date: date,
                            type: 'NEG',
                            balance: '$0.00' // Will be filled from transaction data
                        });
                    }
                });
            }
        }

        // Parse format: "* **LOW (<$500):** Dec 04, Dec 05, Dec 06, Dec 11"
        if (line.includes('**LOW')) {
            const dates = line.split(':')[1];
            if (dates) {
                const dateList = dates.split(',').map(d => d.trim());
                dateList.forEach(date => {
                    if (date) {
                        alerts.push({
                            date: date,
                            type: 'LOW',
                            balance: '$500.00' // Will be filled from transaction data
                        });
                    }
                });
            }
        }
    }

    return alerts;
}

function getEmbeddedForecastData() {
    // Embedded forecast data from forecast-2025-11-19.md
    return {
        startBalance: 800.00,
        endBalance: 2193.89,
        netChange: 1393.89,
        lowestBalance: -2658.50,
        daysLow: 24,
        daysNeg: 14,
        forecastPeriod: { start: '2025-11-20', end: '2026-01-18' },
        transactions: [
            { date: '2025-11-20', debits: '$3,458.50', credits: '$0.00', netChange: '-$3,458.50', endBalance: '-$2,658.50', flag: 'NEG', debitDetails: 'NFCU ($33), LoanCare Mortgage ($3,425.50)', creditDetails: '' },
            { date: '2025-11-21', debits: '$1,135.00', credits: '$0.00', netChange: '-$1,135.00', endBalance: '-$3,793.50', flag: 'NEG', debitDetails: 'NFCU ($33), MMI ($852), Charleston Management ($49), Buffalo Grove HOA ($51.28), HexClad Pots ($126), Vitruvian Equipment ($99.21)', creditDetails: '' },
            { date: '2025-11-22', debits: '$0.00', credits: '$4,000.00', netChange: '$4,000.00', endBalance: '$206.50', flag: 'LOW', debitDetails: '', creditDetails: 'Acrisure Payroll ($4,000)' },
            { date: '2025-11-23', debits: '$0.00', credits: '$0.00', netChange: '$0.00', endBalance: '$206.50', flag: 'LOW', debitDetails: '', creditDetails: '' },
            { date: '2025-11-24', debits: '$33.00', credits: '$0.00', netChange: '-$33.00', endBalance: '$173.50', flag: 'LOW', debitDetails: 'NFCU ($33)', creditDetails: '' },
            { date: '2025-11-25', debits: '$33.00', credits: '$0.00', netChange: '-$33.00', endBalance: '$140.50', flag: 'LOW', debitDetails: 'NFCU ($33)', creditDetails: '' },
            { date: '2025-11-26', debits: '$177.00', credits: '$0.00', netChange: '-$177.00', endBalance: '-$36.50', flag: 'NEG', debitDetails: 'NFCU ($33), The Container Store ($144)', creditDetails: '' },
            { date: '2025-11-27', debits: '$1,553.00', credits: '$0.00', netChange: '-$1,553.00', endBalance: '-$1,589.50', flag: 'NEG', debitDetails: 'NFCU ($33), Aven Card ($477), Sofi Loan ($1,043)', creditDetails: '' },
            { date: '2025-11-28', debits: '$33.00', credits: '$1,000.00', netChange: '$967.00', endBalance: '-$622.50', flag: 'NEG', debitDetails: 'NFCU ($33)', creditDetails: 'WakeMed ($1,000)' },
            { date: '2025-11-29', debits: '$19.99', credits: '$0.00', netChange: '-$19.99', endBalance: '-$642.49', flag: 'NEG', debitDetails: 'MyFitnessPal ($19.99)', creditDetails: '' },
            { date: '2025-11-30', debits: '$489.29', credits: '$0.00', netChange: '$-489.29', endBalance: '-$1,131.78', flag: 'NEG', debitDetails: 'Chaundra Williams ($270.29), Club Pilates ($219)', creditDetails: '' }
            // ... (would include all 60 days)
        ],
        alerts: [
            { date: '2025-11-20', type: 'NEG', balance: '-$2,658.50' },
            { date: '2025-11-21', type: 'NEG', balance: '-$3,793.50' },
            { date: '2025-11-22', type: 'LOW', balance: '$206.50' }
            // ... (would include all alerts)
        ]
    };
}
