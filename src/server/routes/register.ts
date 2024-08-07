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
	challengeAnswerPasscode,
	challengeResend,
} from '@/server/lib/okta/idx/challenge';
import { enroll, enrollNewWithEmail } from '@/server/lib/okta/idx/enroll';
import { interact } from '@/server/lib/okta/idx/interact';
import {
	introspect,
	validateIntrospectRemediation,
} from '@/server/lib/okta/idx/introspect';
import {
	updateAuthorizationStateData,
	setAuthorizationStateCookie,
} from '@/server/lib/okta/openid-connect';
import { getRegistrationPlatform } from '@/server/lib/registrationPlatform';
import { credentialEnroll } from '@/server/lib/okta/idx/credential';
import {
	bodyFormFieldsToRegistrationConsents,
	encryptRegistrationConsents,
} from '@/server/lib/registrationConsents';
import {
	convertExpiresAtToExpiryTimeInMs,
	selectAuthenticationEnrollSchema,
} from '@/server/lib/okta/idx/shared';

const { registrationPasscodesEnabled } = getConfiguration();

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
		const { requestId } = res.locals;
		const { code } = req.body;

		const encryptedState = readEncryptedStateCookie(req);

		// make sure we have the encrypted state cookie and the code otherwise redirect to the email registration page
		if (encryptedState?.stateHandle && code) {
			const { stateHandle } = encryptedState;

			try {
				// validate the code contains only numbers and is 6 characters long
				// The okta api will validate the input fully, but validating here will prevent unnecessary requests
				if (!/^\d{6}$/.test(code)) {
					throw new OAuthError(
						{
							error: 'api.authn.error.PASSCODE_INVALID',
							error_description: 'Passcode invalid', // this is ignored, and a error based on the `error` key is shown
						},
						400,
					);
				}

				// check the state handle is valid and we can proceed with the registration
				const introspectResponse = await introspect(
					{
						stateHandle,
					},
					requestId,
				);

				// check if the remediation array contains a "enroll-authenticator"	object
				// if it does, then we know the stateHandle is valid and we're in the correct state
				validateIntrospectRemediation(
					introspectResponse,
					'enroll-authenticator',
				);

				// attempt to answer the passcode challenge, if this fails, it falls through to the catch block where we handle the error
				const challengeAnswerResponse = await challengeAnswerPasscode(
					stateHandle,
					{ passcode: code },
					requestId,
				);

				// if passcode challenge is successful, we can proceed to the next step
				// which is to enroll a password authenticator, as we still need users to set a password for the time being
				// we first look for the password authenticator id deep in the response
				const passwordAuthenticatorId =
					challengeAnswerResponse.remediation.value
						.flatMap((remediation) => {
							if (remediation.name === 'select-authenticator-enroll') {
								const parsedRemediation =
									selectAuthenticationEnrollSchema.safeParse(remediation);

								if (parsedRemediation.success) {
									return parsedRemediation.data.value.flatMap((value) => {
										if (value.name === 'authenticator') {
											return value.options.flatMap((option) => {
												if (option.label === 'Password') {
													if (
														option.value.form.value.some(
															(v) => v.value === 'password',
														)
													) {
														return [
															option.value.form.value.find(
																(v) => v.name === 'id',
															)?.value,
														];
													}
												}
											});
										}
									});
								}
							}
						})
						.filter(
							(id): id is string => typeof id === 'string' && id.length > 0,
						);

				if (!passwordAuthenticatorId.length) {
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
					{ id: passwordAuthenticatorId[0], methodType: 'password' },
					requestId,
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
				if (error instanceof OAuthError) {
					if (error.name === 'api.authn.error.PASSCODE_INVALID') {
						// case for invalid passcode
						const html = renderer('/register/email-sent', {
							requestState: mergeRequestState(res.locals, {
								queryParams: {
									returnUrl: res.locals.queryParams.returnUrl,
									emailSentSuccess: false,
								},
								pageData: {
									email: readEncryptedStateCookie(req)?.email,
									timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
										encryptedState.stateHandleExpiresAt,
									),
									fieldErrors: [
										{
											field: 'code',
											message: RegistrationErrors.PASSCODE_INVALID,
										},
									],
									token: code,
								},
							}),
							pageTitle: 'Check Your Inbox',
						});
						return res.type('html').send(html);
					}

					// case for too many passcode attempts
					if (error.name === 'oie.tooManyRequests') {
						return res.redirect(
							303,
							addQueryParamsToPath('/welcome/expired', res.locals.queryParams),
						);
					}

					// case for session expired
					if (error.name === 'idx.session.expired') {
						return res.redirect(
							303,
							addQueryParamsToPath('/welcome/expired', res.locals.queryParams),
						);
					}
				}

				// track and log the failure, and fall back to the legacy Okta registration flow if there is an error
				logger.error('IDX API - register/code error:', error, {
					request_id: requestId,
				});
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
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { requestId } = res.locals;

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
					requestId,
				);

				// check if the remediation array contains a "enroll-authenticator"	object
				// if it does, then we know the stateHandle is valid and we're in the correct state
				validateIntrospectRemediation(
					introspectResponse,
					'enroll-authenticator',
				);

				// attempt to resend the email
				await challengeResend(stateHandle, requestId);

				// redirect to the email sent page
				return res.redirect(
					303,
					addQueryParamsToPath('/register/email-sent', res.locals.queryParams, {
						emailSentSuccess: true,
					}),
				);
			} catch (error) {
				// track and log the failure, and fall back to the legacy Okta registration flow if there is an error
				logger.error('IDX API - register/code/resend error:', error, {
					request_id: requestId,
				});

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
		status: user.status,
		// We set queryParams here to allow state to be persisted as part of the registration flow,
		// because we are unable to pass these query parameters via the email activation link in Okta email templates
		queryParams: getPersistableQueryParamsWithoutOktaParams(
			res.locals.queryParams,
		),
	});
};

