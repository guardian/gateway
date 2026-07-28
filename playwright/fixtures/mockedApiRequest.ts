/* eslint-disable no-empty-pattern -- needed to setup the mockApi function */
/* eslint-disable react-hooks/rules-of-hooks -- stop eslint from complaining about react hooks in a non react file */
import {
	test as base,
	request as playwrightRequest,
	APIRequestContext,
	BrowserContext,
} from '@playwright/test';
import { mockClientRecaptcha } from '../helpers/network/recaptcha';

type CustomFixtures = {
	mockApi: APIRequestContext;
	context: BrowserContext;
};

export const test = base.extend<CustomFixtures>({
	mockApi: async ({}, use) => {
		const mockApiContext = await playwrightRequest.newContext({
			baseURL: 'http://localhost:9000',
		});
		await use(mockApiContext);
		await mockApiContext.dispose();
	},
	context: async ({ context }, use) => {
		await context.route('**://ophan.theguardian.com/**', (route) =>
			route.fulfill({
				status: 204,
				body: '',
			}),
		);
		await use(context);
	},
	page: async ({ page }, use) => {
		await mockClientRecaptcha(page);
		await use(page);
	},
});
