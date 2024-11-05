import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	// setup knip to warn by default so that ci doesn't fail if there are any issues
	// but still allows us to see the issues and fix them
	rules: {
		binaries: 'warn',
		classMembers: 'warn',
		dependencies: 'warn',
		devDependencies: 'warn',
		duplicates: 'warn',
		enumMembers: 'warn',
		exports: 'warn',
		files: 'warn',
		nsExports: 'warn',
		nsTypes: 'warn',
		optionalPeerDependencies: 'warn',
		types: 'warn',
		unlisted: 'warn',
		unresolved: 'warn',
	},
	// all possible entry points to everything in the project,
	// e.g. gateway client, gateway server, cdk, storybook, webpack etc.
	entry: [
		'.storybook/**/*.{js,ts}',
		'cdk/bin/cdk.ts',
		'cdk/jest.setup.js',
		'cypress/**/*.{js,ts}',
		'scripts/**/*.{js,ts}',
		'src/client/static/index.tsx',
		'src/server/index.ts',
		'webpack.{config|development}.js',
		'util/mock-server.js',
	],
	// all possible file types we want to check
	project: ['**/*.{js,ts,tsx}'],
	// ignore specific files that we want to keep
	ignore: [
		'src/client/components/ABTestDemo.tsx',
		'src/shared/model/experiments/tests/example-test.ts',
		'webpack.development.js',
		'src/email/templates/renderedTemplates.ts',
	],
	// ignore specific binaries/commands that we want to keep
	ignoreBinaries: ['only-allow'],
	// ignore specific dependencies that we want to keep
	// usually used by webpack, cdk, storybook etc. that knip can't resolve
	ignoreDependencies: [
		'@guardian/cdk',
		'@swc/plugin-emotion',
		'aws-cdk-lib',
		'fork-ts-checker-notifier-webpack-plugin',
		'fork-ts-checker-webpack-plugin',
		'imagemin',
		'jest-environment-jsdom',
		'mjml-browser',
		'preact-render-to-string',
		'react-docgen-typescript-plugin',
		'sharp',
		'source-map-support',
	],
};

export default config;
