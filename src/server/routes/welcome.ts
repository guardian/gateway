import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { ApiError } from '@/server/models/Error';
import {
	RequestState,
	ResponseWithRequestState,
} from '@/server/models/Express';
import {
	addQueryParamsToPath,
	addQueryParamsToUntypedPath,
} from '@/shared/lib/queryParams';
import deepmerge from 'deepmerge';
import { Request } from 'express';
import { register } from '@/server/lib/okta/register';
import { trackMetric } from '@/server/lib/trackMetric';
import { OktaError } from '@/server/models/okta/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	oktaRegistrationOrSignin,
	setEncryptedStateCookieForOktaRegistration,
} from '@/server/routes/register';
import { mergeRequestState } from '@/server/lib/requestState';
import { loginMiddlewareOAuth } from '@/server/lib/middleware/login';
import {
	CONSENTS_DATA_PAGE,
	getRegistrationConsentsList,
} from '@/shared/model/Consent';
import {
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
	NewsletterMap,
	getUserNewsletterSubscriptions,
} from '@/server/lib/newsletters';
import { newslettersSubscriptionsFromFormBody } from '@/shared/lib/newsletter';
import { requestStateHasOAuthTokens } from '../lib/middleware/requestState';
import { readEncryptedStateCookie } from '../lib/encryptedStateCookie';
import { RegistrationConsents } from '@/shared/model/RegistrationConsents';

const { passcodesEnabled: passcodesEnabled, signInPageUrl } =
	getConfiguration();

