// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false, // Run tests sequentially for better visibility
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run one test at a time
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'] // Console output
  ],

  use: {
    baseURL: 'http://localhost:8000',
    headless: false, // VISIBLE BROWSER - required for visual verification
    screenshot: 'on', // ALWAYS take screenshots
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Server is already running on port 8000
  // Tests assume server is started manually
});
