import { requestContext } from '../middleware/requestContext';
import { logger } from '../serverSideLogger';

const log = jest.fn();
jest.mock('winston', () => ({
	...jest.requireActual('winston'),
	createLogger: () => ({
		log: (level: string, message: string, extraFields: object) => {
			log(level, message, extraFields);
		},
	}),
}));

afterEach(() => {
	jest.clearAllMocks();
});

describe('serverSideLogger context', () => {
	it('returns the correct IP and request ID if context is available', () => {
		requestContext.run(
			{
				requestId: 'request-id',
				ip: '666.666.666.666',
			},
			() => {
				logger.info('Test message');

				expect(log).toHaveBeenCalledWith('info', 'Test message', {
					ip: '666.666.666.666',
					requestId: 'request-id',
				});
			},
		);
	});

	it('supports extra fields in addition to request ID and IP', () => {
		requestContext.run(
			{
				requestId: 'request-id',
				ip: '666.666.666.666',
			},
			() => {
				logger.info('Test message', undefined, {
					extraField: 'extra-field',
				});

				expect(log).toHaveBeenCalledWith('info', 'Test message', {
					ip: '666.666.666.666',
					requestId: 'request-id',
					extraField: 'extra-field',
				});
			},
		);
	});

	it('logs sucessfully if context is not available', () => {
		logger.info('Test message');

		expect(log).toHaveBeenCalledWith('info', 'Test message', {});
	});
});
