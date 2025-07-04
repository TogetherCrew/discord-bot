/* eslint-env node */
module.exports = {
    testPathIgnorePatterns: ['/__tests__/fixtures/', '/__tests__/utils/'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    collectCoverage: true,
    testEnvironment: 'node',
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    coverageThreshold: {
        global: {
            branches: 8,
            functions: 8,
            lines: 8,
            statements: 8,
        },
    },
}
