import { defineConfig } from 'cypress';

export default defineConfig({
	video: false,
	chromeWebSecurity: false,
	defaultCommandTimeout: 8000,
	responseTimeout: 8000,
	requestTimeout: 8000,
	env: {
		mockingEndpoint: 'localhost:9000/mock',
	},
	retries: { runMode: 2, openMode: 0 },
	e2e: {
		baseUrl: 'https://profile.thegulocal.com',
		specPattern: 'cypress/integration/**/*.cy.ts',
		excludeSpecPattern: '*.shared.ts',
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		setupNodeEvents(on, config) {
			on('task', {
				log(message) {
					// eslint-disable-next-line no-console
					console.log(`CYPRESS: ${message}`);

					return null;
				},
			});
		},
	},
});
