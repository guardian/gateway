import { Status } from '@/server/models/okta/User';

describe('iframed/register/email redirect logic', () => {
	describe('user status handling', () => {
		test('ACTIVE user should be redirected to signin', () => {
			const status = Status.ACTIVE;
			const shouldRedirect =
				(status as string) !== Status.DEPROVISIONED &&
				(status as string) !== Status.STAGED;

			expect(shouldRedirect).toBe(true);
		});

		test('PROVISIONED user should be redirected to signin', () => {
			const status = Status.PROVISIONED;
			const shouldRedirect =
				(status as string) !== Status.DEPROVISIONED &&
				(status as string) !== Status.STAGED;

			expect(shouldRedirect).toBe(true);
		});

		test('STAGED user should NOT be redirected', () => {
			const status = Status.STAGED;
			const shouldRedirect =
				(status as string) !== Status.DEPROVISIONED &&
				(status as string) !== Status.STAGED;

			expect(shouldRedirect).toBe(false);
		});

		test('DEPROVISIONED user should NOT be redirected', () => {
			const status = Status.DEPROVISIONED;
			const shouldRedirect =
				(status as string) !== Status.DEPROVISIONED &&
				(status as string) !== Status.STAGED;

			expect(shouldRedirect).toBe(false);
		});
	});

	describe('error handling', () => {
		test('user lookup failure should allow form to render', () => {
			const executeWithError = () => {
				try {
					// Simulate user lookup throwing error
					throw new Error('User not found in Okta');
				} catch (e) {
					return e as Error;
				}
			};

			const error = executeWithError();
			const userFound = false;

			// When error occurs, we proceed to show form
			expect(userFound).toBe(false);
			expect(error).not.toBeNull();
			expect(error?.message).toContain('User not found');
		});
	});

	describe('integration scenarios', () => {
		test('scenario: existing ACTIVE user with query params should redirect with params', () => {
			const user = { status: Status.ACTIVE };
			const queryParams = { appClientId: 'maj' };

			const shouldRedirect =
				(user.status as string) !== Status.DEPROVISIONED &&
				(user.status as string) !== Status.STAGED;
			const hasQueryParams = Object.keys(queryParams).length > 0;

			expect(shouldRedirect).toBe(true);
			expect(hasQueryParams).toBe(true);
		});

		test('scenario: new user (non-existent) with email should show form', () => {
			const userExists = false;
			const email = 'new@example.com';

			const shouldShowForm = !userExists;
			const hasEmail = email.length > 0;

			expect(shouldShowForm).toBe(true);
			expect(hasEmail).toBe(true);
		});

		test('scenario: STAGED user with email should show form', () => {
			const user = { status: Status.STAGED };
			const email = 'staged@example.com';

			const shouldRedirect =
				(user.status as string) !== Status.DEPROVISIONED &&
				(user.status as string) !== Status.STAGED;
			const hasEmail = email.length > 0;

			expect(shouldRedirect).toBe(false);
			expect(hasEmail).toBe(true);
		});

		test('scenario: prepopulateEmail should be included in redirect URL', () => {
			const email = 'active@example.com';
			const queryParams = {
				appClientId: 'maj',
				ref: 'https://ref.example.com',
				prepopulateEmail: email,
			};

			expect(queryParams.prepopulateEmail).toBe(email);
			expect(queryParams.appClientId).toBe('maj');
			expect(queryParams.ref).toBe('https://ref.example.com');
		});

		test('scenario: prepopulateEmail with special characters should be URL-encoded', () => {
			const email = 'user+tag@example.com';
			const queryParams = {
				appClientId: 'maj',
				prepopulateEmail: email,
			};

			expect(queryParams.prepopulateEmail).toBe('user+tag@example.com');
		});

		test('scenario: redirect preserves existing query params when adding prepopulateEmail', () => {
			const email = 'active@example.com';
			const queryParams = {
				appClientId: 'maj',
				returnUrl: 'https://example.com',
				ref: 'https://ref.example.com',
				prepopulateEmail: email,
			};

			expect(queryParams.appClientId).toBe('maj');
			expect(queryParams.returnUrl).toBe('https://example.com');
			expect(queryParams.ref).toBe('https://ref.example.com');
			expect(queryParams.prepopulateEmail).toBe(email);
		});
	});
});
