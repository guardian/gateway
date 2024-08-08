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
import { requestStateHasOAuthTokens } from '../lib/middleware/requestState';

const { defaultReturnUri, signInPageUrl } = getConfiguration();

router.get(
	'/agree/GRS',
	loginMiddlewareOAuth,
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		const { returnUrl, fromURI } = state.queryParams;

		try {
			// extract the users profile from the id token
			const {
				is_jobs_user: isJobsUser,
				first_name: firstName,
				last_name: lastName,
				email,
			} = state.oauthState.idToken.claims;

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
						...state.queryParams,
						returnUrl: '', // unset returnUrl so redirect won't point to itself.
					}),
				);
			}

			const html = renderer('/agree/GRS', {
				requestState: deepmerge(state, {
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
					request_id: state.requestId,
				},
			);
			// Redirect to /signin if an error occurs when fetching the users' data.
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}
	},
);

router.post(
	'/agree/GRS',
	loginMiddlewareOAuth,
	async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		if (!requestStateHasOAuthTokens(state)) {
			return res.redirect(
				303,
				addQueryParamsToUntypedPath(signInPageUrl, state.queryParams),
			);
		}

		const { returnUrl, fromURI } = state.queryParams;
		const { firstName, secondName } = req.body;

		try {
			await setupJobsUserInOkta(
				firstName,
				secondName,
				state.oauthState.idToken.claims.sub,
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
					request_id: state.requestId,
				},
			);
			trackMetric('JobsGRSGroupAgree::Failure');
		} finally {
			// complete the oauth flow if coming from the okta sign in page
			// through the oauth flow initiated by the jobs site
			if (fromURI) {
				// eslint-disable-next-line no-unsafe-finally -- we want to redirect and return regardless of any throws
				return res.redirect(303, fromURI);
			}
			// otherwise try going to the return url
			// eslint-disable-next-line no-unsafe-finally -- we want to redirect and return regardless of any throws
			return res.redirect(303, returnUrl);
		}
	},
);

export default router.router;
