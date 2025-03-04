import type {
	RequestWithCsrf,
	ResponseWithRequestState,
} from '@/server/models/Express';
import type { Request } from 'express';

// randomly generated 64 bytes long token for testing
const testToken =
	'_9jPt1hRTN1wDF9TSpTl1lHKobtYrB2Z-4Sqalp4iPjvuLHiEb-WwaqAD-nTS39H6Xki2FRJFL4WBWYh5UOERg';

// moved mocks before importing csrf module
// to avoid "ReferenceError: Cannot access 'digestSpy' before initialization"
const digestSpy = jest.fn();
const randomBytesSpy = jest
	.fn()
	.mockReturnValue(Buffer.from(testToken, 'base64url'));

// Mock crypto module
jest.mock('crypto', () => ({
	createHmac: () => ({
		update: () => ({
			digest: digestSpy.mockReturnValue('hash'),
		}),
	}),
	randomBytes: () => randomBytesSpy(),
}));

import { csrf, invalidCsrfTokenError, cookieName } from '@/server/lib/csrf';

jest.mock('@/server/lib/getConfiguration', () => {
	return {
		getConfiguration: () => ({
			isHttps: true,
		}),
	};
});

beforeEach(() => {
	digestSpy.mockClear();
	randomBytesSpy.mockClear();
});

describe('csrf', () => {
	describe('req.csrfToken', () => {
		it('generates and returns a new csrf token if not already present and valid', () => {
			const cookieSpy = jest.fn();
			const req = {
				path: '/some-path',
				method: 'GET',
				signedCookies: {},
			} as unknown as RequestWithCsrf;
			const res = {
				cookie: cookieSpy,
			} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});
			csrfMiddleware(req, res, next);

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(req.csrfToken).toBeDefined();
			expect(typeof req.csrfToken).toBe('function');

			const token = req.csrfToken?.();

			expect(token).toBe(testToken);
			expect(randomBytesSpy).toHaveBeenCalledTimes(1);
			expect(digestSpy).toHaveBeenCalledTimes(1);
			expect(cookieSpy).toHaveBeenCalledTimes(1);
			expect(cookieSpy).toHaveBeenCalledWith(cookieName, `${testToken}|hash`, {
				sameSite: 'lax',
				path: '/',
				secure: true,
				httpOnly: true,
				signed: true,
			});
		});

		it('reuses the existing csrf token if present and valid', () => {
			const cookieSpy = jest.fn();
			const req = {
				path: '/some-path',
				method: 'GET',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
			} as unknown as RequestWithCsrf;
			const res = {
				cookie: cookieSpy,
			} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});
			csrfMiddleware(req, res, next);

			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(req.csrfToken).toBeDefined();
			expect(typeof req.csrfToken).toBe('function');

			const token = req.csrfToken?.();

			expect(token).toBe('token');
			expect(randomBytesSpy).not.toHaveBeenCalled();
			expect(digestSpy).toHaveBeenCalledTimes(1);
			expect(cookieSpy).not.toHaveBeenCalled();
		});
	});

	describe('csrf validation', () => {
		it('validates the csrf token and hash for a given request', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
				body: {
					_csrf: 'token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith();
		});

		it('fails validation if the csrf token is missing from the request body', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
				body: {},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the csrf token is wrong from the request body', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
				body: {
					_csrf: 'wrong-token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the csrf token is wrong type from the request body', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
				body: {
					_csrf: 123,
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the csrf hash is missing from the cookie', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {},
				body: {
					_csrf: 'token|',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the csrf token is missing from the cookie', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {},
				body: {
					_csrf: '|hash',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the csrf token is wrong in cookie', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 'wrong-token|hash',
				},
				body: {
					_csrf: 'token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the csrf hash is wrong in cookie', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 'token|wrong-hash',
				},
				body: {
					_csrf: 'token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the cookie is in incorrect format', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 'token/hash',
				},
				body: {
					_csrf: 'token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});

		it('fails validation if the cookie is in incorrect type', () => {
			const req = {
				method: 'POST',
				path: '/some-path',
				signedCookies: {
					[cookieName]: 123,
				},
				body: {
					_csrf: 'token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({});

			csrfMiddleware(req, res, next);

			expect(digestSpy).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith(invalidCsrfTokenError);
		});
	});

	describe('ignoredMethods', () => {
		it('does not call the underlying csrf middleware for ignored methods', () => {
			const req = {
				path: '/some-path',
				method: 'GET',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({
				ignoredMethods: ['GET'],
			});

			csrfMiddleware(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(digestSpy).not.toHaveBeenCalled();
		});

		it('does call the underlying csrf middleware for non-ignored methods', () => {
			const req = {
				path: '/some-path',
				method: 'POST',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
				body: {
					_csrf: 'token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({
				ignoredMethods: ['GET'],
			});

			csrfMiddleware(req, res, next);

			expect(digestSpy).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith();
		});
	});

	describe('ignoredRoutes', () => {
		it('does not call the underlying csrf middleware for routes which have been excluded', () => {
			const req = {
				method: 'POST',
				path: '/unsubscribe-all/data/token',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({
				ignoredRoutes: ['/unsubscribe-all/'],
			});

			csrfMiddleware(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(digestSpy).not.toHaveBeenCalled();
		});

		it('does call the underlying csrf middleware for routes which have not been excluded', () => {
			const req = {
				method: 'POST',
				path: '/some-other-path',
				signedCookies: {
					[cookieName]: 'token|hash',
				},
				body: {
					_csrf: 'token',
				},
			} as unknown as Request;
			const res = {} as unknown as ResponseWithRequestState;
			const next = jest.fn();

			const csrfMiddleware = csrf({
				ignoredRoutes: ['/unsubscribe-all/'],
			});

			csrfMiddleware(req, res, next);

			expect(digestSpy).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledTimes(1);
			expect(next).toHaveBeenCalledWith();
		});
	});
});
