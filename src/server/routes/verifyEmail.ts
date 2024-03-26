import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { read as getUser } from '@/server/lib/idapi/user';
import {
	send as sendVerificationEmail,
	verifyEmail,
} from '@/server/lib/idapi/verifyEmail';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { setIDAPICookies } from '@/server/lib/idapi/IDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import { ApiError } from '@/server/models/Error';
import { ResponseWithRequestState } from '@/server/models/Express';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { ConsentsErrors, VerifyEmailErrors } from '@/shared/model/Errors';
import { EMAIL_SENT } from '@/shared/model/Success';
import { buildUrl } from '@/shared/lib/routeUtils';
import { Request, Router } from 'express';
import handleRecaptcha from '@/server/lib/recaptcha';
import { clearOktaCookies } from './signOut';
import { mergeRequestState } from '@/server/lib/requestState';

const router = Router();

const { signInPageUrl } = getConfiguration();
const profileUrl = getProfileUrl();

router.get(
	'/verify-email',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		// eslint-disable-next-line functional/no-let
		let state = res.locals;

		state = mergeRequestState(state, {
			pageData: {
				signInPageUrl: `${signInPageUrl}?returnUrl=${encodeURIComponent(
					`${profileUrl}${buildUrl('/verify-email')}`,
				)}`,
			},
		});

		// eslint-disable-next-line functional/no-let
		let status = 200;

		try {
			const sc_gu_u = req.cookies.SC_GU_U;

			if (!sc_gu_u) {
				throw new ApiError({
					status: 403,
					message: ConsentsErrors.ACCESS_DENIED,
				});
			}

			const { primaryEmailAddress } = await getUser(
				req.ip,
				sc_gu_u,
				state.requestId,
			);
			state = mergeRequestState(state, {
				pageData: {
					email: primaryEmailAddress,
				},
			});
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: state.requestId,
			});
			const { message, status: errorStatus } =
				error instanceof ApiError ? error : new ApiError();

			status = errorStatus;

			if (status === 500) {
				state = mergeRequestState(state, {
					globalMessage: {
						error: message,
					},
				});
			}
		}

		const html = renderer('/verify-email', {
			pageTitle: 'Verify Email',
			requestState: state,
		});

		return res.status(status).type('html').send(html);
	}),
);

router.post(
	'/verify-email',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		// eslint-disable-next-line functional/no-let
		let state = res.locals;
		// eslint-disable-next-line functional/no-let
		let status = 200;

		try {
			const sc_gu_u = req.cookies.SC_GU_U;

			if (!sc_gu_u) {
				throw new ApiError({
					status: 403,
					message: ConsentsErrors.ACCESS_DENIED,
				});
			}

			const {
				email = (await getUser(req.ip, sc_gu_u, state.requestId))
					.primaryEmailAddress,
			} = req.body;

			state = mergeRequestState(state, {
				pageData: {
					email,
				},
			});

			await sendVerificationEmail(req.ip, sc_gu_u, state.requestId);
			trackMetric('SendValidationEmail::Success');

			state = mergeRequestState(state, {
				globalMessage: {
					success: EMAIL_SENT.SUCCESS,
				},
			});
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: state.requestId,
			});

			trackMetric('SendValidationEmail::Failure');

			const { message, status: errorStatus } =
				error instanceof ApiError ? error : new ApiError();

			status = errorStatus;

			state = mergeRequestState(state, {
				globalMessage: {
					error: message,
				},
			});
		}

		const html = renderer('/verify-email', {
			pageTitle: 'Verify Email',
			requestState: state,
		});

		return res.status(status).type('html').send(html);
	}),
);

router.get(
	'/verify-email/:token',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { token } = req.params;

		try {
			const cookies = await verifyEmail(token, req.ip, res.locals.requestId);
			trackMetric('EmailValidated::Success');
			// because we are verifying the email using idapi, and a new okta
			// session will not be created, so we will need to clear the okta
			// cookies to keep the sessions in sync
			clearOktaCookies(res);
			setIDAPICookies(res, cookies);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			const { message } = error instanceof ApiError ? error : new ApiError();

			if (message === VerifyEmailErrors.USER_ALREADY_VALIDATED) {
				return res.redirect(
					303,
					addQueryParamsToPath(`/welcome/review`, res.locals.queryParams, {
						useIdapi: true,
					}),
				);
			}

			trackMetric('EmailValidated::Failure');

			return res.redirect(
				303,
				addQueryParamsToPath('/verify-email', res.locals.queryParams, {
					useIdapi: true,
				}),
			);
		}

		return res.redirect(
			303,
			addQueryParamsToPath('/welcome/review', res.locals.queryParams, {
				emailVerified: true,
				useIdapi: true,
			}),
		);
	}),
);

export default router;
