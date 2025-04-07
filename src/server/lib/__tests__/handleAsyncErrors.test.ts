import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { NextFunction, Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';

describe('handleAsyncErrors', () => {
	it('should execute the provided function and return the result', async () => {
		const wrappedHandler = handleAsyncErrors(
			(req: Request, res: ResponseWithRequestState) => {
				return Promise.resolve(res);
			},
		);

		const request: Request = <Request>{};
		const response: ResponseWithRequestState = <ResponseWithRequestState>{};
		const next: NextFunction = jest.fn();

		expect(await wrappedHandler(request, response, next)).toBe(response);
		expect((<jest.Mock>next).mock.calls.length).toBe(0);
	});

	it('should call the provided function and handle failures by calling next', async () => {
		const error = new Error('some error');

		const wrappedHandler = handleAsyncErrors(() => {
			return Promise.reject(error);
		});

		const request: Request = <Request>{};
		const response: ResponseWithRequestState = <ResponseWithRequestState>{};
		const next: NextFunction = jest.fn();

		expect(await wrappedHandler(request, response, next)).toBe(undefined);
		expect((<jest.Mock>next).mock.calls.length).toBe(1);
		expect((<jest.Mock>next).mock.calls[0][0]).toBe(error);
	});
});
