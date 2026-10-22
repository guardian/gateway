import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';

const mockBodyFormFieldsToRegistrationConsents = jest.fn();

jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		baseUri: 'http://localhost',
		googleRecaptcha: { secretKey: '' },
		passcodesEnabled: false,
		signInPageUrl: '/signin',
	}),
}));

jest.mock('@/server/controllers/checkPasswordToken', () => ({
	checkPasswordTokenController: jest.fn(
		() => (_req: unknown, _res: unknown, next: () => void) => next(),
	),
}));

jest.mock('@/server/controllers/changePassword', () => ({
	setPasswordController: jest.fn(
		() => (_req: unknown, _res: unknown, next: () => void) => next(),
	),
}));

jest.mock('@/server/lib/middleware/rateLimit', () => ({
	rateLimiterMiddleware: (_req: unknown, _res: unknown, next: () => void) =>
		next(),
}));

jest.mock('@/server/lib/middleware/login', () => ({
	loginMiddlewareOAuth: (req: Request, res: Response, next: NextFunction) => {
		const parseBooleanQuery = (value: unknown): boolean | undefined => {
			if (value === 'true') {
				return true;
			}
			if (value === 'false') {
				return false;
			}
			return undefined;
		};

		/* eslint-disable-next-line functional/immutable-data -- test-only middleware setup */
		res.locals.queryParams = {
			returnUrl:
				typeof req.query.returnUrl === 'string'
					? req.query.returnUrl
					: 'https://www.theguardian.com',
			clientId:
				typeof req.query.clientId === 'string' ? req.query.clientId : undefined,
			newOnboardingFlow: parseBooleanQuery(req.query.newOnboardingFlow),
		};

		next();
	},
}));

jest.mock('@/server/lib/registrationConsents', () => ({
	bodyFormFieldsToRegistrationConsents: (...args: unknown[]) =>
		mockBodyFormFieldsToRegistrationConsents(...args),
}));

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
	},
}));

jest.mock('@/server/lib/renderer', () => ({
	renderer: jest.fn(() => '<html lang="en"></html>'),
}));

jest.mock('@/server/routes/register', () => ({
	oktaRegistrationOrSignin: jest.fn(),
	setEncryptedStateCookieForOktaRegistration: jest.fn(),
}));

import welcomeRouter from '@/server/routes/welcome';

const getRedirectPathname = (location: string): string =>
	new URL(location, 'http://localhost').pathname;

const getRedirectSearchParams = (location: string): URLSearchParams =>
	new URL(location, 'http://localhost').searchParams;

const getApp = () => {
	const app = express();
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());
	app.use(welcomeRouter);
	return app;
};

describe('POST /welcome/complete-account', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockBodyFormFieldsToRegistrationConsents.mockReturnValue({});
	});

	test('redirects jobs users to jobs terms path', async () => {
		const response = await request(getApp())
			.post('/welcome/complete-account')
			.query({
				clientId: 'jobs',
				newOnboardingFlow: 'true',
				returnUrl: 'https://www.theguardian.com',
			})
			.send({});

		expect(response.status).toBe(303);
		expect(getRedirectPathname(response.headers.location)).toBe('/agree/GRS');

		const queryParams = getRedirectSearchParams(response.headers.location);
		expect(queryParams.get('clientId')).toBe('jobs');
		expect(queryParams.get('newOnboardingFlow')).toBe('true');
		expect(queryParams.get('returnUrl')).toBe('https://www.theguardian.com');
	});

	test('redirects to onboarding when newOnboardingFlow is true', async () => {
		const response = await request(getApp())
			.post('/welcome/complete-account')
			.query({
				newOnboardingFlow: 'true',
				returnUrl: 'https://www.theguardian.com',
			})
			.send({});

		expect(response.status).toBe(303);
		expect(getRedirectPathname(response.headers.location)).toBe(
			'/welcome/onboarding',
		);

		const queryParams = getRedirectSearchParams(response.headers.location);
		expect(queryParams.get('newOnboardingFlow')).toBe('true');
		expect(queryParams.get('returnUrl')).toBe('https://www.theguardian.com');
	});

	test('redirects to review when newOnboardingFlow is not enabled', async () => {
		const response = await request(getApp())
			.post('/welcome/complete-account')
			.query({
				returnUrl: 'https://www.theguardian.com',
			})
			.send({});

		expect(response.status).toBe(303);
		expect(getRedirectPathname(response.headers.location)).toBe(
			'/welcome/review',
		);
	});

	test('still redirects in finally when registration consents parsing throws', async () => {
		mockBodyFormFieldsToRegistrationConsents.mockImplementationOnce(() => {
			throw new Error('consent parse failed');
		});

		const response = await request(getApp())
			.post('/welcome/complete-account')
			.query({
				newOnboardingFlow: 'true',
				returnUrl: 'https://www.theguardian.com',
			})
			.send({});

		expect(response.status).toBe(303);
		expect(getRedirectPathname(response.headers.location)).toBe(
			'/welcome/onboarding',
		);
	});
});
