import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';

const mockGetUser = jest.fn();
const mockRenderer = jest.fn(
	(..._args: unknown[]) => '<html lang="en"></html>',
);
const mockReadEmailCookie = jest.fn();
const mockLoggerInfo = jest.fn();

jest.mock('@/server/lib/middleware/redirectIfLoggedIn', () => ({
	redirectIfLoggedIn: (_req: unknown, _res: unknown, next: () => void) =>
		next(),
}));

jest.mock('@/server/lib/middleware/rateLimit', () => ({
	rateLimiterMiddleware: (_req: unknown, _res: unknown, next: () => void) =>
		next(),
}));

jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		passcodesEnabled: false,
		googleRecaptcha: { secretKey: '' },
		baseUri: 'http://localhost',
		signInPageUrl: '/signin',
		okta: {
			orgUrl: 'https://okta.example.com',
			authServerId: 'default',
			clientId: 'client-id',
			clientSecret: 'client-secret',
		},
	}),
}));

jest.mock('@/server/lib/okta/api/users', () => ({
	getUser: (...args: unknown[]) => mockGetUser(...args),
}));

jest.mock('@/server/lib/renderer', () => ({
	renderer: (...args: unknown[]) => mockRenderer(...args),
}));

jest.mock('@/server/lib/emailCookie', () => ({
	readEmailCookie: (...args: unknown[]) => mockReadEmailCookie(...args),
}));

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		info: (...args: unknown[]) => mockLoggerInfo(...args),
		warn: jest.fn(),
		error: jest.fn(),
	},
}));

import { handleIframedRegisterEmail } from '@/server/routes/register';

const getMockRequest = (url: string): Request =>
	({
		url,
		originalUrl: url,
		ip: '127.0.0.1',
	}) as unknown as Request;

type MockResponse = {
	locals: {
		queryParams: Record<string, unknown>;
	};
	redirect: jest.Mock;
	type: jest.Mock;
	send: jest.Mock;
};

const getMockResponse = (): MockResponse => ({
	locals: {
		queryParams: {
			clientId: 'any',
			returnUrl: 'https://www.theguardian.com',
		},
	},
	redirect: jest.fn(),
	type: jest.fn().mockReturnThis(),
	send: jest.fn(),
});

const asResponse = (res: MockResponse): ResponseWithRequestState =>
	res as unknown as ResponseWithRequestState;

describe('GET /iframed/register/email - handleIframedRegisterEmail', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockReadEmailCookie.mockReturnValue(undefined);
	});

	test('redirects with 303 to /iframed/signin when prepopulatedEmail belongs to an existing user', async () => {
		mockGetUser.mockResolvedValueOnce({ id: 'user-id' });

		const req = getMockRequest(
			'/iframed/register/email?prepopulatedEmail=someone%40theguardian.com',
		);
		const res = getMockResponse();

		await handleIframedRegisterEmail(req, asResponse(res));

		expect(mockGetUser).toHaveBeenCalledWith(
			'someone@theguardian.com',
			'127.0.0.1',
		);
		expect(res.redirect).toHaveBeenCalledTimes(1);

		const [status, redirectUrl] = res.redirect.mock.calls[0];
		expect(status).toBe(303);

		const redirectUrlObject = new URL(redirectUrl, 'http://localhost');
		expect(redirectUrlObject.pathname).toBe('/iframed/signin');
		expect(redirectUrlObject.searchParams.get('prepopulatedEmail')).toBe(
			'someone@theguardian.com',
		);
		expect(redirectUrlObject.searchParams.get('clientId')).toBe('any');
		expect(redirectUrlObject.searchParams.get('returnUrl')).toBe(
			'https://www.theguardian.com',
		);

		// registration page is not rendered when we redirect to sign in
		expect(mockRenderer).not.toHaveBeenCalled();
		expect(res.type).not.toHaveBeenCalled();
		expect(res.send).not.toHaveBeenCalled();
	});

	test('renders the registration page (200 by default) when prepopulatedEmail does not belong to an existing user', async () => {
		mockGetUser.mockResolvedValueOnce(undefined);

		const req = getMockRequest(
			'/iframed/register/email?prepopulatedEmail=someone%40theguardian.com',
		);
		const res = getMockResponse();

		await handleIframedRegisterEmail(req, asResponse(res));

		expect(mockGetUser).toHaveBeenCalledWith(
			'someone@theguardian.com',
			'127.0.0.1',
		);
		expect(res.redirect).not.toHaveBeenCalled();
		expect(res.type).toHaveBeenCalledWith('html');
		expect(res.send).toHaveBeenCalledWith('<html lang="en"></html>');
	});

	test('renders the registration page when the user lookup throws (e.g. user not found)', async () => {
		mockGetUser.mockRejectedValueOnce(new Error('Not found'));

		const req = getMockRequest(
			'/iframed/register/email?prepopulatedEmail=someone%40theguardian.com',
		);
		const res = getMockResponse();

		await handleIframedRegisterEmail(req, asResponse(res));

		expect(res.redirect).not.toHaveBeenCalled();
		expect(res.type).toHaveBeenCalledWith('html');
		expect(res.send).toHaveBeenCalledWith('<html lang="en"></html>');
		expect(mockLoggerInfo).toHaveBeenCalledWith(
			expect.stringContaining('someone@theguardian.com'),
		);
	});

	test('renders the registration page directly when there is no prepopulatedEmail query param', async () => {
		const req = getMockRequest('/iframed/register/email');
		const res = getMockResponse();

		await handleIframedRegisterEmail(req, asResponse(res));

		expect(mockGetUser).not.toHaveBeenCalled();
		expect(res.redirect).not.toHaveBeenCalled();
		expect(res.type).toHaveBeenCalledWith('html');
		expect(res.send).toHaveBeenCalledWith('<html lang="en"></html>');
	});

	test('passes the decoded prepopulatedEmail through as page data when rendering the registration page', async () => {
		mockGetUser.mockResolvedValueOnce(undefined);

		const req = getMockRequest(
			'/iframed/register/email?prepopulatedEmail=someone%2Btest%40theguardian.com',
		);
		const res = getMockResponse();

		await handleIframedRegisterEmail(req, asResponse(res));

		expect(mockRenderer).toHaveBeenCalledWith(
			'/iframed/register/email?prepopulatedEmail=someone%2Btest%40theguardian.com',
			expect.objectContaining({
				requestState: expect.objectContaining({
					pageData: expect.objectContaining({
						email: 'someone+test@theguardian.com',
					}),
				}),
			}),
		);
	});
});
