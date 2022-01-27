/* eslint-disable functional/immutable-data */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: false,
  moduleNameMapper: {
    '@/([^\\.]*)$': '<rootDir>/src/$1',
    '^react$': 'preact/compat',
    '^react-dom/test-utils$': 'preact/test-utils',
    '^react-dom$': 'preact/compat',
    '^react/jsx-runtime$': 'preact/jsx-runtime',
  },
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/node_modules/',
    'utils',
  ],

  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
