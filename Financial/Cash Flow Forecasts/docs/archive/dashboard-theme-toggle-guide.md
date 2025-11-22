# Dashboard Theme Toggle Guide

## Overview

The Cash Flow Dashboard now includes a dynamic theme toggle button that allows users to switch between light and dark modes with a single click. The theme preference is automatically saved and persists across browser sessions.

## Features

### 🌓 Theme Toggle Button

**Location:** Top-right corner of the dashboard header

**Appearance:**
- **Light Mode:** Shows "🌙 Dark" button (moon icon)
- **Dark Mode:** Shows "☀️ Light" button (sun icon)

**Interaction:**
- Click to instantly switch between themes
- Smooth color transitions (0.3s)
- Hover effect with subtle lift and border highlight

### 💾 Persistent Preferences

The dashboard uses `localStorage` to remember your theme choice:
- Your preference is saved automatically when you toggle
- The saved theme loads automatically when you return
- Works across browser tabs and sessions

### 🎨 Color Schemes

#### Light Mode
- **Background:** White (#ffffff) and light gray (#f8f9fa)
- **Text:** Dark charcoal (#1a1a1a) and gray (#6c757d)
- **Cards:** White with subtle shadows
- **Best for:** Daytime use, bright environments

#### Dark Mode
- **Background:** Deep slate (#0f172a) and slate blue (#1e293b)
- **Text:** Light slate (#f1f5f9) and muted blue (#94a3b8)
- **Cards:** Dark slate with enhanced shadows
- **Best for:** Nighttime use, low-light environments, reduced eye strain

## File Structure

```
forecasts/
├── dashboard.html           # Main dashboard with theme toggle (RECOMMENDED)
├── dashboard-light.html     # Forced light mode (static)
└── dashboard-dark.html      # Forced dark mode (static)
```

### Which File Should You Use?

**Recommended: `dashboard.html`**
- Includes the theme toggle button
- Remembers your preference
- Best user experience
- Full feature set

**Alternative: Static versions**
- `dashboard-light.html` - Always light, no toggle
- `dashboard-dark.html` - Always dark, no toggle
- Use these for screenshots or testing specific themes

## Testing

### Automated Tests

We have comprehensive Playwright tests to ensure the theme toggle works correctly:

```bash
# Run all dashboard visual tests (includes theme toggle)
npm test

# Run theme toggle specific tests
npm run test:theme
```

### Test Coverage

✅ **8 Theme Toggle Tests:**
1. Toggle button visibility
2. Initial light mode rendering
3. Initial theme color verification
4. Toggle to dark mode functionality
5. Button icon/text updates correctly
6. Toggle back to light mode functionality
7. localStorage persistence
8. Theme persistence after page reload

✅ **Visual Regression Tests:**
- Full page screenshots in both modes
- Component-level screenshots (header, hero cards, alerts, charts, tables)
- Mobile responsive layout (375px width)
- Color contrast verification

### Test Results

All tests passing ✅

**Screenshots Location:** `tests/screenshots/`
- Light mode screenshots
- Dark mode screenshots
- Theme toggle progression screenshots
- Mobile responsive screenshots

## Technical Implementation

### CSS Architecture

The theme system uses CSS custom properties (variables) for dynamic theming:

```css
:root {
  /* Light mode colors (default) */
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  /* ... other variables */
}

body.dark-theme {
  /* Dark mode colors (applied when class is present) */
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  /* ... other variables */
}
```

All UI components reference these variables, so changing the theme is as simple as toggling the `dark-theme` class on the body element.

### JavaScript Functionality

```javascript
// Theme initialization on page load
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
  body.classList.add('dark-theme');
}

// Toggle handler
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  // Update button icon and text
  // Save preference to localStorage
});
```

## Browser Compatibility

✅ **Fully Supported:**
- Chrome/Edge (90+)
- Firefox (88+)
- Safari (14+)
- Opera (76+)

The dashboard also respects your system's dark mode preference if you haven't manually selected a theme yet.

## Accessibility

- **Keyboard Accessible:** Toggle button can be activated with Enter/Space
- **ARIA Label:** Button includes `aria-label="Toggle dark mode"`
- **High Contrast:** Both themes meet WCAG AA contrast requirements
- **Focus Indicators:** Clear focus states for keyboard navigation

## Future Enhancements

Potential improvements for future versions:

- [ ] Auto-switch based on time of day
- [ ] Additional theme options (high contrast, sepia, etc.)
- [ ] Smooth transition animations for chart elements
- [ ] Theme preview in settings
- [ ] Keyboard shortcut (e.g., Ctrl+Shift+D)

## Troubleshooting

### Theme doesn't persist after reload
**Solution:** Check if localStorage is enabled in your browser. Some privacy modes block localStorage.

### Button not visible
**Solution:** Ensure you're using `dashboard.html` (not the static light/dark versions)

### Colors look wrong
**Solution:** Clear your browser cache and reload the page

### Toggle doesn't respond
**Solution:** Check browser console for JavaScript errors. Ensure Chart.js CDN is accessible.

## Dashboard Agent Integration

The dashboard is updated by the **dashboard-updater** agent. When running financial forecasts, the agent will:

1. Update transaction data
2. Recalculate summary statistics
3. Update alerts and warnings
4. Preserve the theme toggle functionality

The theme system is built into the HTML template, so all dashboard updates maintain the toggle feature.

---

**Created:** November 19, 2025
**Version:** 1.0
**Tested:** Playwright visual regression suite - All tests passing ✅
