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
import {
	addQueryParamsToPath,
	addQueryParamsToUntypedPath,
} from '@/shared/lib/queryParams';
import { GenericErrors } from '@/shared/model/Errors';
import { UserAttributesResponse } from '@/shared/lib/members-data-api';
import dangerouslySetPlaceholderPassword from '@/server/lib/okta/dangerouslySetPlaceholderPassword';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { requestStateHasOAuthTokens } from '@/server/lib/middleware/requestState';

const { signInPageUrl } = getConfiguration();

router.get(
	'/delete',
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
			/**
			 * Cypress Test START
			 *
			 * This code checks if we're running in Cypress
			 */
			const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';
			const cypressMockStateCookie = req.cookies['cypress-mock-state'];
			/**
			 * Cypress Test END
			 */

			// get the current user profile
			const user = await getUser(state.oauthState.idToken.claims.sub, req.ip);

			// check if the user has validated their email address
			if (
				!user.profile.emailValidated ||
				/**
				 * Cypress Test
				 *
				 * This code checks if we're running in Cypress to
				 * mock the user's email validation status
				 */
				(runningInCypress && cypressMockStateCookie === 'unvalidatedEmail')
			) {
				// if not, ask them to validate their email address
				const html = renderer('/delete-email-validation', {
					pageTitle: 'Verify Email',
					requestState: state,
				});
				return res.type('html').send(html);
			}

			// check if the user has a password set
			if (
				!user.credentials.password ||
				/**
				 * Cypress Test
				 *
				 * This code checks if we're running in Cypress to
				 * mock the user's password
				 */
				(runningInCypress && cypressMockStateCookie === 'noPassword')
			) {
				// if not, ask them to set a password
				const html = renderer('/delete-set-password', {
					pageTitle: 'Create Password',
					requestState: state,
				});
				return res.type('html').send(html);
			}

			// get the user's attributes from the members data api
			const userAttributes = await getUserAttributes({
				accessToken: state.oauthState.accessToken.toString(),
				request_id: state.requestId,
			});

			// check if the user has a paid product
			if (userAttributes) {
				const contentAccess: UserAttributesResponse['contentAccess'] = (() => {
					/**
					 * Cypress Test START
					 *
					 * This code is only used in Cypress tests to mock the user's content access
					 */
					if (runningInCypress && cypressMockStateCookie) {
						const cypressContentAccess: UserAttributesResponse['contentAccess'] =
							{
								digitalPack: false,
								guardianWeeklySubscriber: false,
								member: false,
								paidMember: false,
								paperSubscriber: false,
								recurringContributor: false,
								guardianPatron: false,
								supporterPlus: false,
							};

						switch (cypressMockStateCookie) {
							case 'digitalPack':
								// eslint-disable-next-line functional/immutable-data
								cypressContentAccess.digitalPack = true;
								break;
							case 'guardianWeeklySubscriber':
								// eslint-disable-next-line functional/immutable-data
								cypressContentAccess.guardianWeeklySubscriber = true;
								break;
							case 'member':
								// eslint-disable-next-line functional/immutable-data
								cypressContentAccess.member = true;
								break;
							case 'paidMember':
								// eslint-disable-next-line functional/immutable-data
								cypressContentAccess.paidMember = true;
								break;
							case 'paperSubscriber':
								// eslint-disable-next-line functional/immutable-data
								cypressContentAccess.paperSubscriber = true;
								break;
							case 'recurringContributor':
								// eslint-disable-next-line functional/immutable-data
								cypressContentAccess.recurringContributor = true;
								break;
							case 'feast':
								// eslint-disable-next-line functional/immutable-data
								cypressContentAccess.feast = true;
								break;
							default:
								break;
						}

						return cypressContentAccess;
					}
					/**
					 * Cypress Test END
					 */

					// default to the user's content access from the members data api if not in Cypress
					return userAttributes.contentAccess;
				})();

				const hasPaidProduct =
					contentAccess.digitalPack ||
					contentAccess.guardianWeeklySubscriber ||
					contentAccess.member ||
					contentAccess.paidMember ||
					contentAccess.paperSubscriber ||
					contentAccess.recurringContributor ||
					contentAccess.feast;

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
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		const { password = '' } = req.body;

		try {
			const { email } = state.oauthState.idToken.claims;

			// attempt to authenticate with okta
			// if authentication fails, it will fall through to the catch
			const response = await authenticate(
				{
					username: email as string,
					password,
				},
				req.ip,
			);

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
				request_id: state.requestId,
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

// this is used by the delete page to send an email to the user to validate their email address
// or set a password if they don't have one
router.post(
	'/delete-email-validation',
	loginMiddlewareOAuth,
	async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		try {
			// get the user's id from the id token
			const { sub } = state.oauthState.idToken.claims;

			// check that the user id is a string
			if (typeof sub !== 'string') {
				throw new Error('uid must be a string');
			}

			// get the user's profile from okta
			const user = await getUser(sub, req.ip);

			// if the user doesn't have a password set, set a placeholder password
			if (!user.credentials.password) {
				await dangerouslySetPlaceholderPassword({
					id: user.id,
					ip: req.ip,
				});
			}

			// attempt to send the email
			await sendEmailToUnvalidatedUser({
				id: sub,
				email: user.profile.email,
				request_id: state.requestId,
				ip: req.ip,
			});

			// redirect to the email sent page
			return res.redirect(
				303,
				addQueryParamsToPath('/delete/email-sent', state.queryParams, {
					emailSentSuccess: true,
				}),
			);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: state.requestId,
			});
			return res.redirect(
				303,
				addQueryParamsToPath('/delete', state.queryParams, {
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
		const state = res.locals;
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		const { email } = state.oauthState.idToken.claims;

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
