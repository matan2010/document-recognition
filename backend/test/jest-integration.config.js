const baseConfig = require('./jest-e2e.json');

module.exports = {
  ...baseConfig,
  testRegex: '.integration.test.js$',
  rootDir: '../',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
};
