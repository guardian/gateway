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
import { OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';
import { redirectIfLoggedIn } from '@/server/lib/middleware/redirectIfLoggedIn';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { mergeRequestState } from '@/server/lib/requestState';
import { RegistrationLocation, UserResponse } from '@/server/models/okta/User';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import { isStringBoolean } from '@/server/lib/isStringBoolean';

const { okta } = getConfiguration();

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
	const { email = '', _cmpConsentedState = false, marketing } = req.body;

	// 'marketing' consent value will be either 'true' or 'false' as a string
	const marketingConsent = isStringBoolean(marketing);

	const {
		queryParams: { appClientId },
		requestId: request_id,
	} = res.locals;

	const registrationLocation: RegistrationLocation | undefined =
		getRegistrationLocation(req, isStringBoolean(_cmpConsentedState));

	try {
		const user = await registerWithOkta({
			email,
			registrationLocation,
			appClientId,
			request_id,
		});
		// fire ophan component event if applicable
		if (res.locals.queryParams.componentEventParams) {
			sendOphanComponentEventFromQueryParamsServer(
				res.locals.queryParams.componentEventParams,
				'CREATE_ACCOUNT',
				'web',
				res.locals.ophanConfig.consentUUID,
				res.locals.requestId,
			);
		}

		if (marketingConsent) {
			// TODO: Patch user consent for marketing. We need to do this via an
			// admin API endpoint in IDAPI, presumbly, as the user hasn't signed
			// in and doesn't have an SC_GU_U cookie or access token.
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
			renderer('/register', {
				requestState,
				pageTitle: 'Register',
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

		const html = renderer('/register', {
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
