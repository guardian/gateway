import { Request, Response, CookieOptions } from 'express';
import {
	iframeCompatibilityMiddleware,
	iframeCookieMiddleware,
} from '@/server/lib/middleware/iframe';

interface IframeRequest extends Request {
	isIframeRequest?: boolean;
}

interface MockResponse extends Partial<Response> {
	setHeader: jest.Mock;
	cookie: jest.Mock;
}

type CookieFunction = (
	name: string,
	value: string,
	options?: CookieOptions,
) => Response;

describe('Iframe Middleware', () => {
	const createMockReq = (
		headers: Record<string, string> = {},
		isIframeRequest?: boolean,
	): IframeRequest =>
		({
			headers,
			isIframeRequest,
		}) as IframeRequest;

	const createMockRes = (): {
		mockRes: MockResponse;
		setHeaderSpy: jest.Mock;
		cookieSpy: jest.Mock;
	} => {
		const setHeaderSpy = jest.fn();
		const cookieSpy = jest.fn();
		const mockRes: MockResponse = {
			setHeader: setHeaderSpy,
			cookie: cookieSpy,
		};
		return { mockRes, setHeaderSpy, cookieSpy };
	};

	const mockNext = jest.fn();

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('iframeCompatibilityMiddleware', () => {
		it('should detect iframe request via sec-fetch-dest header', () => {
			const mockReq = createMockReq({ 'sec-fetch-dest': 'iframe' });
			const { mockRes, setHeaderSpy } = createMockRes();

			iframeCompatibilityMiddleware(mockReq, mockRes as Response, mockNext);

			expect(setHeaderSpy).toHaveBeenCalledWith(
				'X-Frame-Options',
				'SAMEORIGIN',
			);
			expect(mockReq.isIframeRequest).toBe(true);
			expect(mockNext).toHaveBeenCalled();
		});

		it('should detect iframe request via x-iframe-request header', () => {
			const mockReq = createMockReq({ 'x-iframe-request': 'true' });
			const { mockRes, setHeaderSpy } = createMockRes();

			iframeCompatibilityMiddleware(mockReq, mockRes as Response, mockNext);

			expect(setHeaderSpy).toHaveBeenCalledWith(
				'X-Frame-Options',
				'SAMEORIGIN',
			);
			expect(mockReq.isIframeRequest).toBe(true);
			expect(mockNext).toHaveBeenCalled();
		});

		it('should not set iframe properties for regular requests', () => {
			const mockReq = createMockReq({ 'user-agent': 'Mozilla/5.0' });
			const { mockRes, setHeaderSpy } = createMockRes();

			iframeCompatibilityMiddleware(mockReq, mockRes as Response, mockNext);

			expect(setHeaderSpy).not.toHaveBeenCalled();
			expect(mockReq.isIframeRequest).toBeUndefined();
			expect(mockNext).toHaveBeenCalled();
		});

		it('should handle missing headers gracefully', () => {
			const mockReq = createMockReq({});
			const { mockRes, setHeaderSpy } = createMockRes();

			iframeCompatibilityMiddleware(mockReq, mockRes as Response, mockNext);

			expect(setHeaderSpy).not.toHaveBeenCalled();
			expect(mockReq.isIframeRequest).toBeUndefined();
			expect(mockNext).toHaveBeenCalled();
		});

		it('should handle case-sensitive header values', () => {
			const mockReq = createMockReq({ 'x-iframe-request': 'TRUE' });
			const { mockRes, setHeaderSpy } = createMockRes();

			iframeCompatibilityMiddleware(mockReq, mockRes as Response, mockNext);

			expect(setHeaderSpy).not.toHaveBeenCalled();
			expect(mockReq.isIframeRequest).toBeUndefined();
			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe('iframeCookieMiddleware', () => {
		it('should override cookie method for iframe requests', () => {
			const mockReq = createMockReq({}, true);
			const originalCookie = jest.fn();
			const mockRes = {
				cookie: originalCookie,
			} as unknown as Response;

			iframeCookieMiddleware(mockReq, mockRes, mockNext);

			// Verify that the cookie method was overridden
			expect(mockRes).toHaveProperty('cookie');
			expect(mockRes).not.toEqual(
				expect.objectContaining({ cookie: originalCookie }),
			);
			expect(mockNext).toHaveBeenCalled();
		});

		it('should set SameSite=None and Secure=true for iframe cookies', () => {
			const mockReq = createMockReq({}, true);
			const originalCookie = jest.fn();
			const mockRes = {
				cookie: originalCookie,
			} as unknown as Response;

			iframeCookieMiddleware(mockReq, mockRes, mockNext);

			// Call the overridden cookie method
			const cookieOptions = { domain: '.example.com' };
			// eslint-disable-next-line @typescript-eslint/unbound-method -- Testing cookie method override
			const cookieMethod = mockRes.cookie as CookieFunction;
			cookieMethod('testCookie', 'testValue', cookieOptions);

			expect(originalCookie).toHaveBeenCalledWith('testCookie', 'testValue', {
				domain: '.example.com',
				sameSite: 'none',
				secure: true,
			});
		});

		it('should preserve existing cookie options while adding iframe options', () => {
			const mockReq = createMockReq({}, true);
			const originalCookie = jest.fn();
			const mockRes = {
				cookie: originalCookie,
			} as unknown as Response;

			iframeCookieMiddleware(mockReq, mockRes, mockNext);

			// Call with existing options
			const existingOptions = {
				httpOnly: true,
				maxAge: 3600000,
				path: '/test',
			};
			// eslint-disable-next-line @typescript-eslint/unbound-method -- Testing cookie method override
			const cookieMethod = mockRes.cookie as CookieFunction;
			cookieMethod('testCookie', 'testValue', existingOptions);

			expect(originalCookie).toHaveBeenCalledWith('testCookie', 'testValue', {
				httpOnly: true,
				maxAge: 3600000,
				path: '/test',
				sameSite: 'none',
				secure: true,
			});
		});

		it('should handle cookie calls without options object', () => {
			const mockReq = createMockReq({}, true);
			const originalCookie = jest.fn();
			const mockRes = {
				cookie: originalCookie,
			} as unknown as Response;

			iframeCookieMiddleware(mockReq, mockRes, mockNext);

			// Call without options
			// eslint-disable-next-line @typescript-eslint/unbound-method -- Testing cookie method override
			const cookieMethod = mockRes.cookie as CookieFunction;
			cookieMethod('testCookie', 'testValue');

			expect(originalCookie).toHaveBeenCalledWith('testCookie', 'testValue', {
				sameSite: 'none',
				secure: true,
			});
		});

		it('should not modify cookie method for non-iframe requests', () => {
			const mockReq = createMockReq({}, false);
			const originalCookie = jest.fn();
			const mockRes = {
				cookie: originalCookie,
			} as unknown as Response;

			iframeCookieMiddleware(mockReq, mockRes, mockNext);

			// Cookie method should remain unchanged
			expect(mockRes).toEqual(
				expect.objectContaining({ cookie: originalCookie }),
			);
			expect(mockNext).toHaveBeenCalled();
		});

		it('should handle undefined isIframeRequest', () => {
			const mockReq = createMockReq({}, undefined);
			const originalCookie = jest.fn();
			const mockRes = {
				cookie: originalCookie,
			} as unknown as Response;

			iframeCookieMiddleware(mockReq, mockRes, mockNext);

			// Cookie method should remain unchanged
			expect(mockRes).toEqual(
				expect.objectContaining({ cookie: originalCookie }),
			);
			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe('Integration Tests', () => {
		it('should work correctly when both middlewares are used together', () => {
			// First middleware detects iframe
			const mockReq = createMockReq({ 'sec-fetch-dest': 'iframe' });
			const { mockRes } = createMockRes();

			iframeCompatibilityMiddleware(mockReq, mockRes as Response, mockNext);

			expect(mockReq.isIframeRequest).toBe(true);

			// Second middleware modifies cookies
			const originalCookie = jest.fn();
			const mockResWithCookie = {
				...mockRes,
				cookie: originalCookie,
			} as unknown as Response;

			iframeCookieMiddleware(mockReq, mockResWithCookie, mockNext);

			// Test that cookie modification works
			// eslint-disable-next-line @typescript-eslint/unbound-method -- Testing cookie method override
			const cookieMethod = mockResWithCookie.cookie as CookieFunction;
			cookieMethod('sessionId', 'abc123', { httpOnly: true });

			expect(originalCookie).toHaveBeenCalledWith('sessionId', 'abc123', {
				httpOnly: true,
				sameSite: 'none',
				secure: true,
			});
		});
	});
});
