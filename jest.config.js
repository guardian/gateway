/* eslint-disable functional/immutable-data */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: false,
  moduleNameMapper: {
    '@/([^\\.]*)$': '<rootDir>/src/$1',
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
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
