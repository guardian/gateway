import request from 'supertest';
import express from 'express';
import {
	iframeCompatibilityMiddleware,
	iframeCookieMiddleware,
} from '@/server/lib/middleware/iframe';

interface IframeRequest extends express.Request {
	isIframeRequest?: boolean;
}

describe('Iframe Integration Tests', () => {
	const createTestApp = () => {
		const app = express();

		// Add iframe middleware
		app.use(iframeCompatibilityMiddleware);
		app.use(iframeCookieMiddleware);

		// Test routes
		app.get('/test', (req, res) => {
			const isIframeReq = (req as IframeRequest).isIframeRequest;
			res.cookie('testCookie', 'testValue', { httpOnly: true });
			res.json({ isIframeRequest: isIframeReq });
		});

		app.get('/headers', (req, res) => {
			res.json({ headers: req.headers });
		});

		return app;
	};

	describe('iframe detection via headers', () => {
		it('should detect iframe request with sec-fetch-dest header', async () => {
			const app = createTestApp();

			const response = await request(app)
				.get('/test')
				.set('sec-fetch-dest', 'iframe')
				.expect(200);

			expect(response.body.isIframeRequest).toBe(true);
			expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
		});

		it('should detect iframe request with x-iframe-request header', async () => {
			const app = createTestApp();

			const response = await request(app)
				.get('/test')
				.set('x-iframe-request', 'true')
				.expect(200);

			expect(response.body.isIframeRequest).toBe(true);
			expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
		});

		it('should not detect iframe for regular requests', async () => {
			const app = createTestApp();

			const response = await request(app).get('/test').expect(200);

			expect(response.body.isIframeRequest).toBeUndefined();
			expect(response.headers['x-frame-options']).toBeUndefined();
		});
	});

	describe('cookie handling', () => {
		it('should set SameSite=None and Secure for iframe requests', async () => {
			const app = createTestApp();

			const response = await request(app)
				.get('/test')
				.set('sec-fetch-dest', 'iframe')
				.expect(200);

			const cookies = response.headers['set-cookie'];
			expect(cookies).toBeDefined();

			if (cookies) {
				const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
				expect(cookieStr).toContain('SameSite=None');
				expect(cookieStr).toContain('Secure');
				expect(cookieStr).toContain('HttpOnly');
			}
		});

		it('should use normal cookie settings for regular requests', async () => {
			const app = createTestApp();

			const response = await request(app).get('/test').expect(200);

			const cookies = response.headers['set-cookie'];
			expect(cookies).toBeDefined();

			if (cookies) {
				const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
				expect(cookieStr).not.toContain('SameSite=None');
				expect(cookieStr).toContain('HttpOnly');
			}
		});
	});

	describe('middleware order and compatibility', () => {
		it('should work with both middlewares in correct order', async () => {
			const app = express();

			// Test with proper middleware order
			app.use(iframeCompatibilityMiddleware);
			app.use(iframeCookieMiddleware);

			app.get('/test', (req, res) => {
				const isIframeReq = (req as IframeRequest).isIframeRequest;
				res.cookie('sessionId', 'abc123', { maxAge: 3600000 });
				res.json({
					isIframeRequest: isIframeReq,
					middleware: 'both-applied',
				});
			});

			const response = await request(app)
				.get('/test')
				.set('sec-fetch-dest', 'iframe')
				.expect(200);

			expect(response.body.isIframeRequest).toBe(true);
			expect(response.body.middleware).toBe('both-applied');

			const cookies = response.headers['set-cookie'];
			if (cookies) {
				const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
				expect(cookieStr).toContain('SameSite=None');
				expect(cookieStr).toContain('Secure');
				expect(cookieStr).toContain('Max-Age=3600'); // Express converts milliseconds to seconds
			}
		});

		it('should handle edge cases gracefully', async () => {
			const app = createTestApp();

			// Test with various header combinations
			const testCases = [
				{ headers: { 'sec-fetch-dest': 'document' }, expectIframe: false },
				{ headers: { 'x-iframe-request': 'false' }, expectIframe: false },
				{ headers: { 'x-iframe-request': 'TRUE' }, expectIframe: false }, // case sensitive
				{
					headers: { 'sec-fetch-dest': 'iframe', 'x-iframe-request': 'true' },
					expectIframe: true,
				},
			];

			for (const testCase of testCases) {
				const req = request(app).get('/test');

				// Set headers
				Object.entries(testCase.headers).forEach(([key, value]) => {
					req.set(key, value);
				});

				const response = await req.expect(200);

				if (testCase.expectIframe) {
					expect(response.body.isIframeRequest).toBe(true);
					expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
				} else {
					expect(response.body.isIframeRequest).toBeUndefined();
					expect(response.headers['x-frame-options']).toBeUndefined();
				}
			}
		});
	});
});
