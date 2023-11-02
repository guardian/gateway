import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	clearIDAPICookies,
	setSignOutCookie,
} from '@/server/lib/idapi/IDAPICookies';
import { deleteAuthorizationStateCookie } from '@/server/lib/okta/openid-connect';
import { clearEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { trackMetric } from '@/server/lib/trackMetric';
import { closeCurrentSession } from '@/server/lib/okta/api/sessions';
import { checkAndDeleteOAuthTokenCookies } from '@/server/lib/okta/tokens';

const { defaultReturnUri, baseUri } = getConfiguration();

// taken from https://github.com/guardian/frontend/blob/7d227003a16b9b7d9a2f571d4e23e8ed4f981a2c/static/src/javascripts/projects/common/modules/commercial/user-features.ts#L134
// dotcom expects these cookies to be cleared as part of signout
const DotComCookies = [
	'GU_AF1',
	'gu_user_features_expiry',
	'gu_paying_member',
	'gu_recurring_contributor',
	'gu_digital_subscriber',
	'gu_action_required_for',
	'gu_hide_support_messaging',
	'gu_one_off_contribution_date',
];

const OKTA_IDENTITY_CLASSIC_SESSION_COOKIE_NAME = 'sid';
const OKTA_IDENTITY_ENGINE_SESSION_COOKIE_NAME = 'idx';

const clearDotComCookies = (res: ResponseWithRequestState) => {
	// the baseUri is profile.theguardian.com so we strip the 'profile' as the cookie domain should be .theguardian.com
	// we also remove the port after the ':' to make it work in localhost for development and testing
	const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;
	DotComCookies.forEach((key) => {
		// we can't use res.clearCookie because we don't know the exact settings for these cookies
		// so we overwrite them with an empty string, and expire them immediately
		res.cookie(key, '', {
			domain,
			maxAge: 0, // set to 0 to expire cookie immediately, and clear these cookies
		});
	});
};

export const clearOktaCookies = (res: ResponseWithRequestState) => {
	// We do not set a domain attribute as doing this makes the hostOnly=false
	// and when the cookie is set by Okta, they do not specify a domain in the set-cookie header,
	// so the Okta sid cookie is consider hostOnly=true
	// https://www.appsecmonkey.com/blog/cookie-security#hostonly-property
	res.cookie(OKTA_IDENTITY_CLASSIC_SESSION_COOKIE_NAME, '', {
		maxAge: 0,
	});
	res.cookie(OKTA_IDENTITY_ENGINE_SESSION_COOKIE_NAME, '', {
		maxAge: 0,
	});
};

router.get(
	'/signout',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { returnUrl } = res.locals.queryParams;

		// We try the logout sequentially, as we need to log users out from Okta first,
		await signOutFromOkta(req, res);

		// if the user has no Okta sid cookie, we will then try and log them out from IDAPI
		// the user will be in this state if they previously had their Okta cookie removed and got
		// redirected back to the /signout endpoint
		await signOutFromIDAPI(req, res);

		// clear dotcom cookies
		clearDotComCookies(res);

		// clear gateway specific cookies
		deleteAuthorizationStateCookie(res);
		clearEncryptedStateCookie(res);

		// clear oauth application cookies
		checkAndDeleteOAuthTokenCookies(req, res);

		// set the GU_SO (sign out) cookie
		setSignOutCookie(res);

		return res.redirect(303, returnUrl || defaultReturnUri);
	}),
);

const signOutFromIDAPI = async (
	req: Request,
	res: ResponseWithRequestState,
): Promise<void> => {
	// sign out from idapi will invalidate ALL IDAPI sessions for the user no matter the device/browser
	// so we've changed from using the IDAPI sign out endpoint to just clearing the IDAPI cookies
	// so that the user is only signed out from the current device/browser
	clearIDAPICookies(res);

	trackMetric('SignOut::Success');
};

const signOutFromOkta = async (
	req: Request,
	res: ResponseWithRequestState,
): Promise<void> => {
	try {
		// attempt to log out from Okta if we have Okta session cookie
		// Okta Identity Engine session cookie is called `idx`
		const oktaIdentityEngineSessionCookieId: string | undefined =
			req.cookies.idx;

		if (oktaIdentityEngineSessionCookieId) {
			await closeCurrentSession({
				idx: oktaIdentityEngineSessionCookieId,
			});
			trackMetric('OktaSignOut::Success');
		}
	} catch (error) {
		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: res.locals.requestId,
		});
		trackMetric('OktaSignOut::Failure');
	} finally {
		//clear okta cookie
		clearOktaCookies(res);
	}
};

export default router.router;
