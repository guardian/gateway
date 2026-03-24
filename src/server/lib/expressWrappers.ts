import { NextFunction, Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';

type AsyncHandler<T> = (
	req: Request<T>,
	res: ResponseWithRequestState,
	next: NextFunction,
) => Promise<ResponseWithRequestState | void>;

export const handleAsyncErrors = <T>(handler: AsyncHandler<T>) => {
	return (
		req: Request<T>,
		res: ResponseWithRequestState,
		next: NextFunction,
	) => {
		return handler(req, res, next).catch((error) => {
			next(error);
		});
	};
};
