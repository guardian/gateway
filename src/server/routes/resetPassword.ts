import { Request } from 'express';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import handleRecaptcha from '@/server/lib/recaptcha';
import { sendEmailInOkta } from '@/server/controllers/sendChangePasswordEmail';
import { mergeRequestState } from '@/server/lib/requestState';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import {
	readEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { convertExpiresAtToExpiryTimeInMs } from '@/server/lib/okta/idx/shared/convertExpiresAtToExpiryTimeInMs';
import { submitPasscode } from '@/server/lib/okta/idx/shared/submitPasscode';
import { handlePasscodeError } from '@/server/lib/okta/idx/shared/errorHandling';
import { getAuthorizationStateCookie } from '@/server/lib/okta/openid-connect';
import {
	isChallengeAnswerCompleteLoginResponse,
	validateChallengeAnswerRemediation,
} from '@/server/lib/okta/idx/challenge';
import { OAuthError } from '@/server/models/okta/Error';
import { forgotPassword } from '@/server/lib/okta/api/users';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { GenericErrors, RegistrationErrors } from '@/shared/model/Errors';
import { logger } from '@/server/lib/serverSideLogger';

// reset password email form
router.get('/reset-password', (req: Request, res: ResponseWithRequestState) => {
	const html = renderer('/reset-password', {
		pageTitle: 'Reset Password',
		requestState: mergeRequestState(res.locals, {
			pageData: {
				email: readEmailCookie(req),
			},
		}),
	});
	res.type('html').send(html);
});

// send reset password email
router.post(
	'/reset-password',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		await sendEmailInOkta(req, res);
	}),
);

// reset password email sent page
router.get(
	'/reset-password/email-sent',
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/reset-password/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email: readEmailCookie(req),
					resendEmailAction: '/reset-password',
					changeEmailPage: '/reset-password',
				},
			}),
		});
		res.type('html').send(html);
	},
);

// password updated confirmation page
router.get(
	'/reset-password/complete',
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/reset-password/complete', {
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email: readEmailCookie(req),
				},
			}),
			pageTitle: 'Password Changed',
		});
		return res.type('html').send(html);
	},
);

