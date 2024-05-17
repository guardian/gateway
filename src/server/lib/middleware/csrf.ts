import csrf from 'csurf';
import { getConfiguration } from '@/server/lib/getConfiguration';
import type { ResponseWithRequestState } from '@/server/models/Express';
import type { NextFunction, Request } from 'express';

const { isHttps } = getConfiguration();

const baseCsrfMiddleware = csrf({
	cookie: {
		key: '_csrf',
		sameSite: true,
		secure: isHttps,
		httpOnly: true,
		signed: true,
	},
});

const SKIP_CSRF_ROUTE_PREFIXES = ['/unsubscribe-all/'];

export const csrfMiddleware = (
	req: Request,
	res: ResponseWithRequestState,
	next: NextFunction,
) => {
	if (SKIP_CSRF_ROUTE_PREFIXES.find((path) => req.path.startsWith(path))) {
		next();
	} else {
		baseCsrfMiddleware(req, res, next);
	}
};
