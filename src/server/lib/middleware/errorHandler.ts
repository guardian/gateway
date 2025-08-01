import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getCsrfPageUrl } from '@/server/lib/getCsrfPageUrl';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/serverSideLogger';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { trackMetric } from '@/server/lib/trackMetric';

const { defaultReturnUri } = getConfiguration();

export const routeErrorHandler = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ErrorRequestHandler uses type any
	err: any,
	req: Request,
	res: ResponseWithRequestState,
) => {
	if (err.code === 'EBADCSRFTOKEN') {
		// handle CSRF token errors here
		// we attempt to redirect to res.locals.csrf.pageUrl provided by a hidden form field falling back to req.url
		// we use res.locals.csrf.pageUrl since the URL might not be GET-able if the request was a POST
		// we also have to manually build the query params object, as it may not be defined in an unexpected csrf error
		logger.error('csrf error', err);
		res.redirect(
			303,
			addQueryParamsToUntypedPath(
				getCsrfPageUrl(req),
				{ ...res.locals.queryParams, returnUrl: defaultReturnUri },
				{
					csrfError: true,
				},
			),
		);
		throw err;
	} else if (err.code === 'EBADRECAPTCHA') {
		trackMetric('RecaptchaMiddleware::Failure');
		logger.error('recaptcha error', err);
		res.redirect(
			303,
			addQueryParamsToUntypedPath(
				req.url,
				{
					...res.locals.queryParams,
					returnUrl: defaultReturnUri,
				},
				{
					recaptchaError: true,
				},
			),
		);
		throw err;
	}

	logger.error('unexpected error', err);

	const html = renderer('/error', {
		requestState: res.locals,
		pageTitle: 'Unexpected Error',
	});
	return res.status(500).type('html').send(html);
};
