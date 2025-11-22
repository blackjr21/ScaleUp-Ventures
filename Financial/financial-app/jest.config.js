module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/e2e/**/*.spec.js',
    '**/structure.test.js'
  ],
  verbose: true,
  testTimeout: 10000,
};
