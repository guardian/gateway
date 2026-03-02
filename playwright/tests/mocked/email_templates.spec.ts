import { test, expect } from '@playwright/test';

test.describe('Email template generation', () => {
	test('renders an accidental email', async ({ request }) => {
		const response = await request.get('/email/accidental-email');
		const body = await response.json();
		expect(body.plain).toContain('This email has been triggered accidentally.');
		expect(body.html).toContain('This email has been triggered accidentally.');
	});

	test('returns a 404 error for an invalid template name', async ({
		request,
	}) => {
		const response = await request.get('/email/invalid-template');
		expect(response.status()).toBe(404);
		await expect(response.json()).rejects.toThrow();
	});
});
