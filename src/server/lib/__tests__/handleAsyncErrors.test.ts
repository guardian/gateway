import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { NextFunction, Request, Response } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import Mock = jest.Mock;

describe('handleAsyncErrors', () => {
  it('should execute the provided function and return the result', async () => {
    const wrappedHandler = handleAsyncErrors(
      (req: Request, res: ResponseWithRequestState) => {
        return Promise.resolve(res);
      },
    );

    const request: Request = <Request>{};
    const response: Response = <Response>{};
    const next: NextFunction = jest.fn();

    expect(await wrappedHandler(request, response, next)).toBe(response);
    expect((<Mock>next).mock.calls.length).toBe(0);
  });

  it('should call the provided function and handle failures by calling next', async () => {
    const error = new Error('some error');

    const wrappedHandler = handleAsyncErrors(() => {
      return Promise.reject(error);
    });

    const request: Request = <Request>{};
    const response: Response = <Response>{};
    const next: NextFunction = jest.fn();

    expect(await wrappedHandler(request, response, next)).toBe(undefined);
    expect((<Mock>next).mock.calls.length).toBe(1);
    expect((<Mock>next).mock.calls[0][0]).toBe(error);
  });
});
