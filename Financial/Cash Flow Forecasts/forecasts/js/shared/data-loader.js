/**
 * DataLoader - Fetches cash flow data markdown file
 */
class DataLoader {
  constructor() {
    this.dataPath = '../data/cash-flow-data.md';
    this.cachedData = null;
  }

  /**
   * Fetch cash-flow-data.md content
   * @returns {Promise<string>} Markdown content
   */
  async fetchCashFlowData() {
    // Return cached if available
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const response = await fetch(this.dataPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch cash flow data: ${response.status} ${response.statusText}`);
      }

      this.cachedData = await response.text();
      return this.cachedData;

    } catch (error) {
      console.error('DataLoader error:', error);
      throw new Error(`Cannot load cash flow data: ${error.message}`);
    }
  }

  /**
   * Clear cache (useful for testing or forcing reload)
   */
  clearCache() {
    this.cachedData = null;
  }
}

// Export
if (typeof window !== 'undefined') {
  window.DataLoader = DataLoader;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}
