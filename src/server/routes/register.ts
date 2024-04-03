import { Request } from 'express';
import handleRecaptcha from '@/server/lib/recaptcha';
import {
	readEncryptedStateCookie,
	setEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { guest } from '@/server/lib/idapi/guest';
import {
	readUserType,
	sendAccountExistsEmail,
	sendAccountVerificationEmail,
	sendAccountWithoutPasswordExistsEmail,
	UserType,
} from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/serverSideLogger';
import { register as registerWithOkta } from '@/server/lib/okta/register';
import { renderer } from '@/server/lib/renderer';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { trackMetric } from '@/server/lib/trackMetric';
import { ApiError } from '@/server/models/Error';
import { ResponseWithRequestState } from '@/server/models/Express';
import {
	addQueryParamsToPath,
	getPersistableQueryParamsWithoutOktaParams,
} from '@/shared/lib/queryParams';
import { EmailType } from '@/shared/model/EmailType';
import { GenericErrors, RegistrationErrors } from '@/shared/model/Errors';
import deepmerge from 'deepmerge';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';
import { redirectIfLoggedIn } from '@/server/lib/middleware/redirectIfLoggedIn';
import {
	getMatchingSignInGateIdFromComponentEventParamsQuery,
	sendOphanComponentEventFromQueryParamsServer,
} from '@/server/lib/ophan';
import { mergeRequestState } from '@/server/lib/requestState';
import { UserResponse } from '@/server/models/okta/User';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import { RegistrationLocation } from '@/shared/model/RegistrationLocation';
import {
	challengeAnswerPasscode,
	challengeResend,
} from '@/server/lib/okta/idx/challenge';
import {
	enroll,
	enrollNewWithEmail,
	selectAuthenticationEnrollSchema,
} from '@/server/lib/okta/idx/enroll';
import { interact } from '@/server/lib/okta/idx/interact';
import { introspect } from '@/server/lib/okta/idx/introspect';
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
import { consentPages } from './consents';

const { okta, registrationPasscodesEnabled } = getConfiguration();

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
		const { useIdapi } = res.locals.queryParams;
		if (!okta.enabled || useIdapi) {
			await IdapiResendEmail(req, res);
		} else {
			await OktaResendEmail(req, res);
		}
	}),
);

router.post(
	'/register',
	handleRecaptcha,
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { useIdapi } = res.locals.queryParams;
		if (!okta.enabled || useIdapi) {
			await IdapiRegistration(req, res);
		} else {
			await OktaRegistration(req, res);
		}
	}),
);

