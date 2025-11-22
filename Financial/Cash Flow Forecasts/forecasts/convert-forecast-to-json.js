/**
 * Convert forecast markdown to JSON format
 * Usage: node convert-forecast-to-json.js forecast-2025-11-20.md
 */

import fs from 'fs';
import path from 'path';

function parseForecastMarkdown(markdown) {
    const lines = markdown.split('\n');

    // Extract summary data
    const startBalance = extractValue(lines, 'Starting EOD Balance:');
    const endBalance = extractEndBalance(lines);
    const netChange = extractValue(lines, 'Net change:');
    const lowestBalance = extractLowestBalance(lines);
    const daysLow = extractNumber(lines, 'LOW (<$500):');
    const daysNeg = extractNumber(lines, 'NEG (<$0):');

    // Extract date range
    const forecastPeriod = extractDateRange(lines);

    // Parse transactions
    const transactions = parseTransactionTable(lines);

    // Calculate alerts from actual transaction balances (not from markdown parsing)
    const alerts = calculateAlertsFromTransactions(transactions);

    // Extract suggestions
    const suggestions = parseSuggestions(lines);

    return {
        metadata: {
            generatedDate: new Date().toISOString(),
            sourceFile: process.argv[2] || 'unknown'
        },
        summary: {
            startBalance,
            endBalance,
            netChange,
            lowestBalance,
            daysLow,
            daysNeg,
            forecastPeriod
        },
        transactions,
        alerts,
        suggestions
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

function extractEndBalance(lines) {
    for (const line of lines) {
        if (line.includes('Start → End:')) {
            const matches = line.match(/\$[\d,]+\.?\d*/g);
            if (matches && matches.length >= 2) {
                return parseFloat(matches[1].replace(/[$,]/g, ''));
            }
        }
    }
    return 0;
}

function extractLowestBalance(lines) {
    for (const line of lines) {
        if (line.includes('Lowest day:')) {
            const match = line.match(/\$[-\d,]+\.?\d*/);
            if (match) {
                return parseFloat(match[0].replace(/[$,]/g, ''));
            }
        }
    }
    return 0;
}

function extractNumber(lines, prefix) {
    for (const line of lines) {
        if (line.includes(prefix)) {
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
        if (line.includes('Range:') || line.includes('Forecast period:')) {
            // Match pattern like "Friday, Nov 21, 2025 → Wednesday, Dec 31, 2025"
            const match = line.match(/(\w+,?\s+\w+\s+\d+,\s+\d{4})\s*→\s*(\w+,?\s+\w+\s+\d+,\s+\d{4})/);
            if (match) {
                return {
                    start: parseFriendlyDate(match[1]),
                    end: parseFriendlyDate(match[2])
                };
            }
            // Fallback to ISO date format
            const isoMatch = line.match(/(\d{4}-\d{2}-\d{2})[^\d]*(\d{4}-\d{2}-\d{2})/);
            if (isoMatch) {
                return { start: isoMatch[1], end: isoMatch[2] };
            }
        }
    }
    return null;
}

function parseFriendlyDate(dateStr) {
    // Convert "Friday, Nov 21, 2025" to "2025-11-21"
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const match = dateStr.match(/(\w+)\s+(\d+),\s+(\d{4})/);
    if (match) {
        const month = months[match[1]];
        const day = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

function parseTransactionTable(lines) {
    const transactions = [];
    let inTable = false;

    for (const line of lines) {
        if (!inTable && line.includes('Date') && line.includes('Debits') && line.includes('Credits')) {
            inTable = true;
            continue;
        }

        if (!inTable) continue;

        if (line.includes('---')) continue;

        if (line.trim() === '' || line.startsWith('##')) {
            break;
        }

        if (line.includes('|')) {
            const parts = line.split('|').map(s => s.trim());
            // Table format: | Date | Debits | Credits | Net Change | End Balance | Flag | Debit Names | Credit Names |
            // parts[0] = empty (before first |)
            // parts[1] = Date, parts[2] = Debits, parts[3] = Credits, parts[4] = Net Change,
            // parts[5] = End Balance, parts[6] = Flag, parts[7] = Debit Names, parts[8] = Credit Names
            // parts[9] = empty (after last |)
            if (parts.length >= 9) {
                const dateClean = parts[1].replace(/\s*\([^)]*\)/, '');

                transactions.push({
                    date: dateClean,
                    debits: parts[2],
                    credits: parts[3],
                    netChange: parts[4],
                    endBalance: parts[5],
                    flag: parts[6] || '',
                    // Debit Names is in column 7 (parts[7]), Credit Names is in column 8 (parts[8])
                    debitDetails: parts[7] || '',
                    creditDetails: parts[8] || ''
                });
            }
        }
    }

    return transactions;
}

function parseAlerts(lines) {
    const alerts = [];
    let inAlerts = false;

    for (const line of lines) {
        if (line.includes('## 4) Alerts')) {
            inAlerts = true;
            continue;
        }

        if (!inAlerts) continue;
        if (line.includes('##')) break;

        if (line.includes('**NEG')) {
            const dates = line.split(':')[1];
            if (dates) {
                dates.split(',').forEach(date => {
                    const trimmed = date.trim();
                    if (trimmed) {
                        alerts.push({
                            date: trimmed,
                            type: 'NEGATIVE',
                            severity: 'critical'
                        });
                    }
                });
            }
        }

        if (line.includes('**LOW')) {
            const dates = line.split(':')[1];
            if (dates) {
                dates.split(',').forEach(date => {
                    const trimmed = date.trim();
                    if (trimmed) {
                        alerts.push({
                            date: trimmed,
                            type: 'LOW',
                            severity: 'warning'
                        });
                    }
                });
            }
        }
    }

    return alerts;
}

// Calculate alerts from actual transaction balances
function calculateAlertsFromTransactions(transactions) {
    const alerts = [];

    transactions.forEach(trans => {
        const balance = parseFloat(trans.endBalance.replace(/[^0-9.-]/g, ''));

        if (balance < 0) {
            alerts.push({
                date: trans.date,
                balance: trans.endBalance,
                type: 'NEGATIVE',
                severity: 'critical'
            });
        } else if (balance > 0 && balance < 500) {
            alerts.push({
                date: trans.date,
                balance: trans.endBalance,
                type: 'LOW',
                severity: 'warning'
            });
        }
    });

    return alerts;
}

function parseSuggestions(lines) {
    const suggestions = [];
    let inSuggestions = false;

    for (const line of lines) {
        if (line.includes('## 5) Suggestions')) {
            inSuggestions = true;
            continue;
        }

        if (!inSuggestions) continue;
        if (line.includes('##')) break;

        if (line.startsWith('* **Option')) {
            const parts = line.split(':**');
            if (parts.length >= 2) {
                const option = parts[0].replace('* **', '').trim();
                const description = parts[1].trim();
                suggestions.push({
                    option,
                    description
                });
            }
        }
    }

    return suggestions;
}

// Main execution
const inputFile = process.argv[2];
if (!inputFile) {
    console.error('Usage: node convert-forecast-to-json.js <forecast-file.md>');
    process.exit(1);
}

const inputPath = path.resolve(inputFile);
const outputPath = inputPath.replace('.md', '.json');

try {
    const markdown = fs.readFileSync(inputPath, 'utf-8');
    const jsonData = parseForecastMarkdown(markdown);

    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    console.log(`✅ Successfully converted ${inputFile} to JSON`);
    console.log(`📄 Output: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Transactions: ${jsonData.transactions.length}`);
    console.log(`   Alerts: ${jsonData.alerts.length}`);
    console.log(`   Suggestions: ${jsonData.suggestions.length}`);
    console.log(`   Start Balance: $${jsonData.summary.startBalance.toFixed(2)}`);
    console.log(`   End Balance: $${jsonData.summary.endBalance.toFixed(2)}`);
    console.log(`   Lowest Balance: $${jsonData.summary.lowestBalance.toFixed(2)}`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
