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
import {
	GatewayError,
	GenericErrors,
	PasscodeErrors,
	RegistrationErrors,
} from '@/shared/model/Errors';
import deepmerge from 'deepmerge';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';
import { redirectIfLoggedIn } from '@/server/lib/middleware/redirectIfLoggedIn';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { mergeRequestState } from '@/server/lib/requestState';
import { UserResponse } from '@/server/models/okta/User';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
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
import {
	skipPasswordEnrollment,
	submitPasscode,
} from '@/server/lib/okta/idx/shared/submitPasscode';
import { findAuthenticatorId } from '@/server/lib/okta/idx/shared/findAuthenticatorId';
import { handlePasscodeError } from '@/server/lib/okta/idx/shared/errorHandling';
import {
	oktaIdxApiSignInPasscodeController,
	oktaIdxApiSubmitPasscodeController,
} from '@/server/controllers/signInControllers';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { getRoutePathFromUrl } from '@/shared/model/Routes';

const { passcodesEnabled: passcodesEnabled } = getConfiguration();

/**
 * Helper method to determine if a global error should show on the create account page
 * and return a user facing error if so
 * if there's no error it returns undefined
 * @param error - error query parameter
 * @param error_description - error_description query parameter
 * @returns string | undefined - user facing error message
 */
const getErrorMessageFromQueryParams = (
	error?: string,
	error_description?: string,
) => {
	// Show error if passcode expired
	if (error === PasscodeErrors.PASSCODE_EXPIRED) {
		return PasscodeErrors.PASSCODE_EXPIRED;
	}

	// We propagate a generic error message when we don't know what the exact error is
	// This error will also include a request id, so users can contact us with this information
	if (error_description) {
		return GenericErrors.DEFAULT;
	}
};

router.get(
	'/register',
	redirectIfLoggedIn,
	(_: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { error, error_description } = state.queryParams;

		const html = renderer('/register', {
			requestState: mergeRequestState(state, {
				globalMessage: {
					error: getErrorMessageFromQueryParams(error, error_description),
				},
			}),
			pageTitle: 'Register',
		});
		res.type('html').send(html);
	},
);

router.get(
	'/print-promo',
	redirectIfLoggedIn,
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const html = renderer('/print-promo', {
			requestState: mergeRequestState(state, {
				pageData: {},
				queryParams: {
					...state.queryParams,
					clientId: 'printpromo',
				},
			}),
			pageTitle: 'Register',
		});
		return res.type('html').send(html);
	},
);

router.get(
	'/register/email',
	redirectIfLoggedIn,
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { error, error_description } = state.queryParams;

		const html = renderer('/register/email', {
			pageTitle: 'Register With Email',
			requestState: mergeRequestState(state, {
				pageData: {
					email: readEmailCookie(req),
				},
				globalMessage: {
					error: getErrorMessageFromQueryParams(error, error_description),
				},
			}),
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
		await oktaRegistrationOrSignin(req, res);
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
		await registerPasscodeHandler(req, res);
	}),
);

