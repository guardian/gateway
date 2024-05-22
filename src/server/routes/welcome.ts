import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendAccountVerificationEmail } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/serverSideLogger';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { ApiError } from '@/server/models/Error';
import {
	RequestState,
	ResponseWithRequestState,
} from '@/server/models/Express';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import deepmerge from 'deepmerge';
import { Request } from 'express';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { register } from '@/server/lib/okta/register';
import { trackMetric } from '@/server/lib/trackMetric';
import { OktaError } from '@/server/models/okta/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { setEncryptedStateCookieForOktaRegistration } from '@/server/routes/register';
import { mergeRequestState } from '@/server/lib/requestState';
import { loginMiddlewareOAuth } from '@/server/lib/middleware/login';
import { CONSENTS_DATA_PAGE } from '@/shared/model/Consent';
import {
	update as patchConsents,
	getConsentValueFromRequestBody,
	getUserConsentsForPage,
	update as updateConsents,
} from '@/server/lib/idapi/consents';
import { update as updateNewsletters } from '@/server/lib/idapi/newsletters';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { updateRegistrationPlatform } from '@/server/lib/registrationPlatform';
import { getAppName, isAppPrefix } from '@/shared/lib/appNameUtils';
import { bodyFormFieldsToRegistrationConsents } from '@/server/lib/registrationConsents';
import { ALL_NEWSLETTER_IDS } from '@/shared/model/Newsletter';

import {
	updateRegistrationLocationViaIDAPI,
	updateRegistrationLocationViaOkta,
} from '@/server/lib/updateRegistrationLocation';
import {
	NewsletterMap,
	getUserNewsletterSubscriptions,
} from '@/server/lib/newsletters';
import { getNextWelcomeFlowPage } from '@/server/lib/welcome';
import { newslettersSubscriptionsFromFormBody } from '@/shared/lib/newsletter';

const { okta } = getConfiguration();

// temp return to app page for app users who get stuck in browser
router.get(
	'/welcome/:app/complete',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const { app } = req.params;

		const html = renderer('/welcome/:app/complete', {
			pageTitle: 'Welcome',
			requestState: mergeRequestState(res.locals, {
				pageData: {
					// email is type unknown, but we know it's a string
					email: res.locals.oauthState.idToken?.claims.email as string,
					appName: isAppPrefix(app) ? getAppName(app) : undefined,
				},
			}),
		});
		return res.type('html').send(html);
	},
);

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
			const registrationConsents = bodyFormFieldsToRegistrationConsents(
				req.body,
			);

			// update the registration platform for social users, as we're not able to do this
			// at the time of registration, as that happens in Okta
			await updateRegistrationPlatform(
				state.oauthState.accessToken!,
				state.queryParams.appClientId,
				state.requestId,
			);

			const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';

			// update the consents and go to the finally block
			if (registrationConsents.consents?.length) {
				try {
					await updateConsents({
						ip: req.ip,
						accessToken: state.oauthState.accessToken?.toString(),
						payload: registrationConsents.consents,
						request_id: res.locals.requestId,
					});

					// since the CODE newsletters API isn't up to date with PROD newsletters API the
					// review page will not show the correct newsletters on CODE.
					// so when running in cypress we set a cookie to return the decrypted consents to cypress
					// so we can check we at least got to the correct code path
					if (runningInCypress) {
						res.cookie(
							'cypress-consent-response',
							JSON.stringify(registrationConsents.consents),
						);
					}
				} catch (error) {
					logger.error(
						'Error updating registration consents on welcome social',
						{
							error,
						},
						{
							request_id: res.locals.requestId,
						},
					);
				}
			}

			if (registrationConsents.newsletters?.length) {
				try {
					await updateNewsletters({
						ip: req.ip,
						accessToken: state.oauthState.accessToken?.toString(),
						payload: registrationConsents.newsletters,
						request_id: res.locals.requestId,
					});
					// since the CODE newsletters API isn't up to date with PROD newsletters API the
					// review page will not show the correct newsletters on CODE.
					// so when running in cypress we set a cookie to return the decrypted consents to cypress
					// so we can check we at least got to the correct code path
					if (runningInCypress) {
						res.cookie(
							'cypress-newsletter-response',
							JSON.stringify(registrationConsents.newsletters),
						);
					}
				} catch (error) {
					logger.error(
						'Error updating registration newsletters on welcome social',
						{
							error,
						},
						{
							request_id: res.locals.requestId,
						},
					);
				}
			}
		} catch (error) {
			// we don't want to block the user at this point, so we'll just log the error, and go to the finally block
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});
		} finally {
			// otherwise redirect the user to the review page
			return res.redirect(
				303,
				addQueryParamsToPath('/welcome/review', state.queryParams),
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

router.get(
	'/welcome/review',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		// eslint-disable-next-line functional/no-let
		let state = res.locals;
		const sc_gu_u = req.cookies.SC_GU_U;

		try {
			const consentsData = {
				consents: await getUserConsentsForPage({
					pageConsents: CONSENTS_DATA_PAGE,
					ip: req.ip,
					sc_gu_u,
					request_id: res.locals.requestId,
					accessToken: res.locals.oauthState.accessToken?.toString(),
				}),
			};

			state = mergeRequestState(state, {
				pageData: {
					...consentsData,
				},
			} as RequestState);

			trackMetric('NewAccountReview::Success');
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			const { message } = error instanceof ApiError ? error : new ApiError();

			state = mergeRequestState(state, {
				globalMessage: {
					error: message,
				},
			});

			trackMetric('NewAccountReview::Failure');
		}

		const html = renderer('/welcome/review', {
			pageTitle: 'Your data',
			requestState: state,
		});
		return res.type('html').send(html);
	}),
);

