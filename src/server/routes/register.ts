import { Request } from 'express';
import handleRecaptcha from '@/server/lib/recaptcha';
import {
	readEncryptedStateCookie,
	setEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { register as registerWithOkta } from '@/server/lib/okta/register';
import { renderer } from '@/server/lib/renderer';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { trackMetric } from '@/server/lib/trackMetric';
import { ResponseWithRequestState } from '@/server/models/Express';
import {
	addQueryParamsToPath,
	getPersistableQueryParamsWithoutOktaParams,
} from '@/shared/lib/queryParams';
import { GenericErrors, RegistrationErrors } from '@/shared/model/Errors';
import deepmerge from 'deepmerge';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';
import { redirectIfLoggedIn } from '@/server/lib/middleware/redirectIfLoggedIn';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { mergeRequestState } from '@/server/lib/requestState';
import { UserResponse } from '@/server/models/okta/User';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import { RegistrationLocation } from '@/shared/model/RegistrationLocation';
import {
	challengeResend,
	isChallengeAnswerCompleteLoginResponse,
	validateChallengeAnswerRemediation,
} from '@/server/lib/okta/idx/challenge';
import {
	enroll,
	enrollNewWithEmail,
	validateEnrollNewRemediation,
	validateEnrollRemediation,
} from '@/server/lib/okta/idx/enroll';
import {
	introspect,
	validateIntrospectRemediation,
} from '@/server/lib/okta/idx/introspect';
import { getRegistrationPlatform } from '@/server/lib/registrationPlatform';
import { credentialEnroll } from '@/server/lib/okta/idx/credential';
import { bodyFormFieldsToRegistrationConsents } from '@/server/lib/registrationConsents';
import { startIdxFlow } from '@/server/lib/okta/idx/startIdxFlow';
import { convertExpiresAtToExpiryTimeInMs } from '@/server/lib/okta/idx/shared/convertExpiresAtToExpiryTimeInMs';
import { submitPasscode } from '@/server/lib/okta/idx/shared/submitPasscode';
import { findAuthenticatorId } from '@/server/lib/okta/idx/shared/findAuthenticatorId';
import { handlePasscodeError } from '@/server/lib/okta/idx/shared/errorHandling';

const { passcodesEnabled: passcodesEnabled } = getConfiguration();

router.get(
	'/register',
	redirectIfLoggedIn,
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/register', {
			requestState: res.locals,
			pageTitle: 'Register',
		});
		res.type('html').send(html);
	},
);

router.get(
	'/register/email',
	redirectIfLoggedIn,
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/register/email', {
			requestState: res.locals,
			pageTitle: 'Register With Email',
		});
		res.type('html').send(html);
	},
);

router.get(
	'/register/email-sent',
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const html = renderer('/register/email-sent', {
			requestState: mergeRequestState(state, {
				pageData: {
					email: readEncryptedStateCookie(req)?.email,
				},
			}),
			pageTitle: 'Check Your Inbox',
		});
		res.type('html').send(html);
	},
);

router.post(
	'/register/email-sent/resend',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		await OktaResendEmail(req, res);
	}),
);

router.post(
	'/register',
	handleRecaptcha,
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		await OktaRegistration(req, res);
	}),
);

// Essentially the email-sent page, but for passcode registration
router.get('/register/code', (req: Request, res: ResponseWithRequestState) => {
	const state = res.locals;

	const encryptedState = readEncryptedStateCookie(req);

	if (encryptedState?.email && encryptedState.stateHandle) {
		const html = renderer('/register/email-sent', {
			requestState: mergeRequestState(state, {
				pageData: {
					email: readEncryptedStateCookie(req)?.email,
					timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
						encryptedState.stateHandleExpiresAt,
					),
				},
			}),
			pageTitle: 'Check Your Inbox',
		});
		return res.type('html').send(html);
	}
	return res.redirect(
		303,
		addQueryParamsToPath('/register/email', state.queryParams),
	);
});