// Handler for the passcode expired redirect
router.get(
	'/register/code/expired',
	(_: Request, res: ResponseWithRequestState) => {
		return res.redirect(
			303,
			addQueryParamsToPath('/register/email', res.locals.queryParams, {
				error: PasscodeErrors.PASSCODE_EXPIRED,
			}),
		);
	},
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
			const { stateHandle, userState } = encryptedState;

			// if the user is not in the NON_ACTIVE state, we know they're an existing user
			// going through the create account flow, so we use the oktaIdxApiSignInPasscodeController
			// instead of the flow for new users
			if (userState && userState !== 'NOT_ACTIVE') {
				return oktaIdxApiSignInPasscodeController({
					req,
					res,
					confirmationPagePath: '/welcome/existing',
				});
			}

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
					addQueryParamsToPath('/passcode', res.locals.queryParams, {
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
 * @name oktaIdxCreateAccountOrSignIn
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
const oktaIdxCreateAccountOrSignIn = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email = '', isCombinedSigninAndRegisterFlow = false } = req.body;

	const {
		queryParams: { appClientId },
	} = res.locals;

	const consents = bodyFormFieldsToRegistrationConsents(req.body);

	const [registrationLocation, registrationLocationState] =
		getRegistrationLocation(req);

	try {
		const introspectResponse = await startIdxFlow({
			req,
			res,
			authorizationCodeFlowOptions: {
				confirmationPagePath: isCombinedSigninAndRegisterFlow
					? '/welcome/complete-account'
					: '/welcome/review',
				extraData: {
					flow: 'create-account',
					appLabel: res.locals.appLabel,
				},
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
				registrationLocation,
				registrationLocationState,
				registrationPlatform: await getRegistrationPlatform(appClientId),
			},
			req.ip,
		);

		// We first check if the `enroll-authenticator` remediation is present
		// and that the current authenticator is set to "email"
		// In this scenario, if both are present, then the "password" authenticator
		// in Okta is set to "optional" and the "email" authenticator is set
		// to "required" in the Okta settings.
		// This means that since "email" is the only authenticator that is set to "required",
		// it will automatically select the "email" authenticator and send the user a passcode.
		// In which case we can skip the `select-authenticator-enroll` remediation to
		// manually select the "email" authenticator.
		const hasEnrollAuthenticator = validateEnrollNewRemediation(
			enrollNewWithEmailResponse,
			'enroll-authenticator',
			false,
		);
		const currentAuthenticatorIsEmail =
			enrollNewWithEmailResponse.currentAuthenticator?.value.type === 'email';

		// We also need to check for the 'select-authenticator-enroll' remediation next
		// If it exists, and hasEnrollAuthenticator and currentAuthenticatorIsEmail don't,
		// then that means that both the "password" and "email" authenticator is set to
		// "required" in the Okta settings, and we need to manually select the "email"
		// authenticator to verify their account before they set a password.
		const hasSelectAuthenticator = validateEnrollNewRemediation(
			enrollNewWithEmailResponse,
			'select-authenticator-enroll',
			false,
		);

		// if we have the `select-authenticator-enroll` remediation property
		// and we don't have the `enroll-authenticator` remediation property
		// we need to handle this by selecting the authenticator email
		// to send the passcode to the user
		if (
			hasSelectAuthenticator &&
			!(hasEnrollAuthenticator && currentAuthenticatorIsEmail)
		) {
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

		// at this point the user will have been sent an email with a passcode,
		// either by the `enroll-authenticator` or `select-authenticator-enroll` remediation

		// set the encrypted state cookie to persist the email and stateHandle
		setEncryptedStateCookie(res, {
			email,
			stateHandle: enrollNewWithEmailResponse.stateHandle,
			stateHandleExpiresAt: enrollNewWithEmailResponse.expiresAt,
			userState: 'NOT_ACTIVE', // lets us know that the user is a new user
			signInOrRegister: 'REGISTER',
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
			addQueryParamsToPath('/passcode', res.locals.queryParams),
		);
	} catch (error) {
		if (error instanceof OAuthError) {
			if (error.name === 'registration.error.notUniqueWithinOrg') {
				// case for user already exists
				// will implement when full passwordless is implemented
				trackMetric('ExistingUserInCreateAccountFlow');

				// instead we use the passcode sign in controller, and redirect to /welcome/existing at the end
				return oktaIdxApiSignInPasscodeController({
					req,
					res,
					confirmationPagePath: '/welcome/existing',
				});
			}
		}

		// track and log the failure, and fall back to the legacy Okta registration flow if there is an error
		trackMetric('OktaIDXRegister::Failure');
		logger.error('IDX API - registration error:', error);
	}
};

export const registerPasscodeHandler = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { code } = req.body;

	const encryptedState = readEncryptedStateCookie(req);

	// make sure we have the encrypted state cookie and the code otherwise redirect to the email registration page
	if (encryptedState?.stateHandle && code) {
		const { stateHandle, userState } = encryptedState;

		try {
			// if the user is not in the NON_ACTIVE state, we know they're an existing user
			// going through the create account flow, so we use the oktaIdxApiSubmitPasscodeController
			// instead of the flow for new users
			if (userState && userState !== 'NOT_ACTIVE') {
				return oktaIdxApiSubmitPasscodeController({
					req,
					res,
					emailSentPage: '/passcode',
					expiredPage: '/register/code/expired',
				});
			}

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

			// We can now decide whether to set a password or not, and thus make a passwordless user
			// We should:
			// - If the `skip` schema is present, we always use that, and allow the user to manually set a password
			// if they want to
			// - If the `skip` schema is not present, we can check if the password authenticator is required,
			// and always ask the user to set a password
			// This is dependent on the "password" authenticator either being set to "optional" or "required" respectively

			const hasSkipSchema = validateChallengeAnswerRemediation(
				challengeAnswerResponse,
				'skip',
				false,
			);

			// if the skip schema is present, we know that the user can skip setting a password and we
			// can give the user the option to set a password or not
			// We also check the `useSetPassword` query param to see if we should force the user to set a password
			// which is useful for testing and checking previous behaviour
			if (hasSkipSchema && !res.locals.queryParams.useSetPassword) {
				return skipPasswordEnrollment({
					stateHandle,
					expressReq: req,
					expressRes: res,
					ip: req.ip,
				});
			}

			// If we don't have the skip schema, we have to have the user set a password
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
				emailSentPage: '/passcode',
				expiredPage: '/register/code/expired',
			});

			// if we redirected away during the handlePasscodeError function, we can't redirect again
			if (res.headersSent) {
				return;
			}
		}
	}

	// if we reach this point, redirect back to the email registration reference page
	// (either /register/email or /signin), as something has gone wrong
	const redirectPath =
		getRoutePathFromUrl(res.locals.queryParams.ref) || '/signin';
	return res.redirect(
		303,
		addQueryParamsToPath(redirectPath, res.locals.queryParams),
	);
};

export const oktaRegistrationOrSignin = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email = '' } = req.body;

	const {
		queryParams: { appClientId, ref, refViewId, useOktaClassic },
	} = res.locals;

	const consents = bodyFormFieldsToRegistrationConsents(req.body);

	const [registrationLocation] = getRegistrationLocation(req);

	// OKTA IDX API FLOW
	// Attempt to register the user with Okta using the IDX API
	// and specifically using passcodes.
	// If there are specific failures, we fall back to the legacy Okta registration flow
	if (passcodesEnabled && !useOktaClassic) {
		// try to start the IDX flow to create an account for the user
		await oktaIdxCreateAccountOrSignIn(req, res);

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
			addQueryParamsToPath('/passcode', res.locals.queryParams),
		);
	} catch (error) {
		logger.error('Okta Registration failure', error);

		const errorMessage = (): GatewayError => {
			if (
				error instanceof OktaError &&
				causesInclude(error.causes, 'email: Does not match required pattern')
			) {
				return {
					message: RegistrationErrors.EMAIL_INVALID,
					severity: 'BAU',
				};
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
				addQueryParamsToPath('/passcode', res.locals.queryParams, {
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
			renderer('/passcode', {
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
