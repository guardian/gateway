import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import {
	OphanConfig,
	sendOphanInteractionEventServer,
} from '@/server/lib/ophan';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';
import {
	addQueryParamsToPath,
	getPersistableQueryParamsWithoutOktaParams,
} from '@/shared/lib/queryParams';
import { logger } from '@/server/lib/serverSideLogger';
import { GenericErrors } from '@/shared/model/Errors';
import { renderer } from '@/server/lib/renderer';
import { isOktaError } from '@/server/lib/okta/api/errors';
import {
	getUser,
	dangerouslyResetPassword,
	activateUser,
	reactivateUser,
	forgotPassword,
	deactivateUser,
} from '@/server/lib/okta/api/users';
import { Status } from '@/server/models/okta/User';
import { OktaError } from '@/server/models/okta/Error';
import { sendCreatePasswordEmail } from '@/email/templates/CreatePassword/sendCreatePasswordEmail';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { mergeRequestState } from '@/server/lib/requestState';
import dangerouslySetPlaceholderPassword from '@/server/lib/okta/dangerouslySetPlaceholderPassword';
import { encryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';

const getPath = (req: Request): PasswordRoutePath => {
	const path = req.path;

	if (path.startsWith('/set-password')) {
		return '/set-password';
	}
	return '/reset-password';
};

const sendOphanEvent = (ophanConfig: OphanConfig) => {
	sendOphanInteractionEventServer(
		{
			component: 'email-send',
			value: 'reset-password',
		},
		ophanConfig,
	);
};

const setEncryptedCookieOkta = (
	res: ResponseWithRequestState,
	email: string,
) => {
	setEncryptedStateCookie(res, {
		email,
		// We set queryParams here to allow state to be persisted as part of the registration flow,
		// because we are unable to pass these query parameters via the email activation link in Okta email templates
		queryParams: getPersistableQueryParamsWithoutOktaParams(
			res.locals.queryParams,
		),
	});
};

export const sendEmailInOkta = async (
	req: Request,
	res: ResponseWithRequestState,
	loopDetectionFlag: boolean = false,
): Promise<void | ResponseWithRequestState> => {
	const state = res.locals;
	const { email = '' } = req.body;
	const path = getPath(req);
	const {
		queryParams: { appClientId, ref, refViewId },
		requestId: request_id,
	} = state;

	try {
		// get the user object to check user status
		const user = await getUser(email);

		switch (user.status) {
			case Status.ACTIVE:
				// inner try-catch block to handle specific errors from sendForgotPasswordEmail
				try {
					const token = await forgotPassword(user.id);
					if (!token) {
						throw new OktaError({
							message: `Okta user reset password failed: missing reset password token`,
						});
					}
					const emailIsSent = await sendResetPasswordEmail({
						to: user.profile.email,
						resetPasswordToken: await encryptOktaRecoveryToken({
							token,
							appClientId,
							request_id,
						}),
						ref,
						refViewId,
					});
					if (!emailIsSent) {
						trackMetric(emailSendMetric('OktaResetPassword', 'Failure'));
						throw new OktaError({
							message: `Okta user reset password failed: Failed to send email`,
						});
					}
					trackMetric(emailSendMetric('OktaResetPassword', 'Success'));
				} catch (error) {
					// we need to catch an error here to check if the user
					// does not have a password set, for example for social users
					// we still want to send a reset password email for these users
					// so we have to check for the correct error response
					// set an placeholder unknown password and then send the email
					// E0000006 - Access denied exception
					// E0000017 - Reset password failed exception
					if (
						isOktaError(error) &&
						error.status === 403 &&
						(error.code === 'E0000006' || error.code === 'E0000017')
					) {
						// if a loop is detected, then throw early to prevent infinite loop
						if (loopDetectionFlag) {
							throw error;
						}

						// a user *should* only hit this error if no password set
						// but we do a few checks to make sure that it's the case

						// check for user does not have a password set
						// (to make sure we don't override any existing password)
						if (!user.credentials.password) {
							await dangerouslySetPlaceholderPassword(user.id);
							// now that the placeholder password has been set, the user behaves like a
							// normal user (provider = OKTA) and we can send the email by calling this method again
							return sendEmailInOkta(req, res, true);
						}
					}

					// otherwise throw the error to the outer catch block
					// as it's not handled in the if statement above
					throw error;
				}
				break;
			case Status.STAGED:
			case Status.DEPROVISIONED:
				{
					// if the user is STAGED or DEPROVISIONED, we need to activate them before we can send them an email
					// this will put them into the PROVISIONED state
					// we will send them a create password email
					try {
						const tokenResponse = await activateUser(user.id);
						if (!tokenResponse?.token.length) {
							throw new OktaError({
								message: `Okta user activation failed: missing activation token`,
							});
						}
						const emailIsSent = await sendCreatePasswordEmail({
							to: user.profile.email,
							setPasswordToken: await encryptOktaRecoveryToken({
								token: tokenResponse.token,
								appClientId,
								request_id,
							}),
							ref,
							refViewId,
						});
						if (!emailIsSent) {
							trackMetric(emailSendMetric('OktaCreatePassword', 'Failure'));
							throw new OktaError({
								message: `Okta user activation failed: Failed to send email`,
							});
						}
					} catch (error) {
						// these users are in a special state where they used a passcode to create their account
						// but failed to complete the flow by setting a password, leaving them in an unusual state
						// where they're in the STAGED state but cannot recover normally
						// to remediate these users we have to deactivate them
						// and then reactivate them in order to send them a create password email
						if (error instanceof OktaError && error.code === 'E0000038') {
							// if a loop is detected, then throw early to prevent infinite loop
							if (loopDetectionFlag) {
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-STAGED-Start',
							);

							// 1. deactivate the user
							try {
								await deactivateUser(user.id);
								trackMetric('OktaDeactivateUser::Success');
							} catch (error) {
								trackMetric('OktaDeactivateUser::Failure');
								logger.error(
									'Okta user deactivation failed',
									error instanceof OktaError ? error.message : error,
									{
										request_id,
									},
								);
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-STAGED-Complete',
							);

							// rerun the sendEmailInOkta function to catch the user in the DEPROVISIONED state
							return sendEmailInOkta(req, res, true);
						}

						logger.error(
							'Okta user activation failed',
							error instanceof OktaError ? error.message : error,
							{
								request_id,
							},
						);

						// otherwise throw the error to the outer catch block
						// as it's not handled in the if statement above
						throw error;
					}
					trackMetric(emailSendMetric('OktaCreatePassword', 'Success'));
				}
				break;
			case Status.PROVISIONED:
				{
					// if the user is PROVISIONED, we need to reactivate them before we can send them an email
					// this will keep them in the PROVISIONED state
					// we will send them a create password email
					try {
						const tokenResponse = await reactivateUser(user.id);
						if (!tokenResponse?.token.length) {
							throw new OktaError({
								message: `Okta user reactivation failed: missing re-activation token`,
							});
						}
						const emailIsSent = await sendCreatePasswordEmail({
							to: user.profile.email,
							setPasswordToken: await encryptOktaRecoveryToken({
								token: tokenResponse.token,
								appClientId,
								request_id,
							}),
							ref,
							refViewId,
						});
						if (!emailIsSent) {
							trackMetric(emailSendMetric('OktaCreatePassword', 'Failure'));
							throw new OktaError({
								message: `Okta user reactivation failed: Failed to send email`,
							});
						}
					} catch (error) {
						// these users are in a special state where they used a passcode to create their account
						// but failed to complete the flow by setting a password, leaving them in an unusual state
						// where they're in the PROVISIONED state but cannot recover normally
						// to remediate these users we have to deactivate them
						// and then reactivate them in order to send them a create password email
						if (error instanceof OktaError && error.code === 'E0000038') {
							// if a loop is detected, then throw early to prevent infinite loop
							if (loopDetectionFlag) {
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-PROVISIONED-Start',
							);

							// 1. deactivate the user
							try {
								await deactivateUser(user.id);
								trackMetric('OktaDeactivateUser::Success');
							} catch (error) {
								trackMetric('OktaDeactivateUser::Failure');
								logger.error(
									'Okta user deactivation failed',
									error instanceof OktaError ? error.message : error,
									{
										request_id,
									},
								);
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-PROVISIONED-Complete',
							);

							// rerun the sendEmailInOkta function to catch the user in the DEPROVISIONED state
							return sendEmailInOkta(req, res, true);
						}

						logger.error(
							'Okta user reactivation failed',
							error instanceof OktaError ? error.message : error,
							{
								request_id,
							},
						);

						// otherwise throw the error to the outer catch block
						// as it's not handled in the if statement above
						throw error;
					}

					trackMetric(emailSendMetric('OktaCreatePassword', 'Success'));
				}
				break;
			case Status.RECOVERY:
			case Status.PASSWORD_EXPIRED:
				{
					// if the user is RECOVERY or PASSWORD_EXPIRED, we use the
					// dangerouslyResetPassword method to put them into the RECOVERY state
					// and send them a reset password email
					const token = await dangerouslyResetPassword(user.id);
					if (!token) {
						throw new OktaError({
							message: `Okta user reset password failed: missing reset password token`,
						});
					}
					const emailIsSent = await sendResetPasswordEmail({
						to: user.profile.email,
						resetPasswordToken: await encryptOktaRecoveryToken({
							token,
							appClientId,
							request_id,
						}),
						ref,
						refViewId,
					});
					if (!emailIsSent) {
						trackMetric(emailSendMetric('OktaResetPassword', 'Failure'));
						throw new OktaError({
							message: `Okta user reset password failed: Failed to send email`,
						});
					}
					trackMetric(emailSendMetric('OktaResetPassword', 'Success'));
				}
				break;
			default:
				throw new OktaError({
					message: `Okta reset password failed with unaccepted Okta user status: ${user.status}`,
				});
		}

		setEncryptedCookieOkta(res, email);

		sendOphanEvent(state.ophanConfig);

		return res.redirect(
			303,
			addQueryParamsToPath(`${path}/email-sent`, state.queryParams, {
				emailSentSuccess: true,
			}),
		);
	} catch (error) {
		// handle check for if the user is not found
		// this is a special case because we don't want to send an email
		// but we want to show the email sent page
		// so the reset password page cannot be used for account enumeration
		if (
			isOktaError(error) &&
			error.status === 404 &&
			error.code === 'E0000007'
		) {
			setEncryptedCookieOkta(res, email);

			return res.redirect(
				303,
				addQueryParamsToPath(`${path}/email-sent`, state.queryParams, {
					emailSentSuccess: true,
				}),
			);
		}

		logger.error('Okta send reset password email failed', error, {
			request_id: res.locals.requestId,
		});

		const html = renderer('/reset-password', {
			pageTitle: 'Reset Password',
			requestState: mergeRequestState(state, {
				pageData: {
					formError: GenericErrors.DEFAULT,
				},
			}),
		});

		return res.type('html').send(html);
	}
};
