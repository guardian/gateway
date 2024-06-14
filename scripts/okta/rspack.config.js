/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const deepmerge = require('deepmerge');
const sharedLoader = require('../../.swcrc.config');
const rspack = require('@rspack/core');

module.exports = {
	name: 'okta-login',
	resolve: {
		extensions: ['.ts', '.js'],
	},
	entry: path.resolve(__dirname, 'okta-login.ts'),
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					deepmerge(sharedLoader, {
						options: {
							env: {
								targets: {
									// min browser versions
									ie: '11',
								},
							},
						},
					}),
				],
			},
		],
	},
	output: {
		filename: 'okta-login.js',
		path: __dirname,
	},
	target: ['web', 'es5'],
	optimization: {
		minimizer: [new rspack.SwcJsMinimizerRspackPlugin()],
	},
};