// temp return to app page for app users who get stuck in browser
router.get(
	'/welcome/:app/complete',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { app } = req.params;
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		const html = renderer('/welcome/:app/complete', {
			pageTitle: 'Welcome',
			requestState: mergeRequestState(state, {
				pageData: {
					// email is type unknown, but we know it's a string
					email: state.oauthState.idToken.claims.email as string,
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
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		try {
			// update the registration platform for social users, as we're not able to do this
			// at the time of registration, as that happens in Okta
			await updateRegistrationPlatform({
				accessToken: state.oauthState.accessToken,
				appClientId: state.queryParams.appClientId,
				ip: req.ip,
			});

			const registrationConsents = bodyFormFieldsToRegistrationConsents(
				req.body,
			);
			await updateNewslettersAndConstents(registrationConsents, res, 'social');

			// update the consents and go to the finally block
		} catch (error) {
			// we don't want to block the user at this point, so we'll just log the error, and go to the finally block
			logger.error(`${req.method} ${req.originalUrl}  Error`, error);
		} finally {
			// otherwise redirect the user to the review page
			// eslint-disable-next-line no-unsafe-finally -- we want to redirect and return regardless of any throws
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
		await OktaResendEmail(req, res);
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
	'/welcome/complete-account',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;

		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		const encrypedCookieState = readEncryptedStateCookie(req);

		const html = renderer('/welcome/complete-account', {
			pageTitle: 'Complete your account',
			requestState: mergeRequestState(state, {
				pageData: {
					email: encrypedCookieState?.email,
				},
			}),
		});

		return res.type('html').send(html);
	},
);

router.post(
	'/welcome/complete-account',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;

		try {
			const registrationConsents = bodyFormFieldsToRegistrationConsents(
				req.body,
			);

			// update the consents and go to the finally block
			await updateNewslettersAndConstents(
				registrationConsents,
				res,
				'complete-account-post',
			);
		} catch (error) {
			// we don't want to block the user at this point, so we'll just log the error, and go to the finally block
			logger.error(`${req.method} ${req.originalUrl}  Error`, error);
		} finally {
			// eslint-disable-next-line no-unsafe-finally -- we want to redirect and return regardless of any throws
			return res.redirect(
				303,
				addQueryParamsToPath('/welcome/review', state.queryParams),
			);
		}
	}),
);

router.get(
	'/welcome/review',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		// eslint-disable-next-line functional/no-let -- the state will be updated depending on the outcome of the try/catch, TODO: potential for refactor to avoid let?
		let state = res.locals;

		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		try {
			const consentsData = {
				consents: await getUserConsentsForPage({
					pageConsents: CONSENTS_DATA_PAGE,
					accessToken: state.oauthState.accessToken.toString(),
				}),
			};

			state = mergeRequestState(state, {
				pageData: {
					...consentsData,
				},
			} as RequestState);

			trackMetric('NewAccountReview::Success');
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error);

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
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		const { returnUrl } = state.queryParams;
		const geolocation = state.pageData.geolocation;
		const newsletters = await getUserNewsletterSubscriptions({
			newslettersOnPage: NewsletterMap.get(geolocation) as string[],
			accessToken: state.oauthState.accessToken.toString(),
		});

		if (newsletters?.length === 0) {
			return res.redirect(303, returnUrl);
		}

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
	'/welcome/newsletters',
	loginMiddlewareOAuth,
	async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}
		const { returnUrl } = state.queryParams;

		try {
			const userNewsletterSubscriptions = await getUserNewsletterSubscriptions({
				newslettersOnPage: ALL_NEWSLETTER_IDS,
				accessToken: state.oauthState.accessToken.toString(),
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
				accessToken: state.oauthState.accessToken.toString(),
				payload: newsletterSubscriptionsToUpdate,
			});

			trackMetric('NewAccountNewslettersSubmit::Success');
		} catch (error) {
			// Never block the user at this point, so we'll just log the error
			logger.error(`${req.method} ${req.originalUrl}  Error`, error);
			trackMetric('NewAccountNewslettersSubmit::Failure');
		} finally {
			// eslint-disable-next-line no-unsafe-finally -- we want to redirect and return regardless of any throws
			return res.redirect(303, returnUrl);
		}
	},
);

// existing user using create account flow page
router.get(
	'/welcome/existing',
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/welcome/existing', {
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email: readEmailCookie(req),
				},
			}),
			pageTitle: 'Welcome back',
		});
		return res.type('html').send(html);
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
	const state = res.locals;
	// if registration passcodes are enabled, we need to handle this differently
	// by using the passcode registration flow
	if (passcodesEnabled && !state.queryParams.useOktaClassic) {
		return oktaRegistrationOrSignin(req, res);
	}

	const { email } = req.body;

	try {
		if (typeof email !== 'undefined') {
			const user = await register({
				email,
				appClientId: state.queryParams.appClientId,
				ip: req.ip,
			});

			trackMetric('OktaWelcomeResendEmail::Success');

			setEncryptedStateCookieForOktaRegistration(res, user);

			return res.redirect(
				303,
				addQueryParamsToPath('/welcome/email-sent', state.queryParams, {
					emailSentSuccess: true,
				}),
			);
		} else {
			throw new OktaError({
				message: 'Could not resend welcome email as email was undefined',
			});
		}
	} catch (error) {
		logger.error('Okta Registration resend email failure', error);

		trackMetric('OktaWelcomeResendEmail::Failure');

		const html = renderer('/welcome/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: deepmerge(state, {
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

const updateNewslettersAndConstents = async (
	registrationConsents: RegistrationConsents,
	res: ResponseWithRequestState,
	loggingContext: string,
) => {
	const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';
	const state = res.locals;

	if (!state.oauthState) {
		return;
	}

	if (registrationConsents.consents?.length) {
		try {
			await updateConsents({
				accessToken: state.oauthState.accessToken.toString(),
				payload: registrationConsents.consents,
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
				`Error updating registration consents on welcome ${loggingContext}`,
				{
					error,
				},
			);
		}
	}

	if (registrationConsents.newsletters?.length) {
		try {
			await updateNewsletters({
				accessToken: state.oauthState.accessToken.toString(),
				payload: registrationConsents.newsletters,
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
				`Error updating registration newsletters on welcome ${loggingContext}`,
				{
					error,
				},
			);
		}
	}
};

export default router.router;
