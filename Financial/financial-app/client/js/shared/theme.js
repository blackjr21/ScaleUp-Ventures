/**
 * Theme Manager
 * Handles dark/light theme toggling with localStorage persistence
 */

function initTheme() {
  // For now, just use localStorage (will sync to backend in Feature 5.6)
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeIcon('☀️');
  } else {
    document.body.classList.remove('dark-theme');
    updateThemeIcon('🌙');
  }
}

function updateThemeIcon(icon) {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = icon;
  }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initTheme);

// Export for use in other scripts
window.ThemeManager = {
  initTheme,
  toggleTheme,
  applyTheme
};
