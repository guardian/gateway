/* eslint-disable functional/immutable-data */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: false,
  moduleNameMapper: {
    '@/([^\\.]*)$': '<rootDir>/src/$1',
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    // need to alias preact to itself in order to use the cjs version, same with testing-library
    '^preact(/(.*)|$)': 'preact$1',
    '^@testing-library/react$': '@testing-library/preact',
    '^@testing-library/react-hooks$': '@testing-library/preact-hooks',
    '^@testing-library/preact$': '@testing-library/preact',
    '^@testing-library/preact-hooks$': '@testing-library/preact-hooks',
  },
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/node_modules/',
    'utils',
    '<rootDir>/src/server/lib/__tests__/sharedConfig.ts',
  ],
  transform: {
    '<regex_match_files>': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
};
