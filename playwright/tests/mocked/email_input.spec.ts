import { test, expect } from '@playwright/test';

test.describe('Email input component', () => {
	test('should show an error message when nothing submitted', async ({
		page,
	}) => {
		await page.goto('/register/email');
		await page.locator('[data-cy=main-form-submit-button]').click();
		await expect(page.getByText('Please enter your email.')).toBeVisible();
	});

	test('should show an error message when an invalid email is submitted', async ({
		page,
	}) => {
		await page.goto('/register/email');
		await page.locator('input[name="email"]').fill('invalid.email.com');
		await page.locator('[data-cy=main-form-submit-button]').click();
		await expect(
			page.getByText('Please enter a valid email format.'),
		).toBeVisible();
	});

	test('does not show an error message when a valid email is submitted', async ({
		page,
	}) => {
		await page.goto('/register/email');
		await page.locator('input[name="email"]').fill('test@email.com');
		await page.locator('[data-cy=main-form-submit-button]').focus();
		await expect(
			page.getByText('Please enter a valid email format.'),
		).not.toBeVisible();
		await expect(page.getByText('Please enter your email.')).not.toBeVisible();
	});

	test('should correct error once a valid email is submitted', async ({
		page,
	}) => {
		await page.goto('/register/email');
		await page.locator('input[name="email"]').fill('invalid.email.com');
		await page.locator('[data-cy=main-form-submit-button]').click();
		await expect(
			page.getByText('Please enter a valid email format.'),
		).toBeVisible();
		await page.locator('input[name="email"]').fill('test@email.com');
		await page.locator('[data-cy=main-form-submit-button]').focus();
		await expect(
			page.getByText('Please enter a valid email format.'),
		).not.toBeVisible();
		await expect(page.getByText('Please enter your email.')).not.toBeVisible();
	});
});
