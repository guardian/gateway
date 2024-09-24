import {
	minifyRegistrationConsents,
	expandRegistrationConsents,
	bodyFormFieldsToRegistrationConsents,
} from '@/server/lib/registrationConsents';
import { Newsletters } from '@/shared/model/Newsletter';
import { RegistrationConsents } from '@/shared/model/RegistrationConsents';

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
	},
}));

describe('registrationConsents#bodyFormFieldsToRegistrationConsents', () => {
	it('returns expected consents and newsletters for specific IDs', () => {
		const body = {
			guardian_products_services: 'on',
			[Newsletters.SATURDAY_EDITION]: 'on',
			[Newsletters.FEAST]: undefined,
		};

		const expected: RegistrationConsents = {
			consents: [{ id: 'guardian_products_services', consented: true }],
			newsletters: [{ id: Newsletters.SATURDAY_EDITION, subscribed: true }],
		};

		expect(bodyFormFieldsToRegistrationConsents(body)).toEqual(expected);
	});
	it('returns expected consents and newsletters for bundle IDs', () => {
		const body = {
			guardian_products_services: 'on',
			[Newsletters.AU_BUNDLE]: 'on',
			[Newsletters.US_BUNDLE]: undefined,
		};

		const expected: RegistrationConsents = {
			consents: [{ id: 'guardian_products_services', consented: true }],
			newsletters: [
				{
					id: Newsletters.SATURDAY_EDITION,
					subscribed: true,
				},
				{
					id: Newsletters.WEEKEND_MAIL_AU,
					subscribed: true,
				},
			],
		};

		expect(bodyFormFieldsToRegistrationConsents(body)).toEqual(expected);
	});
});

describe('registrationConsents#minifyRegistrationConsents', () => {
	it('minifies registration consents', () => {
		const registrationConsents: RegistrationConsents = {
			consents: [
				{ id: 'guardian_products_services', consented: true },
				{ id: 'holidays', consented: false },
			],
			newsletters: [
				{ id: '1234', subscribed: true },
				{ id: '4321', subscribed: false },
			],
		};

		const expected =
			'guardian_products_services=true,holidays=false|1234=true,4321=false';
		expect(minifyRegistrationConsents(registrationConsents)).toEqual(expected);

		expect(JSON.stringify(registrationConsents).length).toBeGreaterThan(
			expected.length,
		);
	});

	it('minifies only consents', () => {
		const registrationConsents: RegistrationConsents = {
			consents: [
				{ id: 'guardian_products_services', consented: true },
				{ id: 'holidays', consented: false },
			],
		};

		const expected = 'guardian_products_services=true,holidays=false|';

		expect(minifyRegistrationConsents(registrationConsents)).toEqual(expected);

		expect(JSON.stringify(registrationConsents).length).toBeGreaterThan(
			expected.length,
		);
	});

	it('minifies only newsletters', () => {
		const registrationConsents: RegistrationConsents = {
			newsletters: [
				{ id: '1234', subscribed: true },
				{ id: '4321', subscribed: false },
			],
		};

		const expected = '|1234=true,4321=false';

		expect(minifyRegistrationConsents(registrationConsents)).toEqual(expected);

		expect(JSON.stringify(registrationConsents).length).toBeGreaterThan(
			expected.length,
		);
	});

	it('minifies empty registration consents', () => {
		const registrationConsents: RegistrationConsents = {};

		const expected = '|';

		expect(minifyRegistrationConsents(registrationConsents)).toEqual(expected);

		expect(JSON.stringify(registrationConsents).length).toBeGreaterThan(
			expected.length,
		);
	});
});

describe('registrationConsents#expandRegistrationConsents', () => {
	it('expands registration consents', () => {
		const input =
			'guardian_products_services=true,holidays=false|1234=true,4321=false';

		const expected: RegistrationConsents = {
			consents: [
				{ id: 'guardian_products_services', consented: true },
				{ id: 'holidays', consented: false },
			],
			newsletters: [
				{ id: '1234', subscribed: true },
				{ id: '4321', subscribed: false },
			],
		};

		expect(expandRegistrationConsents(input)).toEqual(expected);
	});

	it('expands only consents', () => {
		const input = 'guardian_products_services=true,holidays=false|';

		const expected: RegistrationConsents = {
			consents: [
				{ id: 'guardian_products_services', consented: true },
				{ id: 'holidays', consented: false },
			],
			newsletters: [],
		};

		expect(expandRegistrationConsents(input)).toEqual(expected);
	});

	it('expands only newsletters', () => {
		const input = '|1234=true,4321=false';

		const expected: RegistrationConsents = {
			consents: [],
			newsletters: [
				{ id: '1234', subscribed: true },
				{ id: '4321', subscribed: false },
			],
		};

		expect(expandRegistrationConsents(input)).toEqual(expected);
	});

	it('expands empty registration consents', () => {
		const input = '|';

		const expected: RegistrationConsents = {
			consents: [],
			newsletters: [],
		};

		expect(expandRegistrationConsents(input)).toEqual(expected);
	});
});
