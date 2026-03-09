import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		alias: {
			'react-dom/test-utils': 'preact/test-utils',
			react: 'preact/compat',
			'react/jsx-runtime': 'preact/jsx-runtime',
			'react-dom': 'preact/compat',
		},
	},
});
