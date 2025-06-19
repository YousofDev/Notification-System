import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  testTimeout: 90000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@consumers/(.*)$': '<rootDir>/src/consumers/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@templates/(.*)$': '<rootDir>/src/templates/$1',
    '^@validators/(.*)$': '<rootDir>/src/validators/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  passWithNoTests: true,
};

export default config;
