module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@/enums/(.*)$': '<rootDir>/src/enums/$1',
    '^@/root/(.*)$': '<rootDir>/src/root/$1',
    '^@/database/(.*)$': '<rootDir>/src/database/$1',
    '^@/migrations/(.*)$': '<rootDir>/src/migrations/$1',
    '^@/helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/templates/(.*)$': '<rootDir>/src/templates/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/test/',
    '.spec.ts',
    '.interface.ts',
    '.dto.ts',
    '.entity.ts',
  ],
};
