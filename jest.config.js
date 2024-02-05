/* eslint-env node */
module.exports = {
  testPathIgnorePatterns: ['/__tests__/fixtures/', '/__tests__/utils/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  collectCoverage: true,
  testEnvironment: 'node',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 18,
      lines: 13,
      statements: 13
    }
  }
}