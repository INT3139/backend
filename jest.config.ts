import type { Config } from 'jest'

const config: Config = {
  preset:              'ts-jest',
  testEnvironment:     'node',
  roots:               ['<rootDir>/tests'],
  testMatch:           ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageReporters:   ['text', 'lcov'],
  setupFiles:          [],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout:         10000,
}

export default config
