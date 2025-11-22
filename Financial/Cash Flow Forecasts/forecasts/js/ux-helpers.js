/**
 * UX Helper Functions for Cash Flow Forecasting System
 * Provides number formatting and timestamp utilities
 */

/**
 * Format currency values with proper $ sign and commas
 * @param {number|string} value - The value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;

    if (isNaN(num)) return value;

    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);

    return formatted;
}

/**
 * Format percentage values
 * @param {number} value - The decimal value (e.g., 0.15 for 15%)
 * @param {number} decimals - Number of decimal places (default 1)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 1) {
    if (isNaN(value)) return value;
    return (value * 100).toFixed(decimals) + '%';
}

/**
 * Get current timestamp in readable format
 * @returns {string} Formatted timestamp
 */
function getCurrentTimestamp() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleString('en-US', options);
}

/**
 * Add or update "Last updated" timestamp on a page
 * @param {string} containerId - ID of container to add timestamp to
 */
function updateLastUpdatedTimestamp(containerId = 'main') {
    const container = document.getElementById(containerId) || document.querySelector('main') || document.body;

    let timestamp = container.querySelector('.last-updated');

    if (!timestamp) {
        timestamp = document.createElement('div');
        timestamp.className = 'last-updated';
        container.appendChild(timestamp);
    }

    timestamp.textContent = `Last updated: ${getCurrentTimestamp()}`;
}

/**
 * Format all currency values in a table
 * Looks for cells with class 'currency' or containing $ symbol
 */
function formatTableCurrencies() {
    document.querySelectorAll('td, th').forEach(cell => {
        const text = cell.textContent.trim();

        // Skip if already formatted with commas
        if (text.includes(',') && text.includes('$')) return;

        // Check if cell contains currency or has currency class
        if (cell.classList.contains('currency') || (text.startsWith('$') || text.startsWith('-$'))) {
            const value = text.replace(/[$,]/g, '');
            if (!isNaN(parseFloat(value))) {
                cell.textContent = formatCurrency(value);
            }
        }
    });
}

/**
 * Initialize UX helpers on page load
 */
function initializeUXHelpers() {
    // Format any existing currency values
    formatTableCurrencies();

    // Add timestamp to pages
    updateLastUpdatedTimestamp();

    console.log('[UX Helpers] Initialized successfully');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUXHelpers);
} else {
    initializeUXHelpers();
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatPercentage,
        getCurrentTimestamp,
        updateLastUpdatedTimestamp,
        formatTableCurrencies,
        initializeUXHelpers
    };
}
