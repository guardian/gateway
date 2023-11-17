import {
	minifyRegistrationConsents,
	expandRegistrationConsents,
} from '@/server/lib/registrationConsents';
import { RegistrationConsents } from '@/shared/model/Consent';

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
	},
}));

describe('registrationConsents#minifyRegistrationConsents', () => {
	it('minifies registration consents', () => {
		const registrationConsents: RegistrationConsents = {
			consents: [
				{ id: 'similar_guardian_products', consented: true },
				{ id: 'holidays', consented: false },
			],
			newsletters: [
				{ id: '1234', subscribed: true },
				{ id: '4321', subscribed: false },
			],
		};

		const expected =
			'similar_guardian_products=true,holidays=false|1234=true,4321=false';
		expect(minifyRegistrationConsents(registrationConsents)).toEqual(expected);

		expect(JSON.stringify(registrationConsents).length).toBeGreaterThan(
			expected.length,
		);
	});

	it('minifies only consents', () => {
		const registrationConsents: RegistrationConsents = {
			consents: [
				{ id: 'similar_guardian_products', consented: true },
				{ id: 'holidays', consented: false },
			],
		};

		const expected = 'similar_guardian_products=true,holidays=false|';

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
			'similar_guardian_products=true,holidays=false|1234=true,4321=false';

		const expected: RegistrationConsents = {
			consents: [
				{ id: 'similar_guardian_products', consented: true },
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
		const input = 'similar_guardian_products=true,holidays=false|';

		const expected: RegistrationConsents = {
			consents: [
				{ id: 'similar_guardian_products', consented: true },
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
