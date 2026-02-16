import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './playwright/tests',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI
		? [['html'], ['list'], ['github']]
		: [['html'], ['list']],
	expect: {
		timeout: 30000,
	},
	use: {
		baseURL: 'https://profile.thegulocal.com',
		ignoreHTTPSErrors: true,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 30000,
		navigationTimeout: 30000,
	},

	timeout: 30000,

	projects: [
		{
			name: 'mocked',
			testMatch: /.*\/mocked\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
			},
		},
		{
			name: 'e2e',
			testMatch: /.*\/e2e\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],
});
