import type { NextFunction, Request } from 'express';
import type { ResponseWithRequestState } from '@/server/models/Express';

type AsyncHandler = (
	req: Request,
	res: ResponseWithRequestState,
	next: NextFunction,
) => Promise<ResponseWithRequestState | void>;

export const handleAsyncErrors = (handler: AsyncHandler) => {
	return (req: Request, res: ResponseWithRequestState, next: NextFunction) => {
		return handler(req, res, next).catch((error) => {
			next(error);
		});
	};
};
