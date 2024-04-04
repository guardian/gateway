import { NextFunction, Request } from 'express';
import { getCurrentSession } from '@/server/lib/okta/api/sessions';
import { clearOktaCookies } from '@/server/routes/signOut';
import { logger } from '@/server/lib/serverSideLogger';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { read } from '@/server/lib/idapi/auth';
import { IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { clearIDAPICookies } from '@/server/lib/idapi/IDAPICookies';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { getErrorMessageFromQueryParams } from '@/server/routes/signIn';

const { okta, defaultReturnUri, baseUri } = getConfiguration();

/** Middleware function which will either show the SignedInAs page (for Okta),
 * or redirect to the returnUrl (for IDAPI).
 */
export const redirectIfLoggedIn = async (
	req: Request,
	res: ResponseWithRequestState,
	next: NextFunction,
) => {
	const state = res.locals;
	const { useIdapi, error, error_description } = state.queryParams;

	// Okta Identity Engine session cookie is called `idx`
	const oktaIdentityEngineSessionCookieId: string | undefined = req.cookies.idx;

	const identitySessionCookie = req.cookies.SC_GU_U;
	const identityLastAccessCookie = req.cookies.SC_GU_LA;

	// Check if the user has an existing Okta session.
	if (okta.enabled && !useIdapi && oktaIdentityEngineSessionCookieId) {
		try {
			// check if maxAge is set. If it is, the user last authenticated more than maxAge ago.
			// This is automatically checked by Okta during the authorization code flow so we don't
			// need to check it again. But we only set maxAge in flows where we want to re-authenticate
			// the user after a specific time, i.e. MMA. If we don't make this check here, the 'signed in as'
			// page will be shown, which will allow a user to get new OAuth tokens without re-authenticating.
			if (state.queryParams?.maxAge) {
				return res.redirect(
					303,
					addQueryParamsToPath('/reauthenticate', res.locals.queryParams),
				);
			}

			// If they do have an existing Okta session, get the session info to check that it's valid
			// (this throws if the session is invalid)
			const session = await getCurrentSession({
				idx: oktaIdentityEngineSessionCookieId,
			});

			// pull the user email from the session, which we need to display
			const email = session.login;

			// determine the "Continue" button link, either "fromURI" if coming from Okta login page (and OAuth flow)
			// or /signin/refresh if not (this will refresh their identity and okta session and redirect them back to the returnUrl)
			const continueLink =
				state.queryParams.fromURI ||
				`https://${baseUri}${addQueryParamsToPath(
					'/signin/refresh',
					state.queryParams,
				)}`;

			// the "Sign in" link is used to log in as a different user, so we add the parameters we need to the link
			const signInLink = encodeURIComponent(
				`https://${baseUri}${addQueryParamsToPath(
					'/signin',
					state.queryParams,
				)}`,
			);

			// the sign out link is what's the "Sign in with a different email" link is pointing to
			// it signs the user out first, and then redirects to the sign in page with the required parameters
			const signOutLink = addQueryParamsToPath('/signout', {
				returnUrl: signInLink,
			});

			// show the signed in as page
			const html = renderer('/signed-in-as', {
				requestState: mergeRequestState(state, {
					pageData: {
						email,
						continueLink,
						signOutLink,
					},
					globalMessage: {
						error: getErrorMessageFromQueryParams(error, error_description),
					},
				}),
				pageTitle: 'Sign in',
			});

			return res.type('html').send(html);
		} catch {
			// if the cookie exists, but the session is invalid, we remove the cookie
			clearOktaCookies(res);
			// we also clear the identity cookies, to keep the parity
			clearIDAPICookies(res);
			logger.info(
				'User attempting to access signed-out-only route had an existing Okta session cookie, but it was invalid',
				undefined,
				{
					request_id: res.locals.requestId,
				},
			);
			//we redirect to /reauthenticate to make sure the cookies has been removed
			return res.redirect(
				303,
				addQueryParamsToPath('/reauthenticate', res.locals.queryParams),
			);
		}
	} else {
		// this is the IDAPI only flow, i.e with no Okta cookie, or with the useIdapi flag
		if (identitySessionCookie && identityLastAccessCookie) {
			logger.info(
				'User attempting to access signed-out-only route had existing IDAPI cookies set.',
				undefined,
				{
					request_id: res.locals.requestId,
				},
			);
			try {
				//Check if the current Identity session cookie is valid
				const auth = await read(
					identitySessionCookie,
					identityLastAccessCookie,
					req.ip,
					res.locals.requestId,
				);
				//if the current session is valid redirect to the chosen URL
				if (
					auth.status === IDAPIAuthStatus.RECENT ||
					auth.status === IDAPIAuthStatus.NOT_RECENT
				) {
					return res.redirect(defaultReturnUri);
				} else {
					//otherwise the user has an invalid session cookie, so we take them back to
					// /reauthenticate and delete the Identity cookies
					clearIDAPICookies(res);
					return res.redirect(
						303,
						addQueryParamsToPath('/reauthenticate', res.locals.queryParams),
					);
				}
			} catch {
				// If we fail to get a response from Identity Api to check the users status,
				// we will redirect to the redirect URL
				return res.redirect(defaultReturnUri);
			}
		}
	}
	return next();
};
