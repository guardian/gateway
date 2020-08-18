module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: false,
  moduleNameMapper: {
    '@/([^\\.]*)$': '<rootDir>/src/$1',
    '^@guardian/src-foundations/(.*)(?<!cjs)$':
      '@guardian/src-foundations/$1/cjs',
  },
  testPathIgnorePatterns: ['<rootDir>/cypress/', '<rootDir>/node_modules/'],
};