router.get('/register/code', (req: Request, res: ResponseWithRequestState) => {
	const state = res.locals;

	const encryptedState = readEncryptedStateCookie(req);

	if (encryptedState && encryptedState.email && encryptedState.stateHandle) {
		const html = renderer('/register/email-sent', {
			requestState: mergeRequestState(state, {
				pageData: {
					email: readEncryptedStateCookie(req)?.email,
					timeUntilTokenExpiry: encryptedState.stateHandleExpiresAt
						? new Date(encryptedState.stateHandleExpiresAt).getTime() -
							Date.now()
						: undefined,
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

router.post(
	'/register/code',
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { requestId } = res.locals;
		const { code } = req.body;

		const encryptedState = readEncryptedStateCookie(req);

		if (encryptedState && encryptedState.stateHandle && code) {
			const { stateHandle } = encryptedState;

			try {
				// check the state handle is valid
				await introspect(
					{
						stateHandle,
					},
					requestId,
				);

				const challengeAnswerResponse = await challengeAnswerPasscode(
					stateHandle,
					{ passcode: code },
					requestId,
				);

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
							error_description: 'Password authenticator id',
						},
						400,
					);
				}

				await credentialEnroll(
					stateHandle,
					{ id: passwordAuthenticatorId[0], methodType: 'password' },
					requestId,
				);

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
									timeUntilTokenExpiry: encryptedState.stateHandleExpiresAt
										? new Date(encryptedState.stateHandleExpiresAt).getTime() -
											Date.now()
										: undefined,
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
							addQueryParamsToPath(
								'/register/code/expired',
								res.locals.queryParams,
							),
						);
					}

					// case for session expired
					if (error.name === 'idx.session.expired') {
						return res.redirect(
							303,
							addQueryParamsToPath(
								'/register/code/expired',
								res.locals.queryParams,
							),
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

router.post(
	'/register/code/resend',
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { requestId } = res.locals;

		const encryptedState = readEncryptedStateCookie(req);

		if (encryptedState && encryptedState.stateHandle) {
			const { stateHandle } = encryptedState;

			try {
				// check the state handle is valid
				await introspect(
					{
						stateHandle,
					},
					requestId,
				);

				// attempt to resend the email
				await challengeResend(stateHandle, requestId);

				// redirect to the email sent page
				return res.redirect(
					303,
					addQueryParamsToPath('/register/email-sent', res.locals.queryParams),
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
							addQueryParamsToPath(
								'/register/code/expired',
								res.locals.queryParams,
							),
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

const OktaRegistration = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	if (
		registrationPasscodesEnabled &&
		res.locals.queryParams.usePasscodeRegistration
	) {
		// to implement
		return res.sendStatus(418);
	}

	const { email = '' } = req.body;

	const {
		queryParams: { appClientId, ref, refViewId, componentEventParams },
		requestId: request_id,
	} = res.locals;

	/* AB TEST LOGIC START */

	// The componentEventParams query parameter stores Ophan tracking data, but we want to
	// parse it to check if this registration is coming via specific sign-in gates we're AB testing,
	// so we can send an offer email after registration is complete.
	const signInGateId =
		await getMatchingSignInGateIdFromComponentEventParamsQuery({
			componentEventParamsQuery: componentEventParams,
			request_id,
		});

	/* AB TEST LOGIC END */

	const consents = bodyFormFieldsToRegistrationConsents(req.body);

	const registrationLocation: RegistrationLocation | undefined =
		getRegistrationLocation(req);

	// OKTA IDX API FLOW
	// Attempt to register the user with Okta using the IDX API
	// and specifically using passcodes
	// if there is specific failures, we fall back to the legacy Okta registration flow
	if (
		registrationPasscodesEnabled &&
		res.locals.queryParams.usePasscodeRegistration
	) {
		try {
			// start the interaction code flow, and get the interaction handle + authState
			const [{ interaction_handle }, authState] = await interact(req, res, {
				confirmationPagePath: consentPages[0].path,
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
			signInGateId,
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

// TODO: Can we combine some reset email functions together?
const IdapiResendEmail = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const state = res.locals;

	const { emailSentSuccess } = state.queryParams;

	try {
		// read and parse the encrypted state cookie
		const encryptedState = readEncryptedStateCookie(req);

		const email = encryptedState?.email;

		// check the email exists
		if (typeof email !== 'undefined') {
			// read the type of email we sent to the user based on the EncryptedState set
			// we default to GUEST_REGISTER as it's likely that if the value doesn't exist
			// they are a new user registration
			const emailType: EmailType =
				encryptedState?.emailType ?? EmailType.ACCOUNT_VERIFICATION;

			// depending on the EmailType that was originally sent to the user
			// we determine which email to resend
			switch (emailType) {
				// they were a newly registered user, so resend the AccountVerification Email
				case EmailType.ACCOUNT_VERIFICATION:
					await sendAccountVerificationEmail(
						email,
						req.ip,
						state.queryParams,
						state.ophanConfig,
						state.requestId,
					);
					break;
				// they were an already registered user, so resend the AccountExists Email
				case EmailType.ACCOUNT_EXISTS:
					await sendAccountExistsEmail(
						email,
						req.ip,
						state.queryParams,
						state.ophanConfig,
						state.requestId,
					);
					break;
				// they were an already registered user without password
				// so resend the AccountWithoutPasswordExists Email
				case EmailType.ACCOUNT_WITHOUT_PASSWORD_EXISTS:
					await sendAccountWithoutPasswordExistsEmail(
						email,
						req.ip,
						state.queryParams,
						state.ophanConfig,
						state.requestId,
					);
					break;
				default:
					// something's gone wrong, throw a generic error
					throw new ApiError({
						message: GenericErrors.DEFAULT,
						status: 500,
					});
			}

			setEncryptedStateCookie(res, { email, emailType });
			return res.redirect(
				303,
				addQueryParamsToPath('/register/email-sent', res.locals.queryParams, {
					emailSentSuccess,
				}),
			);
		} else {
			throw new ApiError({ message: GenericErrors.DEFAULT, status: 500 });
		}
	} catch (error) {
		const { message, status } =
			error instanceof ApiError ? error : new ApiError();

		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: state.requestId,
		});

		const html = renderer('/register/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: mergeRequestState(res.locals, {
				pageData: {
					formError: message,
				},
			}),
		});
		return res.status(status).type('html').send(html);
	}
};

const IdapiRegistration = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const state = res.locals;

	const { email = '' } = req.body;

	try {
		// use idapi user type endpoint to determine user type
		const userType = await readUserType(email, req.ip, state.requestId);

		// check what type of user they are to determine course of action
		switch (userType) {
			// new user, so call guest register endpoint to create user account without password
			// and automatically send account verification email
			case UserType.NEW:
				await guest(
					email,
					req.ip,
					state.queryParams,
					state.ophanConfig,
					state.requestId,
				);
				// set the encrypted state cookie in each case, so the next page is aware
				// of the email address and type of email sent
				// so if needed it can resend the correct email
				setEncryptedStateCookie(res, {
					email,
					emailType: EmailType.ACCOUNT_VERIFICATION,
				});
				break;
			// user exists with password
			// so we want to send them the account exists email
			case UserType.CURRENT:
				await sendAccountExistsEmail(
					email,
					req.ip,
					state.queryParams,
					state.ophanConfig,
					state.requestId,
				);
				setEncryptedStateCookie(res, {
					email,
					emailType: EmailType.ACCOUNT_EXISTS,
				});
				break;
			// user exists without password
			// so we send them the account exists without password email to set a password
			case UserType.GUEST:
				await sendAccountWithoutPasswordExistsEmail(
					email,
					req.ip,
					state.queryParams,
					state.ophanConfig,
					state.requestId,
				);
				setEncryptedStateCookie(res, {
					email,
					emailType: EmailType.ACCOUNT_WITHOUT_PASSWORD_EXISTS,
				});
				break;
			default:
				// shouldn't reach this point, so we want to catch this
				// as an error just in case
				throw new Error('Invalid UserType');
		}

		trackMetric('Register::Success');

		// redirect the user to the email sent page
		return res.redirect(
			303,
			addQueryParamsToPath('/register/email-sent', res.locals.queryParams),
		);
	} catch (error) {
		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: state.requestId,
		});

		const { message, status } =
			error instanceof ApiError ? error : new ApiError();

		trackMetric('Register::Failure');

		const html = renderer('/register/email', {
			requestState: mergeRequestState(state, {
				pageData: {
					email,
					formError: message,
				},
			}),
			pageTitle: 'Register',
		});
		return res.status(status).type('html').send(html);
	}
};

export default router.router;
