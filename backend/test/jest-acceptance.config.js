module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.acceptance.test.js$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testTimeout: 30000,
  bail: 0,
  verbose: true,
  coverageDirectory: '../coverage/acceptance',
  setupFiles: ['./setup-env.js']
};
