import { csrfMiddleware } from '../../middleware/csrf';
import type { ResponseWithRequestState } from '@/server/models/Express';
import type { Request } from 'express';

const csrfSpy = jest.fn();
jest.mock('csurf', () => {
	// There's an extra level of function application here, without it I get the
	// following error:
	// ReferenceError: Cannot access 'csrfSpy' before initialization
	return () => () => csrfSpy();
});
jest.mock('@/server/lib/getConfiguration', () => {
	return {
		getConfiguration: () => ({
			isHttps: true,
		}),
	};
});

beforeEach(() => {
	csrfSpy.mockClear();
});

describe('csrfMiddleware', () => {
	it('does not call the underlying csrf middleware for routes which have been excluded', () => {
		const req = {
			path: '/unsubscribe-all/data/token',
		} as unknown as Request;
		const res = {} as unknown as ResponseWithRequestState;
		const next = jest.fn();

		csrfMiddleware(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(csrfSpy).not.toHaveBeenCalled();
	});

	it('does call the underlying csrf middleware for routes which have not been excluded', () => {
		const req = { path: '/some-other-path' } as unknown as Request;
		const res = {} as unknown as ResponseWithRequestState;
		const next = jest.fn();

		csrfMiddleware(req, res, next);

		expect(csrfSpy).toHaveBeenCalledTimes(1);
	});
});
