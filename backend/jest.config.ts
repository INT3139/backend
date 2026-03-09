import type { Config } from 'jest'

const config: Config = {
  preset:              'ts-jest',
  testEnvironment:     'node',
  roots:               ['<rootDir>/tests'],
  testMatch:           ['**/*.test.ts'],
  moduleNameMapper: {
    '^@config/(.*)$':   '<rootDir>/src/config/$1',
    '^@core/(.*)$':     '<rootDir>/src/core/$1',
    '^@modules/(.*)$':  '<rootDir>/src/modules/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$':    '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageReporters:   ['text', 'lcov'],
  setupFilesAfterEnv: [],
}

export default config
