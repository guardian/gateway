/* eslint-disable functional/immutable-data */
// only used by storybook
module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				shippedProposals: true,
				useBuiltIns: 'usage',
				corejs: '3',
				modules: false,
				targets: { chrome: '100' },
			},
		],
		'@babel/preset-typescript',
		'@babel/preset-react',
		'@emotion/babel-preset-css-prop',
	],
	plugins: [],
};
