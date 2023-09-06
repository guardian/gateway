import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';
import { loginMiddlewareOAuth } from '@/server/lib/middleware/login';
import { getUserAttributes } from '@/server/lib/members-data-api/user-attributes';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { ApiError } from '@/server/models/Error';
import { logger } from '@/server/lib/serverSideLogger';
import { mergeRequestState } from '@/server/lib/requestState';
import { getUser } from '@/server/lib/okta/api/users';
import { authenticate } from '@/server/lib/okta/api/authentication';
import { OktaError } from '@/server/models/okta/Error';
import {
	performAuthorizationCodeFlow,
	scopesForSelfServiceDeletion,
} from '@/server/lib/okta/oauth';
import { ProfileOpenIdClientRedirectUris } from '@/server/lib/okta/openid-connect';
import { sendEmailToUnvalidatedUser } from '@/server/lib/unvalidatedEmail';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { GenericErrors } from '@/shared/model/Errors';

router.get(
	'/delete',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		try {
			// get the current user profile
			const user = await getUser(state.oauthState.idToken!.claims.sub);

			// check if the user has validated their email address
			if (!user.profile.emailValidated) {
				// if not, ask them to validate their email address
				const html = renderer('/delete-email-validation', {
					pageTitle: 'Verify Email',
					requestState: state,
				});
				return res.type('html').send(html);
			}

			// check if the user has a password set
			if (!user.credentials.password) {
				// if not, ask them to set a password
				const html = renderer('/delete-set-password', {
					pageTitle: 'Create Password',
					requestState: state,
				});
				return res.type('html').send(html);
			}

			// get the user's attributes from the members data api
			const userAttributes = await getUserAttributes({
				accessToken: state.oauthState.accessToken!.toString(),
				request_id: state.requestId,
			});

			// check if the user has a paid product
			if (userAttributes) {
				const { contentAccess } = userAttributes;

				const hasPaidProduct =
					contentAccess.digitalPack ||
					contentAccess.guardianWeeklySubscriber ||
					contentAccess.member ||
					contentAccess.paidMember ||
					contentAccess.paperSubscriber ||
					contentAccess.recurringContributor;

				if (hasPaidProduct) {
					// if so, show the delete blocked page
					const html = renderer('/delete-blocked', {
						pageTitle: 'Account Deletion Blocked',
						requestState: mergeRequestState(state, {
							pageData: {
								contentAccess,
							},
							globalMessage: {
								error: state.queryParams.error_description,
							},
						}),
					});
					return res.type('html').send(html);
				}
			}

			// if everything is ok, show the delete page
			const html = renderer('/delete', {
				requestState: mergeRequestState(state, {
					globalMessage: {
						error: state.queryParams.error_description,
					},
				}),
				pageTitle: 'Account Deletion',
			});

			return res.type('html').send(html);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: state.requestId,
			});
			const { message, status } =
				error instanceof ApiError ? error : new ApiError();

			const html = renderer('/delete', {
				requestState: mergeRequestState(state, {
					pageData: {
						formError: message,
					},
					globalMessage: {
						error: state.queryParams.error_description,
					},
				}),
				pageTitle: 'Account Deletion',
			});
			return res.status(status).type('html').send(html);
		}
	}),
);

router.post(
	'/delete',
	loginMiddlewareOAuth,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { password = '' } = req.body;

		try {
			const { email } = state.oauthState.idToken!.claims;

			// attempt to authenticate with okta
			// if authentication fails, it will fall through to the catch
			const response = await authenticate({
				username: email as string,
				password,
			});

			// we only support the SUCCESS status for Okta authentication in gateway
			// Other statuses could be supported in the future https://developer.okta.com/docs/reference/api/authn/#transaction-state
			if (response.status !== 'SUCCESS') {
				throw new ApiError({
					message:
						'User authenticating was blocked due to unsupported Okta Authentication status property',
					status: 403,
				});
			}

			// perform the authorization code flow to get an access token specifically for deleting the user
			return performAuthorizationCodeFlow(req, res, {
				redirectUri: ProfileOpenIdClientRedirectUris.DELETE,
				scopes: scopesForSelfServiceDeletion,
				confirmationPagePath: '/delete/complete',
			});
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});
			if (
				error instanceof OktaError &&
				error.name === 'AuthenticationFailedError'
			) {
				const html = renderer('/delete', {
					requestState: mergeRequestState(state, {
						pageData: {
							fieldErrors: [
								{
									field: 'password',
									message: 'Password is incorrect',
								},
							],
						},
					}),
					pageTitle: 'Account Deletion',
				});
				return res.status(error.status).type('html').send(html);
			}

			const html = renderer('/delete', {
				requestState: mergeRequestState(state, {
					pageData: {
						formError: GenericErrors.DEFAULT,
					},
				}),
				pageTitle: 'Account Deletion',
			});
			return res.status(500).type('html').send(html);
		}
	}),
);

router.post(
	'/delete-email-validation',
	loginMiddlewareOAuth,
	async (req: Request, res: ResponseWithRequestState) => {
		try {
			const { sub, email } = res.locals.oauthState.idToken!.claims;

			if (typeof sub !== 'string' || typeof email !== 'string') {
				throw new Error('uid and email must be strings');
			}

			await sendEmailToUnvalidatedUser({
				id: sub,
				email,
				request_id: res.locals.requestId,
			});

			return res.redirect(
				303,
				addQueryParamsToPath('/delete/email-sent', res.locals.queryParams, {
					emailSentSuccess: true,
				}),
			);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});
			return res.redirect(
				303,
				addQueryParamsToPath('/delete', res.locals.queryParams, {
					error_description: GenericErrors.DEFAULT,
				}),
			);
		}
	},
);

router.get(
	'/delete/email-sent',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const { email } = res.locals.oauthState.idToken!.claims;

		const state = res.locals;
		const html = renderer('/delete/email-sent', {
			requestState: mergeRequestState(state, {
				pageData: {
					email: typeof email === 'string' ? email : undefined,
				},
			}),
			pageTitle: 'Check Your Inbox',
		});
		return res.type('html').send(html);
	},
);

router.get(
	'/delete/complete',
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/delete/complete', {
			requestState: res.locals,
			pageTitle: 'Account Deletion Complete',
		});
		res.type('html').send(html);
	},
);

export default router.router;