// Handler for the passcode input form
router.post(
	'/register/code',
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { code } = req.body;

		const encryptedState = readEncryptedStateCookie(req);

		// make sure we have the encrypted state cookie and the code otherwise redirect to the email registration page
		if (encryptedState?.stateHandle && code) {
			const { stateHandle } = encryptedState;

			try {
				// attempt to answer the passcode challenge, if this fails, it falls through to the catch block where we handle the error
				const challengeAnswerResponse = await submitPasscode({
					passcode: code,
					stateHandle,
					introspectRemediation: 'enroll-authenticator',
					ip: req.ip,
				});

				if (isChallengeAnswerCompleteLoginResponse(challengeAnswerResponse)) {
					throw new OAuthError({
						error: 'invalid_response',
						error_description:
							'Invalid challenge/answer response - got a complete login response',
					});
				}

				// check if the remediation array contains the correct remediation object supplied
				// if it does, then we know that we're in the correct state and the passcode was correct
				validateChallengeAnswerRemediation(
					challengeAnswerResponse,
					'select-authenticator-enroll',
				);

				// if passcode challenge is successful, we can proceed to the next step
				// which is to enroll a password authenticator, as we still need users to set a password for the time being
				// we first look for the password authenticator id deep in the response
				const passwordAuthenticatorId = findAuthenticatorId({
					response: challengeAnswerResponse,
					remediationName: 'select-authenticator-enroll',
					authenticator: 'password',
				});

				if (!passwordAuthenticatorId) {
					throw new OAuthError(
						{
							error: 'idx_error',
							error_description: 'Password authenticator id not found',
						},
						400,
					);
				}

				// start the credential enroll flow
				await credentialEnroll(
					stateHandle,
					{ id: passwordAuthenticatorId, methodType: 'password' },
					req.ip,
				);

				updateEncryptedStateCookie(req, res, {
					passcodeUsed: true,
				});

				// redirect to the password page to set a password
				return res.redirect(
					303,
					addQueryParamsToPath('/welcome/password', res.locals.queryParams),
				);
			} catch (error) {
				// track and log the failure
				logger.error(`IDX API - ${req.path} error:`, error);

				handlePasscodeError({
					error,
					req,
					res,
					emailSentPage: '/register/email-sent',
					expiredPage: '/welcome/expired',
				});

				// if we redirected away during the handlePasscodeError function, we can't redirect again
				if (res.headersSent) {
					return;
				}

				// at this point fall back to the legacy Okta registration flow
			}
		}

		// if we reach this point, redirect back to the email registration page, as something has gone wrong
		return res.redirect(
			303,
			addQueryParamsToPath('/register/email', res.locals.queryParams),
		);
	}),
);

// Route to resend the email for passcode registration
router.post(
	'/register/code/resend',
	handleRecaptcha,
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const encryptedState = readEncryptedStateCookie(req);

		// make sure we have the state handle
		if (encryptedState?.stateHandle) {
			const { stateHandle } = encryptedState;

			try {
				// check the state handle is valid
				const introspectResponse = await introspect(
					{
						stateHandle,
					},
					req.ip,
				);

				// check if the remediation array contains a "enroll-authenticator"	object
				// if it does, then we know the stateHandle is valid and we're in the correct state
				validateIntrospectRemediation(
					introspectResponse,
					'enroll-authenticator',
				);

				// attempt to resend the email
				await challengeResend(stateHandle, req.ip);

				// redirect to the email sent page
				return res.redirect(
					303,
					addQueryParamsToPath('/register/email-sent', res.locals.queryParams, {
						emailSentSuccess: true,
					}),
				);
			} catch (error) {
				// track and log the failure, and fall back to the legacy Okta registration flow if there is an error
				logger.error('IDX API - register/code/resend error:', error);

				if (error instanceof OAuthError) {
					if (error.name === 'idx.session.expired') {
						return res.redirect(
							303,
							addQueryParamsToPath('/welcome/expired', res.locals.queryParams),
						);
					}
				}
			}
		}

		// if we reach this point, redirect back to the email registration page, as something has gone wrong
		return res.redirect(
			303,
			addQueryParamsToPath('/register/email', res.locals.queryParams),
		);
	}),
);

export const setEncryptedStateCookieForOktaRegistration = (
	res: ResponseWithRequestState,
	user: UserResponse,
) => {
	setEncryptedStateCookie(res, {
		email: user.profile.email,
		// We set queryParams here to allow state to be persisted as part of the registration flow,
		// because we are unable to pass these query parameters via the email activation link in Okta email templates
		queryParams: getPersistableQueryParamsWithoutOktaParams(
			res.locals.queryParams,
		),
	});
};

