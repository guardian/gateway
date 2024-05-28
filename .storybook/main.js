const path = require('path');
const { neutral } = require('@guardian/source/foundations');
const deepmerge = require('deepmerge');
const sharedLoader = require('../.swcrc.config');
const config = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-webpack5-compiler-babel',
		'@storybook/addon-styling-webpack',
		'@storybook/addon-themes',
	],
	previewHead: (head) => `
    ${head}
    <style>
      body {
        color: ${neutral[7]};
      }
    </style>
  `,
	webpackFinal: async (config) => {
		// Add the @client alias to prevent imports using it from failing
		// Nb. __dirname is the current working directory, so .storybook in this case
		config.resolve.alias = {
			...config.resolve.alias,
			'@': path.join(__dirname, '../src'),
			react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat',
			// Must be below test-utils
			'react/jsx-runtime': 'preact/jsx-runtime',
			mjml: 'mjml-browser',
			// We stub these libraries required by mjml because Storybook cannot run these on the client side.
			'uglify-js': false,
			'clean-css': false,
		};

		// transpile certain modules so we can get them to work with ie11 storybook
		const transpileModules = {
			include: [/node_modules[\\\/]@guardian/],
			test: /\.(m?)(j|t)s(x?)/,
			use: [
				deepmerge(sharedLoader, {
					options: {
						env: {
							targets: {
								chrome: '100',
							},
						},
					},
				}),
			],
		};

		// Return the altered config
		return {
			...config,
			module: {
				...config.module,
				rules: [...config.module.rules, transpileModules],
			},
			target: ['web'],
		};
	},
	typescript: {
		reactDocgen: 'react-docgen-typescript-plugin',
	},
	framework: {
		name: '@storybook/react-webpack5',
		options: {},
	},
	docs: {
		autodocs: false,
	},
};
export default config;
