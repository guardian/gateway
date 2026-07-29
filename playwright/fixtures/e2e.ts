/* eslint-disable react-hooks/rules-of-hooks -- Playwright calls this fixture callback with a use function */
import { test as base } from '@playwright/test';
import { mockClientRecaptcha } from '../helpers/network/recaptcha';

export * from '@playwright/test';

export const test = base.extend({
	page: async ({ page }, use) => {
		await mockClientRecaptcha(page);
		await use(page);
	},
});
