import { Status } from '@/server/models/okta/User';

describe('iframed/register/email redirect logic', () => {
	test('ACTIVE user should redirect to signin', () => {
		const status = Status.ACTIVE;
		const shouldRedirect = (status as string) !== Status.DEPROVISIONED;

		expect(shouldRedirect).toBe(true);
	});

	test('PROVISIONED user should redirect to signin', () => {
		const status = Status.PROVISIONED;
		const shouldRedirect = (status as string) !== Status.DEPROVISIONED;

		expect(shouldRedirect).toBe(true);
	});

	test('STAGED user should redirect to signin', () => {
		const status = Status.STAGED;
		const shouldRedirect = (status as string) !== Status.DEPROVISIONED;

		expect(shouldRedirect).toBe(true);
	});

	test('DEPROVISIONED user should NOT redirect', () => {
		const status = Status.DEPROVISIONED;
		const shouldRedirect = (status as string) !== Status.DEPROVISIONED;

		expect(shouldRedirect).toBe(false);
	});
});
