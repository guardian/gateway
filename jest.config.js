/* eslint-disable functional/immutable-data */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: false,

  moduleNameMapper: {
    '@/([^\\.]*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/cypress/', '<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
