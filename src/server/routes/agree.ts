import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { trackMetric } from '@/server/lib/trackMetric';
import deepmerge from 'deepmerge';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { setupJobsUserInOkta } from '@/server/lib/jobs';
import { loginMiddlewareOAuth } from '@/server/lib/middleware/login';
import { deleteOAuthTokenCookie } from '@/server/lib/okta/tokens';

const { defaultReturnUri, signInPageUrl } = getConfiguration();

router.get(
	'/agree/GRS',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const { oauthState } = res.locals;

		const state = res.locals;
		const { returnUrl, fromURI } = state.queryParams;

		// Redirect to /signin if tokens for some reason, this shouldn't be the case
		// thanks to the loginMiddlewareOAuth middleware, but this is to get typescript to comply
		if (!oauthState.idToken) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
			);
		}

		try {
			// extract the users profile from the id token
			const {
				is_jobs_user: isJobsUser,
				first_name: firstName,
				last_name: lastName,
				email,
			} = oauthState.idToken.claims;

			const userFullNameSet = !!firstName && !!lastName;

			// The user is redirected immediately if they are already
			// a jobs user and have they have their full name set.
			if (isJobsUser && userFullNameSet) {
				// complete the oauth flow if coming from the okta sign in page
				// through the oauth flow initiated by the jobs site
				if (fromURI) {
					return res.redirect(303, fromURI);
				}

				// otherwise try going to the return url
				const redirectUrl = returnUrl || defaultReturnUri;
				return res.redirect(
					303,
					addQueryParamsToUntypedPath(redirectUrl, {
						...res.locals.queryParams,
						returnUrl: '', // unset returnUrl so redirect won't point to itself.
					}),
				);
			}

			const html = renderer('/agree/GRS', {
				requestState: deepmerge(res.locals, {
					pageData: {
						firstName,
						secondName: lastName,
						userBelongsToGRS: isJobsUser,
						email,
					},
				}),
				pageTitle: 'Jobs',
			});

			return res.type('html').send(html);
		} catch (error) {
			logger.error(
				`${req.method} ${req.originalUrl} Error fetching Jobs user in Okta`,
				error,
				{
					request_id: res.locals.requestId,
				},
			);
			// Redirect to /signin if an error occurs when fetching the users' data.
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
			);
		}
	},
);

router.post(
	'/agree/GRS',
	loginMiddlewareOAuth,
	async (req: Request, res: ResponseWithRequestState) => {
		const { returnUrl, fromURI } = res.locals.queryParams;
		const { oauthState } = res.locals;

		const { firstName, secondName } = req.body;

		try {
			// Redirect to /signin if tokens for some reason, this shouldn't be the case
			// thanks to the loginMiddlewareOAuth middleware, but this is to get typescript to comply
			if (!oauthState.idToken) {
				return res.redirect(
					303,
					addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
				);
			}

			await setupJobsUserInOkta(
				firstName,
				secondName,
				oauthState.idToken.claims.sub,
			);

			// delete the ID token cookie, as we've updated the user model,
			// so a new token will be issued on the next request if needed
			deleteOAuthTokenCookie(res, 'GU_ID_TOKEN');

			trackMetric('JobsGRSGroupAgree::Success');
		} catch (error) {
			logger.error(
				`${req.method} ${req.originalUrl} Error updating Jobs user information`,
				error,
				{
					request_id: res.locals.requestId,
				},
			);
			trackMetric('JobsGRSGroupAgree::Failure');
		} finally {
			// complete the oauth flow if coming from the okta sign in page
			// through the oauth flow initiated by the jobs site
			if (fromURI) {
				return res.redirect(303, fromURI);
			}
			// otherwise try going to the return url
			return res.redirect(303, returnUrl);
		}
	},
);

export default router.router;
