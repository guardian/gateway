import express, { type ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { csrfMiddleware } from '@/server/lib/middleware/csrf';
import { invalidCsrfTokenError } from '@/server/lib/csrf';

jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		isHttps: true,
		encryptionSecretKey: 'test-encryption-secret',
	}),
}));

describe('configured CSRF exemptions', () => {
	const makeApp = () => {
		const app = express();
		app.use(express.urlencoded({ extended: true }));
		app.use(cookieParser('test-secret'));
		app.use(csrfMiddleware);
		app.use((_req, res) => {
			res.sendStatus(204);
		});
		const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
			res.sendStatus(error === invalidCsrfTokenError ? 403 : 500);
		};
		app.use(errorHandler);
		return app;
	};

	it.each([
		'/list-unsubscribe/newsletter/123%3A456%3A1792400000/test-token',
		'/list-unsubscribe/newsletter/123%3A456%3A1792400000/test-token/',
		'/unsubscribe-all/456%3A1792400000/test-token',
	])('allows a POST to %s without CSRF credentials', async (path) => {
		await request(makeApp())
			.post(path)
			.type('form')
			.send({ 'List-Unsubscribe': 'One-Click' })
			.expect(204);
	});

	it.each([
		'/subscribe/newsletter/data/token',
		'/unsubscribe/newsletter/data/token',
		'/list-unsubscribe/marketing/data/token',
		'/list-unsubscribe/newsletter/data/token/extra',
		'/list-unsubscribe/newsletter/data',
		'/list-unsubscribe/newsletter//token',
		'/unsubscribe/marketing/data/token',
		'/unsubscribe/newsletters/data/token',
		'/unsubscribe/newsletter',
		'/unsubscribe/newsletter/data',
		'/unsubscribe/newsletter/data/',
		'/unsubscribe/newsletter/data/token/extra',
		'/unsubscribe/newsletter//token',
		'/some-other-path',
	])('requires CSRF credentials for a POST to %s', async (path) => {
		await request(makeApp()).post(path).expect(403);
	});

	it.each(['put', 'patch', 'delete'] as const)(
		'requires CSRF credentials for %s on the newsletter unsubscribe path',
		async (method) => {
			await request(makeApp())
				[method]('/list-unsubscribe/newsletter/data/token')
				.expect(403);
		},
	);

	it('preserves the GET review request without CSRF credentials', async () => {
		await request(makeApp())
			.get('/unsubscribe/newsletter/data/token')
			.expect(204);
	});
});