/**
 * @name oktaIdxCreateAccount
 * @description Attempt to create an account for the user using the Okta IDX API, and use passcodes to verify the user.
 *
 * NB. This currently only supports creating account for new users, and verifying them with a passcode.
 * Currently if an existing user who tries to register, will fall back to the legacy Okta registration flow, where they
 * will be sent a link instead to either sign in or reset their password.
 * However the behaviour of this flow should be the same regardless of whether the user is new or existing, in either case
 * they should be sent a passcode to verify their account (for new users), or sign in (existing users).
 * TODO: This flow SHOULD be updated to support existing users in the future, once we have finished implementing passcodes
 * for sign in and reset password flows.
 *
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @returns {Promise<void | ResponseWithRequestState>}
 */
const oktaIdxCreateAccount = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email = '' } = req.body;

	const {
		queryParams: { appClientId },
	} = res.locals;

	const consents = bodyFormFieldsToRegistrationConsents(req.body);

	const registrationLocation: RegistrationLocation | undefined =
		getRegistrationLocation(req);

	try {
		const introspectResponse = await startIdxFlow({
			req,
			res,
			authorizationCodeFlowOptions: {
				confirmationPagePath: '/welcome/review',
			},
			consents,
		});

		// check if we have the `select-enroll-profile` remediation property which means registration is allowed
		validateIntrospectRemediation(introspectResponse, 'select-enroll-profile');

		// call the enroll endpoint to attempt to start the registration process
		const enrollResponse = await enroll(introspectResponse.stateHandle, req.ip);

		// if we don't have the `enroll-profile` remediation property
		// throw an error and fall back to the legacy Okta registration flow
		validateEnrollRemediation(enrollResponse, 'enroll-profile');

		// call the enroll/new endpoint to attempt to register the user with email
		const enrollNewWithEmailResponse = await enrollNewWithEmail(
			enrollResponse.stateHandle,
			{
				email,
				isGuardianUser: true,
				registrationLocation: registrationLocation,
				registrationPlatform: await getRegistrationPlatform(appClientId),
			},
			req.ip,
		);

		// we need to check if the email has been sent to the user, or if
		// we need to select an authenticator to enroll
		const hasSelectAuthenticator = validateEnrollNewRemediation(
			enrollNewWithEmailResponse,
			'select-authenticator-enroll',
			false,
		);

		// if we have the `select-authenticator-enroll` remediation property
		// we need to handle this by selecting the authenticator email
		// to send the passcode to the user
		if (hasSelectAuthenticator) {
			const emailAuthenticatorId = findAuthenticatorId({
				response: enrollNewWithEmailResponse,
				remediationName: 'select-authenticator-enroll',
				authenticator: 'email',
			});

			if (!emailAuthenticatorId) {
				throw new OAuthError(
					{
						error: 'idx_error',
						error_description: 'Email authenticator id not found',
					},
					400,
				);
			}

			// start the credential enroll flow
			await credentialEnroll(
				enrollNewWithEmailResponse.stateHandle,
				{ id: emailAuthenticatorId, methodType: 'email' },
				req.ip,
			);
		}

		// at this point the user will have been sent an email with a passcode

		// set the encrypted state cookie to persist the email and stateHandle
		setEncryptedStateCookie(res, {
			email,
			stateHandle: enrollNewWithEmailResponse.stateHandle,
			stateHandleExpiresAt: enrollNewWithEmailResponse.expiresAt,
		});

		// fire ophan component event if applicable
		if (res.locals.queryParams.componentEventParams) {
			void sendOphanComponentEventFromQueryParamsServer(
				res.locals.queryParams.componentEventParams,
				'CREATE_ACCOUNT',
				'web',
				res.locals.ophanConfig.consentUUID,
			);
		}

		trackMetric('OktaIDXRegister::Success');

		// redirect to the email sent page
		return res.redirect(
			303,
			addQueryParamsToPath('/register/email-sent', res.locals.queryParams),
		);
	} catch (error) {
		if (error instanceof OAuthError) {
			if (error.name === 'registration.error.notUniqueWithinOrg') {
				// case for user already exists
				// will implement when full passwordless is implemented
			}
		}

		// track and log the failure, and fall back to the legacy Okta registration flow if there is an error
		trackMetric('OktaIDXRegister::Failure');
		logger.error('IDX API - registration error:', error);
	}
};