router.get(
	'/welcome/newsletters',
	loginMiddlewareOAuth,
	async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const geolocation = state.pageData.geolocation;
		const newsletters = await getUserNewsletterSubscriptions({
			newslettersOnPage: NewsletterMap.get(geolocation) as string[],
			ip: req.ip,
			sc_gu_u: req.cookies.SC_GU_U,
			request_id: state.requestId,
			accessToken: state.oauthState.accessToken?.toString(),
		});

		const html = renderer('/welcome/newsletters', {
			pageTitle: 'Choose Newsletters',
			requestState: mergeRequestState(state, {
				pageData: {
					newsletters,
				},
			}),
		});
		res.type('html').send(html);
	},
);

router.post(
	'/welcome/review',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { returnUrl, fromURI } = state.queryParams;

		const sc_gu_u = req.cookies.SC_GU_U;

		try {
			// Attempt to update location for consented users.
			if (res.locals.oauthState.accessToken) {
				await updateRegistrationLocationViaOkta(
					req,
					res.locals.oauthState.accessToken,
				);
			} else {
				await updateRegistrationLocationViaIDAPI(req.ip, sc_gu_u, req);
			}

			const consents = CONSENTS_DATA_PAGE.map((id) => ({
				id,
				consented: getConsentValueFromRequestBody(id, req.body),
			}));

			await patchConsents({
				ip: req.ip,
				sc_gu_u,
				accessToken: res.locals.oauthState.accessToken?.toString(),
				payload: consents,
				request_id: res.locals.requestId,
			});

			trackMetric('NewAccountReviewSubmit::Success');
		} catch (error) {
			// Never block the user at this point, so we'll just log the error
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			trackMetric('NewAccountReviewSubmit::Failure');
		} finally {
			const nextPage = getNextWelcomeFlowPage({
				geolocation: state.pageData.geolocation,
				fromURI,
				returnUrl,
				queryParams: state.queryParams,
			});
			return res.redirect(303, nextPage);
		}
	}),
);

router.post(
	'/welcome/newsletters',
	async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { returnUrl } = state.queryParams;

		try {
			const userNewsletterSubscriptions = await getUserNewsletterSubscriptions({
				newslettersOnPage: ALL_NEWSLETTER_IDS,
				ip: req.ip,
				sc_gu_u: req.cookies.SC_GU_U,
				request_id: state.requestId,
				accessToken: state.oauthState.accessToken?.toString(),
			});

			// get a list of newsletters to update that have changed from the users current subscription
			// if they have changed then set them to subscribe/unsubscribe
			const newsletterSubscriptionsToUpdate =
				newslettersSubscriptionsFromFormBody(req.body).filter(
					(newSubscription) => {
						// find current user subscription status for a newsletter
						const currentSubscription = userNewsletterSubscriptions.find(
							({ id: userNewsletterId }) =>
								userNewsletterId === newSubscription.id,
						);

						// check if a subscription exists
						if (currentSubscription) {
							if (
								// previously subscribed AND now wants to unsubscribe
								(currentSubscription.subscribed &&
									!newSubscription.subscribed) ||
								// OR previously not subscribed AND wants to subscribe
								(!currentSubscription.subscribed && newSubscription.subscribed)
							) {
								// then include in newsletterSubscriptionsToUpdate
								return true;
							}
						}

						// otherwise don't include in the update
						return false;
					},
				);

			await updateNewsletters({
				ip: req.ip,
				sc_gu_u: req.cookies.SC_GU_U,
				request_id: state.requestId,
				accessToken: state.oauthState.accessToken?.toString(),
				payload: newsletterSubscriptionsToUpdate,
			});

			trackMetric('NewAccountNewslettersSubmit::Success');
		} catch (error) {
			// Never block the user at this point, so we'll just log the error
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});
			trackMetric('NewAccountNewslettersSubmit::Failure');
		} finally {
			return res.redirect(303, returnUrl);
		}
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
	setPasswordController('/welcome', 'Welcome', '/welcome/review'),
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
