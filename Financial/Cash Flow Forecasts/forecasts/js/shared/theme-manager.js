/**
 * ThemeManager - Manages light/dark theme across all pages
 * Persists preference in localStorage
 */
class ThemeManager {
  constructor() {
    this.storageKey = 'cashflow-theme';
    this.currentTheme = this.loadTheme();
    this.applyTheme();
    this.setupToggleButton();
  }

  /**
   * Load theme from localStorage
   * @returns {string} 'light' or 'dark'
   */
  loadTheme() {
    const saved = localStorage.getItem(this.storageKey);
    return saved || 'light';
  }

  /**
   * Apply current theme to body
   */
  applyTheme() {
    if (this.currentTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(this.storageKey, this.currentTheme);
    this.applyTheme();
    this.updateToggleButton();
  }

  /**
   * Setup event listener for toggle button
   */
  setupToggleButton() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
      this.updateToggleButton();
    }
  }

  /**
   * Update toggle button text based on current theme
   */
  updateToggleButton() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
      toggleBtn.setAttribute('aria-label',
        `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} mode`);
    }
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.themeManager = new ThemeManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
