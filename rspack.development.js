/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const baseConfig = require('./rspack.config');
const { mergeWithRules } = require('webpack-merge');

/**
 * Adds caching to the production webpack config for faster dev builds.
 * ForkTsCheckerWebpackPlugin provides type checking on top of webpack watch.
 */
const common = {
	mode: 'development',
};

const serverConfig = {
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				use: [
					{
						loader: 'builtin:swc-loader',
						options: {
							cacheCompression: false,
							cacheDirectory: true,
						},
					},
				],
			},
		],
	},
};

const browserConfig = (isLegacy = false) => ({
	module: {
		rules: [
			{
				test: /\.(m?)(j|t)s(x?)/,
				use: [
					{
						loader: 'builtin:swc-loader',
						options: {
							cacheCompression: false,
							cacheDirectory: true,
						},
					},
				],
			},
		],
	},
	plugins: [
		...(isLegacy
			? []
			: [
					new ForkTsCheckerWebpackPlugin({
						async: true,
					}),
				]),
		new ForkTsCheckerNotifierWebpackPlugin({
			excludeWarnings: true,
			skipFirstNotification: true,
		}),
	],
});

const baseServerConfig = baseConfig[0];
const baseBrowserLegacyConfig = baseConfig[1];
const baseBrowserConfig = baseConfig[2];

const merge = mergeWithRules({
	module: {
		rules: {
			test: 'match',
			use: {
				loader: 'match',
				options: 'merge',
			},
		},
	},
});

module.exports = [
	merge(baseServerConfig, common, serverConfig),
	merge(baseBrowserLegacyConfig, common, browserConfig(true)),
	merge(baseBrowserConfig, common, browserConfig(false)),
];
