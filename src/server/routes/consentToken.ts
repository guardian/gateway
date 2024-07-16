import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { renderer } from '@/server/lib/renderer';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import {
	validateConsentToken,
	resendConsentEmail,
} from '@/server/lib/idapi/consentToken';
import { mergeRequestState } from '@/server/lib/requestState';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { buildUrl } from '@/shared/lib/routeUtils';

// When a user attempts to sign up for newsletters, rather than immediately signing them up,
// we may instead call the IDAPI endpoint /consent-email to send them an email with a link
// which, when clicked, will validate their acceptance and sign them up. This link goes to
// this endpoint, /consent-token/:token/accept.
router.get(
	'/consent-token/:token/accept',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const ip = req.ip;
		const token = req.params.token;
		try {
			await validateConsentToken(ip, token, res.locals.requestId);

			trackMetric('ConsentToken::Success');

			return res.redirect(303, buildUrl('/subscribe/success'));
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl} Error`, error, {
				request_id: res.locals.requestId,
			});

			trackMetric('ConsentToken::Failure');

			// On an error we assume the token is invalid and render a page
			// where the user can request a new consent email.
			const html = renderer('/consent-token/error', {
				pageTitle: 'Resend Consent Email',
				requestState: mergeRequestState(res.locals, {
					pageData: {
						token,
					},
				}),
			});
			return res.type('html').status(200).send(html);
		}
	}),
);

router.get(
	'/consent-token/email-sent',
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/consent-token/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: res.locals,
		});
		return res.type('html').status(200).send(html);
	},
);

router.post(
	'/consent-token/resend',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		// This is a pass-through route to IDAPI, which will send a new consent
		// email to the user if the token matches. We don't need to do anything
		// with the response here.
		const ip = req.ip;
		const { token } = req.body;
		try {
			await resendConsentEmail(ip, token, res.locals.requestId);

			trackMetric('ConsentTokenResend::Success');
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl} Error`, error, {
				request_id: res.locals.requestId,
			});

			trackMetric('ConsentTokenResend::Failure');
		} finally {
			return res.redirect(303, '/consent-token/email-sent');
		}
	}),
);

export default router.router;
