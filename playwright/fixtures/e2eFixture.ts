/* eslint-disable no-empty-pattern -- needed to setup the mockApi function */
/* eslint-disable react-hooks/rules-of-hooks -- stop eslint from complaining about react hooks in a non react file */
import { test as base, Page } from '@playwright/test';

type CustomFixtures = {
	page: Page;
};

export const test = base.extend<CustomFixtures>({
	page: async ({ page }, use) => {
		await page.route('**://ophan.theguardian.com/**', (route) => route.abort());
		await use(page);
	},
});
