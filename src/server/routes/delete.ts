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
						}),
					});
					return res.type('html').send(html);
				}
			}

			// if everything is ok, show the delete page
			const html = renderer('/delete', {
				requestState: state,
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
				}),
				pageTitle: 'Account Deletion',
			});
			return res.status(status).type('html').send(html);
		}
	}),
);

router.get(
	'/delete/complete',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/delete/complete', {
			requestState: res.locals,
			pageTitle: 'Account Deletion Complete',
		});
		res.type('html').send(html);
	},
);

export default router.router;