export const OktaRegistration = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email = '' } = req.body;

	const {
		queryParams: { appClientId, ref, refViewId, useOktaClassic },
		requestId: request_id,
	} = res.locals;

	const consents = bodyFormFieldsToRegistrationConsents(req.body);

	const registrationLocation: RegistrationLocation | undefined =
		getRegistrationLocation(req);

	// OKTA IDX API FLOW
	// Attempt to register the user with Okta using the IDX API
	// and specifically using passcodes.
	// If there are specific failures, we fall back to the legacy Okta registration flow
	if (registrationPasscodesEnabled && !useOktaClassic) {
		try {
			// start the interaction code flow, and get the interaction handle + authState
			const [{ interaction_handle }, authState] = await interact(req, res, {
				confirmationPagePath: '/welcome/review',
				closeExistingSession: true,
			});

			// introspect the interaction handle to get state handle
			const introspectResponse = await introspect(
				{
					interactionHandle: interaction_handle,
				},
				request_id,
			);

			// Encrypt any consents we need to preserve during the registration flow
			const encryptedRegistrationConsents =
				consents && encryptRegistrationConsents(consents);

			// update the authState with the stateToken and encrypted consents
			const updatedAuthState = updateAuthorizationStateData(authState, {
				stateToken: introspectResponse.stateHandle.split('~')[0],
				encryptedRegistrationConsents,
			});
			setAuthorizationStateCookie(updatedAuthState, res);

			// check if we have the `select-enroll-profile` remediation property which means registration is allowed
			const introspectEnrollProfileCheck =
				introspectResponse.remediation.value.find(
					({ name }) => name === 'select-enroll-profile',
				);

			// if we don't have the `select-enroll-profile` remediation property
			// throw an error and fall back to the legacy Okta registration flow
			if (!introspectEnrollProfileCheck) {
				throw new OAuthError(
					{
						error: 'idx_error',
						error_description: '`select-enroll-profile` remediation not found',
					},
					404,
				);
			}

			// call the enroll endpoint to attempt to start the registration process
			const enrollResponse = await enroll(
				introspectResponse.stateHandle,
				request_id,
			);

			// if we don't have the `enroll-profile` remediation property
			// throw an error and fall back to the legacy Okta registration flow
			if (
				!enrollResponse.remediation.value.find(
					({ name }) => name === 'enroll-profile',
				)
			) {
				throw new OAuthError(
					{
						error: 'idx_error',
						error_description: '`enroll-profile` remediation not found',
					},
					404,
				);
			}

			// call the enroll/new endpoint to attempt to register the user with email
			const enrollNewWithEmailResponse = await enrollNewWithEmail(
				enrollResponse.stateHandle,
				{
					email,
					isGuardianUser: true,
					registrationLocation: registrationLocation,
					registrationPlatform: await getRegistrationPlatform(appClientId),
				},
				request_id,
			);

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
					res.locals.requestId,
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
			logger.error('IDX API - registration error:', error, {
				request_id,
			});
		}
	}

	try {
		const user = await registerWithOkta({
			email,
			registrationLocation,
			appClientId,
			request_id,
			consents,
			ref,
			refViewId,
		});

		// fire ophan component event if applicable
		if (res.locals.queryParams.componentEventParams) {
			void sendOphanComponentEventFromQueryParamsServer(
				res.locals.queryParams.componentEventParams,
				'CREATE_ACCOUNT',
				'web',
				res.locals.ophanConfig.consentUUID,
				res.locals.requestId,
			);
		}

		setEncryptedStateCookie(res, {
			email: user.profile.email,
			status: user.status,
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
		logger.error('Okta Registration failure', error, {
			request_id: res.locals.requestId,
		});

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
		logger.error('Okta Registration resend email failure', error, {
			request_id: res.locals.requestId,
		});

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
