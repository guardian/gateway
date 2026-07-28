import { Page } from '@playwright/test';

/**
 * Loads a page and waits for the specified event to occur.
 * By default, it waits for the 'load' event, which means the page has fully loaded.
 * You can specify 'domcontentloaded' to wait for the DOM to be ready,
 * or 'networkidle' to wait until there are no more network connections for at least 500 ms.
 *
 * @param {Page} page
 * @param {string} url
 * @param {('load' | 'domcontentloaded' | 'networkidle')} [waitUntil='load']
 */
export const loadPage = async (
	page: Page,
	url: string,
	waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
) => {
	await page.goto(url, { waitUntil });
};
