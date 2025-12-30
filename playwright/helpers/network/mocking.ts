/* eslint-disable functional/immutable-data -- only used by playwright */
import { Page, Route } from '@playwright/test';

interface MockResponse {
	status: number;
	body?: unknown;
	headers?: Record<string, string>;
}

const activeRoutes: Map<Page, Route[]> = new Map();

// Mock all requests that match the given URL pattern.
//
// @param page - Playwright Page object
// @param pattern - url pattern to match
//
// @example
// await mockRequestPattern(page, '**/api/v1/sessions/me', {
//   status: 200,
//   body: { id: 'test' }
// });

export async function mockRequestPattern(
	page: Page,
	pattern: string,
	response: MockResponse,
): Promise<void> {
	await page.route(pattern, async (route: Route) => {
		await route.fulfill({
			status: response.status,
			contentType: 'application/json',
			headers: response.headers,
			body: response.body ? JSON.stringify(response.body) : undefined,
		});

		const routes = [...(activeRoutes.get(page) || []), route];

		activeRoutes.set(page, routes);
	});
}

/**
 * Mock the next request to any URL with the specified response.
 *
 * @param page - Playwright Page object
 *
 * @example
 * await mockNextRequest(page, {
 *   status: 200,
 *   body: { success: true }
 * });
 */
export async function mockNextRequest(
	page: Page,
	response: MockResponse,
): Promise<void> {
	await page.route('**/*', async (route: Route) => {
		await route.fulfill({
			status: response.status,
			contentType: 'application/json',
			headers: response.headers,
			body: response.body ? JSON.stringify(response.body) : undefined,
		});

		// Immediately unroute afterwards
		await page.unroute('**/*');

		const routes = [...(activeRoutes.get(page) || []), route];

		activeRoutes.set(page, routes);
	});
}

/**
 * Clear all active mocks on the page.
 *
 * @param page - Playwright Page object
 *
 * @example
 * await clearAllMocks(page);
 */
export async function clearAllMocks(page: Page): Promise<void> {
	await page.unrouteAll({ behavior: 'wait' });
	activeRoutes.delete(page);
}

/**
 * Mock a specific API endpoint with a response.
 *
 * @param page - Playwright Page object
 * @param endpoint - API endpoint path
 *
 * @example
 * await mockApiEndpoint(page, '/api/v1/users', {
 *   status: 200,
 *   body: [{ id: 1, name: 'Test User' }]
 * });
 */
export async function mockApiEndpoint(
	page: Page,
	endpoint: string,
	response: MockResponse,
): Promise<void> {
	const pattern = `**${endpoint}`;
	await mockRequestPattern(page, pattern, response);
}
