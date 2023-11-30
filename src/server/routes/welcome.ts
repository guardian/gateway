import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendAccountVerificationEmail } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/serverSideLogger';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { ApiError } from '@/server/models/Error';
import { ResponseWithRequestState } from '@/server/models/Express';
import { consentPages } from '@/server/routes/consents';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import deepmerge from 'deepmerge';
import { Request } from 'express';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { register } from '@/server/lib/okta/register';
import { trackMetric } from '@/server/lib/trackMetric';
import { OktaError } from '@/server/models/okta/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { setEncryptedStateCookieForOktaRegistration } from './register';
import { mergeRequestState } from '@/server/lib/requestState';
import { loginMiddlewareOAuth } from '@/server/lib/middleware/login';
import { Consents, RegistrationConsents } from '@/shared/model/Consent';
import { update as updateConsents } from '@/server/lib/idapi/consents';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';

const { okta } = getConfiguration();

// consent page for post social registration - google
router.get(
	'/welcome/google',
	loginMiddlewareOAuth,
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/welcome/google', {
			pageTitle: 'Welcome',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// consent page for post social registration - apple
router.get(
	'/welcome/apple',
	loginMiddlewareOAuth,
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/welcome/apple', {
			pageTitle: 'Welcome',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// form handler for consent page for social registration
router.post(
	'/welcome/social',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		try {
			const { marketing } = req.body;

			// marketing consent is a string with value `'on'` if checked, or `undefined` if not checked
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value
			// so we can check the truthiness of the value to determine if the user has consented
			const consents: RegistrationConsents = {
				consents: [
					{
						id: Consents.SIMILAR_GUARDIAN_PRODUCTS,
						consented: !!marketing,
					},
				],
			};

			// update the consents and go to the finally block
			await updateConsents({
				ip: req.ip,
				accessToken: state.oauthState.accessToken?.toString(),
				payload: consents.consents!,
				request_id: res.locals.requestId,
			});
		} catch (error) {
			// we don't want to block the user at this point, so we'll just log the error, and go to the finally block
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});
		} finally {
			// if there is a fromURI, we need to complete the oauth flow, so redirect to the fromURI
			if (state.queryParams.fromURI) {
				return res.redirect(303, state.queryParams.fromURI);
			}

			// otherwise redirect the user to the first page of the onboarding flow
			return res.redirect(
				303,
				addQueryParamsToPath(consentPages[0].path, state.queryParams),
			);
		}
	}),
);

// resend account verification page
router.get('/welcome/resend', (_: Request, res: ResponseWithRequestState) => {
	const html = renderer('/welcome/resend', {
		pageTitle: 'Resend Welcome Email',
		requestState: res.locals,
	});
	res.type('html').send(html);
});

// resend account verification page, session expired
router.get('/welcome/expired', (_: Request, res: ResponseWithRequestState) => {
	const html = renderer('/welcome/expired', {
		pageTitle: 'Resend Welcome Email',
		requestState: res.locals,
	});
	res.type('html').send(html);
});

// POST form handler to resend account verification email
router.post(
	'/welcome/resend',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { useIdapi } = res.locals.queryParams;
		if (okta.enabled && !useIdapi) {
			await OktaResendEmail(req, res);
		} else {
			const { email } = req.body;
			const state = res.locals;
			const { emailSentSuccess } = state.queryParams;

			try {
				await sendAccountVerificationEmail(
					email,
					req.ip,
					state.queryParams,
					state.ophanConfig,
					state.requestId,
				);

				setEncryptedStateCookie(res, { email });

				return res.redirect(
					303,
					addQueryParamsToPath('/welcome/email-sent', res.locals.queryParams, {
						emailSentSuccess,
					}),
				);
			} catch (error) {
				const { message, status } =
					error instanceof ApiError ? error : new ApiError();

				logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
					request_id: state.requestId,
				});

				const html = renderer('/welcome/resend', {
					pageTitle: 'Resend Welcome Email',
					requestState: mergeRequestState(res.locals, {
						globalMessage: {
							error: message,
						},
					}),
				});
				return res.status(status).type('html').send(html);
			}
		}
	}),
);

// email sent page
router.get(
	'/welcome/email-sent',
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;

		const email = readEmailCookie(req);

		const html = renderer('/welcome/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: mergeRequestState(state, {
				pageData: {
					email,
					resendEmailAction: '/welcome/resend',
					changeEmailPage: '/welcome/resend',
				},
			}),
		});
		res.type('html').send(html);
	},
);

// welcome page, check token and display set password page
router.get(
	'/welcome/:token',
	checkPasswordTokenController('/welcome', 'Welcome'),
);

// POST form handler to set password on welcome page
router.post(
	'/welcome/:token',
	setPasswordController('/welcome', 'Welcome', consentPages[0].path),
);

const OktaResendEmail = async (req: Request, res: ResponseWithRequestState) => {
	const { email } = req.body;
	try {
		const state = res.locals;

		if (typeof email !== 'undefined') {
			const user = await register({
				email,
				appClientId: state.queryParams.appClientId,
				request_id: state.requestId,
			});

			trackMetric('OktaWelcomeResendEmail::Success');

			setEncryptedStateCookieForOktaRegistration(res, user);

			return res.redirect(
				303,
				addQueryParamsToPath('/welcome/email-sent', res.locals.queryParams, {
					emailSentSuccess: true,
				}),
			);
		} else
			throw new OktaError({
				message: 'Could not resend welcome email as email was undefined',
			});
	} catch (error) {
		logger.error('Okta Registration resend email failure', error, {
			request_id: res.locals.requestId,
		});

		trackMetric('OktaWelcomeResendEmail::Failure');

		const html = renderer('/welcome/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: deepmerge(res.locals, {
				globalMessage: {
					error: GenericErrors.DEFAULT,
				},
				pageData: {
					email,
					resendEmailAction: '/welcome/resend',
					changeEmailPage: '/welcome/resend',
				},
			}),
		});

		return res.type('html').send(html);
	}
};

export default router.router;