// link expired page
router.get(
	'/reset-password/resend',
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/reset-password/resend', {
			pageTitle: 'Resend Change Password Email',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// session timed out page
router.get(
	'/reset-password/expired',
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/reset-password/expired', {
			pageTitle: 'Resend Change Password Email',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// Essentially the email-sent page, but for passcode reset password
router.get(
	'/reset-password/code',
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;

		const encryptedState = readEncryptedStateCookie(req);

		if (encryptedState?.email && encryptedState.stateHandle) {
			const html = renderer('/reset-password/email-sent', {
				requestState: mergeRequestState(state, {
					pageData: {
						email: encryptedState?.email,
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
			addQueryParamsToPath('/reset-password', state.queryParams),
		);
	},
);

// handler for the passcode reset password form
router.post(
	'/reset-password/code',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { code } = req.body;

		const encryptedState = readEncryptedStateCookie(req);

		// make sure we have the encrypted state cookie and the code otherwise redirect to the reset page
		if (encryptedState?.stateHandle && code) {
			const { stateHandle, userState } = encryptedState;

			try {
				// check for non-existent user state
				// in this case throw an error to show the user the passcode is invalid
				if (userState === 'NON_EXISTENT') {
					throw new OAuthError({
						error: 'api.authn.error.PASSCODE_INVALID',
						error_description: RegistrationErrors.PASSCODE_INVALID,
					});
				}

				// submit the passcode to Okta
				const challengeAnswerResponse = await submitPasscode({
					passcode: code,
					stateHandle,
					introspectRemediation:
						// if the user is in the `ACTIVE_PASSWORD_ONLY` state, then they are trying enroll the email authenticator
						// otherwise they are trying to recover their password, see the comment below for more info
						encryptedState.userState === 'ACTIVE_PASSWORD_ONLY'
							? 'select-authenticator-enroll'
							: 'challenge-authenticator',
					ip: req.ip,
				});

				// if a user submits a passcode that is correct, but the response is a complete login response
				// then they were very likely a user who was stuck in the
				// "2. ACTIVE users - has only password authenticator (okta idx email not verified)" state at the
				// start of the reset password flow, but verify using the `userState` from encrypted state
				if (isChallengeAnswerCompleteLoginResponse(challengeAnswerResponse)) {
					if (encryptedState.userState !== 'ACTIVE_PASSWORD_ONLY') {
						throw new OAuthError({
							error: 'invalid_response',
							error_description:
								'Invalid challenge/answer response - got a complete login response',
						});
					}

					// if the user was in the `ACTIVE_PASSWORD_ONLY` state and they were trying to reset their password
					// since they've verified their email using the passcode, we can allow them to set a password
					// rather than sending them down the reset password flow again to get another passcode
					// we instead generate a recovery token for them and allow them to set a password right away
					const token = await forgotPassword(
						challengeAnswerResponse.user.value.id,
						req.ip,
					);

					// update the encrypted state cookie to show the passcode was used
					// and to remove the state handle and expiry time, and the active user state
					updateEncryptedStateCookie(req, res, {
						passcodeUsed: true,
						stateHandle: undefined,
						stateHandleExpiresAt: undefined,
						userState: undefined,
					});

					// redirect to the password page to set a password, everything from this point is the same as
					// the classic reset password flow
					return res.redirect(
						303,
						buildUrlWithQueryParams(
							'/set-password/:token',
							{
								token,
							},
							res.locals.queryParams,
						),
					);
				}

				// check if the remediation array contains the correct remediation object supplied
				// if it does, then we know that we're in the correct state and the passcode was correct
				validateChallengeAnswerRemediation(
					challengeAnswerResponse,
					'reset-authenticator',
				);

				// update the encrypted state cookie to show the passcode was used
				// so that if the user clicks back to the email sent page, they will be shown a message
				updateEncryptedStateCookie(req, res, {
					passcodeUsed: true,
				});

				// redirect to the password page to set a password depending on if the are setting
				// or resetting a password
				const authState = getAuthorizationStateCookie(req);
				const passwordPage = (() => {
					switch (authState?.confirmationPage) {
						case '/set-password/complete':
							return '/set-password/password';
						default:
							return '/reset-password/password';
					}
				})();

				// redirect to the password page
				return res.redirect(
					303,
					addQueryParamsToPath(passwordPage, res.locals.queryParams),
				);
			} catch (error) {
				// handle passcode specific error
				handlePasscodeError({
					error,
					req,
					res,
					emailSentPage: '/reset-password/email-sent',
					expiredPage: '/reset-password/expired',
				});

				// if we redirected away during the handlePasscodeError function, we can't redirect again
				if (res.headersSent) {
					return;
				}

				// log the error
				logger.error(`${req.method} ${req.originalUrl}  Error`, error);

				// handle any other error, show generic error message
				const html = renderer('/reset-password/code', {
					requestState: mergeRequestState(res.locals, {
						queryParams: {
							...res.locals.queryParams,
							emailSentSuccess: false,
						},
						pageData: {
							email: encryptedState?.email,
							timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
								encryptedState?.stateHandleExpiresAt,
							),
							formError: {
								message: GenericErrors.DEFAULT,
								severity: 'UNEXPECTED',
							},
							token: code,
						},
					}),
					pageTitle: 'Check Your Inbox',
				});
				return res.type('html').send(html);
			}
		}

		// if we reach this point, redirect back to the reset password page, as something has gone wrong
		return res.redirect(
			303,
			addQueryParamsToPath('/reset-password', res.locals.queryParams),
		);
	}),
);

// Route to resend the email for passcode reset password
// Essentially the same as POST /reset-password, just start the process again
router.post(
	'/reset-password/code/resend',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		await sendEmailInOkta(req, res);
	}),
);

// IMPORTANT: The /reset-password/:token routes must be defined below the other routes.
// If not, the other routes will fail as the router will try and read the second part
// of the path as the token parameter.

// reset password form
router.get(
	'/reset-password/:token',
	checkPasswordTokenController('/reset-password', 'Change Password'),
);

// update password
router.post(
	'/reset-password/:token',
	setPasswordController(
		'/reset-password',
		'Change Password',
		'/reset-password/complete',
	),
);

export default router.router;
