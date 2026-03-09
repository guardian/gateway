import path from 'path';
import { fileURLToPath } from 'url';
import { neutral } from '@guardian/source/foundations';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

const config = {
	stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: ['@storybook/addon-themes', '@chromatic-com/storybook'],
	previewHead: (/** @type {any} */ head) => `
    ${head}
    <style>
      body {
        color: ${neutral[7]};
      }
    </style>
  `,
	viteFinal: async (config) => {
		const { mergeConfig } = await import('vite');

		return mergeConfig(config, {
			esbuild: {
				jsx: 'automatic',
				jsxImportSource: '@emotion/react',
			},
			optimizeDeps: {
				include: ['preact', 'preact/hooks', 'preact/compat'],
			},
			resolve: {
				dedupe: ['preact'],
				alias: {
					'@': path.join(storybookDir, '../src'),
					mjml: 'mjml-browser',
					react: 'preact/compat',
					'react/jsx-runtime': 'preact/jsx-runtime',
					'react-dom/test-utils': 'preact/test-utils',
					'react-dom': 'preact/compat',
				},
			},
		});
	},
	typescript: {
		reactDocgen: 'react-docgen-typescript',
		reactDocgenTypescriptOptions: {
			tsconfigPath: '.storybook/tsconfig.json',
		},
	},
	framework: {
		name: '@storybook/preact-vite',
		options: {
			builder: {
				viteConfigPath: '.storybook/vite.config.ts',
			},
		},
	},
	docs: {
		autodocs: false,
	},
};
export default config;
