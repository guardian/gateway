import {
	test as base,
	request as playwrightRequest,
	APIRequestContext,
} from '@playwright/test';

type CustomFixtures = {
	mockApi: APIRequestContext;
};

export const test = base.extend<CustomFixtures>({
	mockApi: async ({}, use) => {
		const mockApiContext = await playwrightRequest.newContext({
			baseURL: 'http://localhost:9000',
		});
		await use(mockApiContext);
		await mockApiContext.dispose();
	},
});