export const OktaRegistration = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email = '' } = req.body;

	const {
		queryParams: { appClientId, ref, refViewId, useOktaClassic },
	} = res.locals;

	const consents = bodyFormFieldsToRegistrationConsents(req.body);

	const registrationLocation: RegistrationLocation | undefined =
		getRegistrationLocation(req);

	// OKTA IDX API FLOW
	// Attempt to register the user with Okta using the IDX API
	// and specifically using passcodes.
	// If there are specific failures, we fall back to the legacy Okta registration flow
	if (passcodesEnabled && !useOktaClassic) {
		// try to start the IDX flow to create an account for the user
		await oktaIdxCreateAccount(req, res);

		// if successful, the user will be redirected to the email sent page
		// so we need to check if the headers have been sent to prevent further processing
		if (res.headersSent) {
			return;
		}
	}

	try {
		const user = await registerWithOkta({
			email,
			registrationLocation,
			appClientId,
			consents,
			ref,
			refViewId,
			ip: req.ip,
		});

		// fire ophan component event if applicable
		if (res.locals.queryParams.componentEventParams) {
			void sendOphanComponentEventFromQueryParamsServer(
				res.locals.queryParams.componentEventParams,
				'CREATE_ACCOUNT',
				'web',
				res.locals.ophanConfig.consentUUID,
			);
		}

		setEncryptedStateCookie(res, {
			email: user.profile.email,
			// We set queryParams here to allow state to be persisted as part of the registration flow,
			// because we are unable to pass these query parameters via the email activation link in Okta email templates
			queryParams: getPersistableQueryParamsWithoutOktaParams(
				res.locals.queryParams,
			),
		});

		trackMetric('OktaRegistration::Success');

		return res.redirect(
			303,
			addQueryParamsToPath('/register/email-sent', res.locals.queryParams),
		);
	} catch (error) {
		logger.error('Okta Registration failure', error);

		const errorMessage = () => {
			if (
				error instanceof OktaError &&
				causesInclude(error.causes, 'email: Does not match required pattern')
			) {
				return RegistrationErrors.EMAIL_INVALID;
			} else {
				return RegistrationErrors.GENERIC;
			}
		};

		trackMetric('OktaRegistration::Failure');

		const requestState = deepmerge(res.locals, {
			pageData: {
				email,
				formError: errorMessage(),
			},
		});

		return res.type('html').send(
			renderer('/register/email', {
				requestState,
				pageTitle: 'Register With Email',
			}),
		);
	}
};

const OktaResendEmail = async (req: Request, res: ResponseWithRequestState) => {
	try {
		const encryptedState = readEncryptedStateCookie(req);
		const { email, queryParams } = encryptedState ?? {};

		if (typeof email !== 'undefined') {
			// Always attempt to register the user first when their email is resent.
			// If the user doesn't exist, this creates them and Okta sends them an email.
			// If the user does exist, this returns an error and we send them an email
			// as part of the registerWithOkta function's error handler.
			const user = await registerWithOkta({
				email,
				appClientId: queryParams?.appClientId,
				ref: queryParams?.ref,
				refViewId: queryParams?.refViewId,
				ip: req.ip,
			});
			trackMetric('OktaRegistrationResendEmail::Success');
			setEncryptedStateCookieForOktaRegistration(res, user);
			return res.redirect(
				303,
				addQueryParamsToPath('/register/email-sent', res.locals.queryParams, {
					emailSentSuccess: true,
				}),
			);
		} else {
			throw new OktaError({
				message: 'Could not resend registration email as email was undefined',
			});
		}
	} catch (error) {
		logger.error('Okta Registration resend email failure', error);

		trackMetric('OktaRegistrationResendEmail::Failure');

		return res.type('html').send(
			renderer('/register/email-sent', {
				pageTitle: 'Check Your Inbox',
				requestState: mergeRequestState(res.locals, {
					pageData: {
						formError: GenericErrors.DEFAULT,
					},
				}),
			}),
		);
	}
};

export default router.router;
