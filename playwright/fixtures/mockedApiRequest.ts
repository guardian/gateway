/* eslint-disable no-empty-pattern -- needed to setup the mockApi function */
/* eslint-disable react-hooks/rules-of-hooks -- stop eslint from complaining about react hooks in a non react file */
import {
	test as base,
	request as playwrightRequest,
	APIRequestContext,
	Page,
} from '@playwright/test';

type CustomFixtures = {
	mockApi: APIRequestContext;
	page: Page;
};

export const test = base.extend<CustomFixtures>({
	mockApi: async ({}, use) => {
		const mockApiContext = await playwrightRequest.newContext({
			baseURL: 'http://localhost:9000',
		});
		await use(mockApiContext);
		await mockApiContext.dispose();
	},
	page: async ({ page }, use) => {
		await page.route('**://ophan.theguardian.com/**', (route) => route.abort());
		await use(page);
	},
});
