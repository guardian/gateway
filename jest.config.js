/* eslint-disable functional/immutable-data */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest config
const config = require('./.swcrc.config');

module.exports = {
	testEnvironment: 'node',
	clearMocks: false,
	moduleNameMapper: {
		'@/([^\\.]*)$': '<rootDir>/src/$1',
		'\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/__mocks__/fileMock.js',
	},
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/playwright/',
		'utils',
		'<rootDir>/src/server/lib/__tests__/sharedConfig.ts',
		// TODO: Shared Jest config between Gateway and CDK? Monorepo?
		'cdk',
	],
	transformIgnorePatterns: [
		// Don't try to transform any node_modules except the packages we know ship ESM
		// and are imported by our test graph.
		// Since updating to Jest 30 trying to import these dependencies has resulted in
		// unsupported ESM getting imported instead of CJS. Possibly because due to
		// some siginificant changes in how Jest handles ESM under the hood?
		// See:  https://jestjs.io/docs/upgrading-to-jest30#esm-module-support-and-internal-restructuring
		'/node_modules/.pnpm/(?!(preact|@testing-library|openid-client|oauth4webapi|jose))',
	],
	transform: {
		'^.+\\.(ts|tsx|js|jsx|mjs)$': [
			'@swc/jest',
			{
				...config.options,
			},
		],
	},
};
