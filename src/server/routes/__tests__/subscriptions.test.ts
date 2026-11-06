import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { idapiFetch } from '@/server/lib/IDAPIFetch';
import { csrfMiddleware } from '@/server/lib/middleware/csrf';
import { renderer } from '@/server/lib/renderer';
import { trackMetric } from '@/server/lib/trackMetric';
import subscriptionsRouter from '@/server/routes/subscriptions';

jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		isHttps: true,
		encryptionSecretKey: 'test-encryption-secret',
		accountManagementUrl: 'https://manage.example.com',
	}),
}));
jest.mock('@/server/lib/IDAPIFetch', () => ({
	...jest.requireActual<typeof import('@/server/lib/IDAPIFetch')>(
		'@/server/lib/IDAPIFetch',
	),
	idapiFetch: jest.fn(),
}));
jest.mock('@/server/lib/middleware/rateLimit', () => ({
	rateLimiterMiddleware: (_req: unknown, _res: unknown, next: () => void) =>
		next(),
}));
jest.mock('@/server/lib/renderer', () => ({ renderer: jest.fn() }));
jest.mock('@/server/lib/requestState', () => ({
	mergeRequestState: jest.fn(),
}));
jest.mock('@/server/lib/idapi/newsletters', () => ({ read: jest.fn() }));
jest.mock('@/server/lib/trackMetric', () => ({ trackMetric: jest.fn() }));
jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: { log: jest.fn(), error: jest.fn() },
}));

const path = '/list-unsubscribe/newsletter/123%3A456%3A1792400000/test-token';
const makeApp = () => {
	const app = express();
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser('test-secret'));
	app.use(csrfMiddleware);
	app.use(subscriptionsRouter);
	return app;
};

describe('POST /list-unsubscribe/newsletter/:data/:token', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(idapiFetch).mockResolvedValue(null);
	});

	it.each(['urlencoded', 'multipart'])(
		'unsubscribes without cookies or CSRF credentials using %s',
		async (encoding) => {
			const post = request(makeApp()).post(path);
			const response =
				encoding === 'multipart'
					? await post.field('List-Unsubscribe', 'One-Click')
					: await post.type('form').send({ 'List-Unsubscribe': 'One-Click' });

			expect(response.status).toBe(204);
			expect(response.text).toBe('');
			expect(response.headers.location).toBeUndefined();
			expect(idapiFetch).toHaveBeenCalledTimes(1);
			expect(idapiFetch).toHaveBeenCalledWith({
				path: '/unsubscribe',
				options: expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({
						emailType: 'newsletter',
						emailId: '123',
						userId: '456',
						timestamp: 1792400000,
						token: 'test-token',
					}),
				}),
			});
			expect(renderer).not.toHaveBeenCalled();
			expect(trackMetric).toHaveBeenCalledWith('ListUnsubscribe::Success');
		},
	);

	it.each([
		'123:456',
		'123::1792400000',
		':456:1792400000',
		'123:456:NaN',
		'123:456:Infinity',
		'123:456:-1',
		'123:456:1.5',
		'123:456:9007199254740992',
		'123:456:1792400000:extra',
	])('rejects malformed data %s before calling IDAPI', async (data) => {
		await request(makeApp())
			.post(`/list-unsubscribe/newsletter/${encodeURIComponent(data)}/token`)
			.expect(400);
		expect(idapiFetch).not.toHaveBeenCalled();
		expect(trackMetric).toHaveBeenCalledWith('ListUnsubscribe::Failure');
	});

	it.each([400, 401, 403, 404, 429, 500, 503])(
		'returns a non-success response for IDAPI status %s',
		async (status) => {
			jest.mocked(idapiFetch).mockRejectedValue({ status });
			const response = await request(makeApp()).post(path);
			expect(response.status).toBe(status < 500 ? status : 500);
			expect(response.text).toBe('');
			expect(response.headers.location).toBeUndefined();
			expect(renderer).not.toHaveBeenCalled();
			expect(trackMetric).toHaveBeenCalledWith('ListUnsubscribe::Failure');
			expect(trackMetric).not.toHaveBeenCalledWith('ListUnsubscribe::Success');
		},
	);

	it('returns 500 on an unexpected downstream failure', async () => {
		jest.mocked(idapiFetch).mockRejectedValue(new Error('Connection failed'));
		await request(makeApp()).post(path).expect(500);
	});

	it('does not unsubscribe on GET', async () => {
		await request(makeApp()).get(path).expect(404);
		expect(idapiFetch).not.toHaveBeenCalled();
	});
});
