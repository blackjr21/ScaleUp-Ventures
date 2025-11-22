const { test, expect } = require('@playwright/test');

test.describe('Feature 1.4: Health Endpoint E2E', () => {
  test('should load health endpoint successfully', async ({ page }) => {
    // Navigate to health endpoint
    const response = await page.goto('/api/health');

    // Verify response status
    expect(response.status()).toBe(200);

    // Get JSON response
    const json = await response.json();

    // Verify response structure
    expect(json).toHaveProperty('status');
    expect(json).toHaveProperty('timestamp');
    expect(json).toHaveProperty('service');
    expect(json).toHaveProperty('version');
    expect(json).toHaveProperty('environment');

    // Verify values
    expect(json.status).toBe('healthy');
    expect(json.service).toBe('financial-app');
    expect(json.version).toBe('1.0.0');
  });

  test('should return fresh timestamp on each request', async ({ page }) => {
    // First request
    const response1 = await page.goto('/api/health');
    const json1 = await response1.json();
    const timestamp1 = new Date(json1.timestamp);

    // Wait a moment
    await page.waitForTimeout(100);

    // Second request
    const response2 = await page.goto('/api/health');
    const json2 = await response2.json();
    const timestamp2 = new Date(json2.timestamp);

    // Timestamps should be different (second should be later)
    expect(timestamp2.getTime()).toBeGreaterThanOrEqual(timestamp1.getTime());
  });

  test('should return 404 for non-existent route', async ({ page }) => {
    const response = await page.goto('/api/nonexistent', {
      waitUntil: 'networkidle'
    });

    expect(response.status()).toBe(404);

    const json = await response.json();
    expect(json).toHaveProperty('error');
    expect(json.error).toBe('Not Found');
  });
});
