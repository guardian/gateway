import {
	minifyRegistrationConsents,
	expandRegistrationConsents,
	bodyFormFieldsToRegistrationConsents,
	getRegistrationConsentsFromCookies,
	registrationConsentsExistInCookies,
	getOptedInConsents,
	updateNewslettersAndConsents,
	automaticallyOptinUSNewslettersAndConsents,
} from '@/server/lib/registrationConsents';
import { Newsletters } from '@/shared/model/Newsletter';
import { RegistrationConsents } from '@/shared/model/RegistrationConsents';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
	},
}));

jest.mock('@/server/lib/idapi/consents', () => ({
	update: jest.fn(),
}));

jest.mock('@/server/lib/idapi/newsletters', () => ({
	update: jest.fn(),
}));

import { update as updateConsents } from '@/server/lib/idapi/consents';
import { update as updateNewsletters } from '@/server/lib/idapi/newsletters';
import { Consents } from '@/shared/model/Consent';

describe('registrationConsents#bodyFormFieldsToRegistrationConsents', () => {
	it('returns expected consents and newsletters for specific IDs', () => {
		const body = {
			similar_guardian_products: 'on',
			[Newsletters.SATURDAY_EDITION]: 'on',
			[Newsletters.FEAST]: undefined,
		};

		const expected: RegistrationConsents = {
			consents: [{ id: 'similar_guardian_products', consented: true }],
			newsletters: [{ id: Newsletters.SATURDAY_EDITION, subscribed: true }],
		};

		expect(bodyFormFieldsToRegistrationConsents(body)).toEqual(expected);
	});
	it('returns expected consents and newsletters for bundle IDs', () => {
		const body = {
			similar_guardian_products: 'on',
			[Newsletters.AU_BUNDLE]: 'on',
			[Newsletters.US_BUNDLE]: undefined,
		};

		const expected: RegistrationConsents = {
			consents: [{ id: 'similar_guardian_products', consented: true }],
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

describe('registrationConsents#getRegistrationConsentsFromCookies', () => {
	it('returns RegistrationConsents object from cookies', () => {
		const req = {
			cookies: {
				registrationConsents: JSON.stringify([
					'similar_guardian_products',
					'6031',
				]),
			},
		} as unknown as Request;

		const expected: RegistrationConsents = {
			consents: [{ id: 'similar_guardian_products', consented: true }],
			newsletters: [{ id: '6031', subscribed: true }],
		};

		expect(getRegistrationConsentsFromCookies(req)).toEqual(expected);
	});
});

describe('registrationConsents#getOptedInConsents', () => {
	it('returns a consents object of objects from RegistrationConsents', () => {
		const registrationConsents = {
			consents: [{ id: 'similar_guardian_products', consented: true }],
			newsletters: [{ id: '6031', subscribed: true }],
		};

		const expected = ['similar_guardian_products', '6031'];

		expect(getOptedInConsents(registrationConsents)).toEqual(expected);
	});

	it('filters out products for which the user has not consented', () => {
		const registrationConsents = {
			consents: [{ id: 'similar_guardian_products', consented: true }],
			newsletters: [{ id: '6031', subscribed: false }],
		};

		const expected = ['similar_guardian_products'];

		expect(getOptedInConsents(registrationConsents)).toEqual(expected);
	});
});

describe('registrationConsents#registrationConsentsExistInCookies', () => {
	it('returns true when at least one registration consent exists in cookies', () => {
		const req = {
			cookies: {
				registrationConsents: JSON.stringify(['similar_guardian_products']),
			},
		} as unknown as Request;

		expect(registrationConsentsExistInCookies(req)).toEqual(true);
	});

	it('returns false when no registration consent exist in cookies', () => {
		const req = {
			cookies: {
				some_other_cookie: 'true',
			},
		} as unknown as Request;

		expect(registrationConsentsExistInCookies(req)).toEqual(false);
	});
});

describe('registrationConsents#updateNewslettersAndConsents', () => {
	it('should call updateConsents and updateNewsletters with the correct payload', async () => {
		const registrationConsents = {
			consents: [{ id: 'similar_guardian_products', consented: true }],
			newsletters: [{ id: '6031', subscribed: true }],
		};

		const res = {
			locals: {
				oauthState: {
					accessToken: 'mockAccessToken',
				},
			},
			cookie: jest.fn(),
		} as unknown as ResponseWithRequestState;

		const loggingContext = 'test-context';

		await updateNewslettersAndConsents(
			registrationConsents,
			res,
			loggingContext,
		);

		expect(updateConsents).toHaveBeenCalledWith({
			accessToken: 'mockAccessToken',
			payload: registrationConsents.consents,
		});
		expect(updateNewsletters).toHaveBeenCalledWith({
			accessToken: 'mockAccessToken',
			payload: registrationConsents.newsletters,
		});
	});
});

describe('registrationConsents#automaticallyOptinUSNewslettersAndConsents', () => {
	it('should automatically opt-in US newsletters and consents', async () => {
		const res = {
			locals: {
				oauthState: {
					accessToken: 'mockAccessToken',
				},
			},
			cookie: jest.fn(),
		} as unknown as ResponseWithRequestState;

		const registrationConsents = {
			consents: [{ id: Consents.SIMILAR_GUARDIAN_PRODUCTS, consented: true }],
			newsletters: [
				{ id: Newsletters.FIRST_THING, subscribed: true },
				{ id: Newsletters.SATURDAY_EDITION, subscribed: true },
			],
		};

		await automaticallyOptinUSNewslettersAndConsents(res);

		expect(updateConsents).toHaveBeenCalledWith({
			accessToken: 'mockAccessToken',
			payload: registrationConsents.consents,
		});
		expect(updateNewsletters).toHaveBeenCalledWith({
			accessToken: 'mockAccessToken',
			payload: registrationConsents.newsletters,
		});
	});
});
