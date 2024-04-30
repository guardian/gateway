/* eslint-disable functional/no-let */
/**
 * This file contains helper functions that are used in the okta-login.ts file.
 * Used to facilitate functionality to redirect users from the login page to our custom login/welcome page on Gateway.
 *
 * As with the okta-login.ts file, when modifying these files, be sure to code defensively, as we want to handle any errors or unexpected flows that may occur.
 */

/**
 * @interface SignInWidgetConfig
 * @description The configuration object for the Okta Sign-In Widget.
 *
 * A subset of the configuration options are available for use in the Okta Sign-In page.
 *
 * The `relayState` encodes the oauth flow as a url, is used to redirect users to complete the oauth flow.
 *
 * You can view more options by console logging the `window.OktaUtil.getSignInWidgetConfig()` object if needed on the Okta hosted sign in page.
 */
interface SignInWidgetConfig {
	relayState?: string;
}

/**
 * @interface RequestContext
 * @description The context object for the Okta Sign-In Widget.
 *
 * A subset of the request context options are available for use in the Okta Sign-In page.
 *
 * Used to perform per app customizations.
 * https://developer.okta.com/docs/guides/custom-widget/main/#per-application-customization
 *
 * Specifically used to get the `clientId` which is the Oauth application client id, and the `label` which is the application name.
 *
 * You can view more options by console logging the `window.OktaUtil.getRequestContext()` object if needed on the Okta hosted sign in page.
 */
interface RequestContext {
	target?: {
		clientId?: string;
		label?: string;
	};
	app?: {
		value?: {
			id?: string;
			label?: string;
		};
	};
	authentication?: {
		request?: {
			max_age?: number;
		};
	};
}

/**
 * @interface OktaUtil
 * @description The OktaUtil object for the Okta Sign-In Widget.
 *
 * A subset of the OktaUtil options are available for use in the Okta Sign-In page.
 *
 * Specially used to type the `getSignInWidgetConfig` and `getRequestContext` functions.
 *
 * You can view more options by console logging the `window.OktaUtil` object if needed on the Okta hosted sign in page.
 */
export interface OktaUtil {
	getSignInWidgetConfig: () => SignInWidgetConfig;
	getRequestContext: () => RequestContext;
	completeLogin: () => void;
}

export type OktaSignIn = {
	new (config: SignInWidgetConfig): OktaSignIn;
	renderEl(
		options: {
			el: string;
		},
		callback: OktaUtil['completeLogin'],
		error: (err: Error) => void,
	): void;
};

/**
 * @name getRelayState
 * @description Get the relayState from the Okta Sign-In Widget configuration.
 *
 * @param signInWidgetConfig
 * @returns string | undefined
 */
export const getRelayState = (
	signInWidgetConfig: SignInWidgetConfig,
): string | undefined => {
	return signInWidgetConfig.relayState;
};

/**
 * @name getClientId
 * @description Get the clientId from the Okta Sign-In Widget request context.
 *
 * @param requestContext
 * @returns string | undefined
 */
export const getClientId = (
	requestContext: RequestContext,
): string | undefined => {
	// requestContext.target.clientId is for Okta Identity Classic
	// requestContext.app.value.id is for Okta Identity Engine
	return requestContext.target?.clientId || requestContext.app?.value?.id;
};

/**
 * @name getThirdPartyClientId
 * @description Get the third party clientId from the Okta Sign-In Widget request context. This is the legacy `clientId` parameter used in Gateway and Identity
 *
 * @param requestContext
 * @returns string | undefined
 */
export const getThirdPartyClientId = (
	requestContext: RequestContext,
): string | undefined => {
	// requestContext?.target?.label is for Okta Identity Classic
	// requestContext?.app?.value?.label is for Okta Identity Engine
	const label =
		requestContext.target?.label || requestContext.app?.value?.label;
	switch (label) {
		case 'jobs_site':
			return 'jobs';
	}
};

/**
 * @name getThirdPartyReturnUrl
 * @description Get the third party returnUrl from the Okta Sign-In Widget request context. This is the legacy `returnUrl` parameter used in Gateway and Identity
 *
 * @param requestContext
 * @returns string | undefined
 */
export const getThirdPartyReturnUrl = (
	locationOrigin: string,
	requestContext: RequestContext,
): string | undefined => {
	// requestContext?.target?.label is for Okta Identity Classic
	// requestContext?.app?.value?.label is for Okta Identity Engine
	const label =
		requestContext.target?.label || requestContext.app?.value?.label;
	switch (label) {
		case 'jobs_site':
			return encodeURIComponent(locationOrigin.replace('profile', 'jobs'));
	}
};

/**
 * @name getMaxAge
 * @description Get the max_age from the Okta Sign-In Widget request context.
 *
 * @param requestContext
 * @returns number | undefined
 */
export const getMaxAge = (
	requestContext?: RequestContext,
): number | undefined => {
	return requestContext?.authentication?.request?.max_age;
};

/**
 * @name removePrefixFromToken
 * @description Remove the prefix from the token.
 *
 * If the token is prefixed with an appPrefix, remove it, otherwise redirect loops may occur.
 *
 * @param token
 * @returns string | undefined
 */
export const removePrefixFromToken = (
	token?: string | null,
): string | undefined => {
	if (!token) {
		return undefined;
	}

	const prefix = ['al_', 'il_', 'af_', 'if_'].find((prefix) =>
		token.startsWith(prefix),
	);

	if (!prefix) {
		return token;
	}

	return token.replace(prefix, '');
};

/**
 * @name getRedirectUrl
 * @description Get the url to redirect users to when the land on the Okta hosted sign in page.
 *
 * Determines whether to send the user to /signin or /welcome/:token on gateway from the Okta hosted sign in page.
 * This allows us to show our custom login/welcome page which we have full control over.
 *
 * We also pass on parameters to Gateway to help with the oauth flow, specifically the `appClientId` and `fromURI`. These parameters allow us to redirect users back to the correct oauth flow from Gateway.
 *
 * @param locationSearch `window.location.search`
 * @param locationOrigin `window.location.origin`
 * @param oktaUtil `window.OktaUtil`
 * @returns string
 */
export const getRedirectUrl = (
	searchParams: URLSearchParams,
	locationOrigin: string,
	locationPathname: string,
	oktaUtil?: OktaUtil,
): string => {
	// set up params class to hold the parameters we'll be passing to our own login page
	const params = new URLSearchParams();

	// Variable holders for the Okta params we want to pass to our own login page
	// This is the URI to redirect to after the user has logged in and has a session set to complete the Authorization Code Flow from the SDK.
	let fromURI: string | undefined;

	// This is the client ID of the application that is calling the SDK and in turn performing the Authorization Code Flow. This parameter can be used to customise the experience our pages. We attempt to get it from the OktaUtil object, with the existing search parameters as a fallback option
	let clientId: string | undefined;

	// third party `clientId` query param in Identity, used for `jobs` (Guardian Jobs)
	// where we need to add this to the query params we send to gateway
	let thirdPartyClientId: string | undefined;

	// third party `returnUrl` query param in Identity, used for `jobs` (Guardian Jobs)
	// where we need to add this to the query params we send to gateway
	let thirdPartyReturnUrl: string | undefined;

	// This is the max permitted time since a user last authenticated. If the user last authenticated
	// more than this number of seconds ago, they will be prompted to re-authenticate. We attempt to get it
	// from the OktaUtil object, with the existing search parameters as a fallback option.
	let maxAge: number | undefined;

	// check the Okta hosted login page query params for an activation token for welcome page
	const activationToken = removePrefixFromToken(
		searchParams.get('activation_token'),
	);

	// check for reset password token
	const resetPasswordToken = removePrefixFromToken(
		searchParams.get('reset_password_token'),
	);

	// check for set password token
	const setPasswordToken = removePrefixFromToken(
		searchParams.get('set_password_token'),
	);

	// check for referral tracking parameters
	// refViewId is the page view id of the referring page whether on app or web
	const refViewId = searchParams.get('refViewId');

	// ref is the referring page url whether on app or web
	const ref = searchParams.get('ref');

	// check for page parameter, used to show a particular page on gateway
	const page = searchParams.get('page');

	// attempt to get the parameters we need from the Okta hosted login page OktaUtil object
	if (oktaUtil) {
		// try getting fromURI from OktaUtil signInWidgetConfig (property is called called relayState)
		const signInWidgetConfig = oktaUtil.getSignInWidgetConfig();
		fromURI = getRelayState(signInWidgetConfig);

		// try getting clientId from OktaUtil requestContext
		const requestContext = oktaUtil.getRequestContext();
		clientId = getClientId(requestContext);

		// determine if this is a third party client e.g. jobs and set the thirdPartyClientId and thirdPartyReturnUrl
		thirdPartyClientId = getThirdPartyClientId(requestContext);
		thirdPartyReturnUrl = getThirdPartyReturnUrl(
			locationOrigin,
			requestContext,
		);

		// try getting maxAge from OktaUtil requestContext
		maxAge = getMaxAge(requestContext);
	}

	// if we're unable to get clientId from OktaUtil, try to get it from the search params where it will exist
	if (!clientId) {
		clientId = searchParams.get('client_id') || undefined;
	}

	// Try and get maxAge from the search params where it may exist
	if (!maxAge && searchParams.has('max_age')) {
		// We know max_age exists here so we can use the non-null assertion operator (!)
		maxAge = parseInt(searchParams.get('max_age')!, 10);
	}

	// if fromURI doesn't exist, which is the case when prompt="login" is set and the user is already logged in
	// we pass the current url as the fromURI so that the user completes the OAuth flow after login
	// as all the parameters we need are in the url
	// however this works only in the case when the pathname starts with /oauth2/
	if (!fromURI && locationPathname.startsWith('/oauth2/')) {
		// delete the prompt parameter so that the user doesn't get stuck in a login loop
		searchParams.delete('prompt');
		// delete any custom parameters oauth doesn't use
		searchParams.delete('activation_token');
		searchParams.delete('reset_password_token');
		searchParams.delete('set_password_token');
		searchParams.delete('page');
		searchParams.delete('refViewId');
		searchParams.delete('ref');
		// set the fromURI parameter
		params.set('fromURI', locationPathname + '?' + searchParams.toString());
	}

	// add the parameters to the params class
	if (fromURI) {
		params.set('fromURI', fromURI);
	}
	if (clientId) {
		params.set('appClientId', clientId);
	}
	if (thirdPartyClientId) {
		params.set('clientId', thirdPartyClientId);
	}
	if (thirdPartyReturnUrl) {
		params.set('returnUrl', thirdPartyReturnUrl);
	}
	// Set maxAge if it exists and isn't -1 (which Okta sets it to by default)
	if (maxAge !== undefined && maxAge >= 0) {
		params.set('maxAge', maxAge.toString());
	}
	// set tracking parameters
	if (refViewId) {
		params.set('refViewId', refViewId);
		// for tracking both ref and refViewId are required, but ref might not be available on app so we use a fallback of the current url
		if (ref) {
			params.set('ref', ref);
		} else {
			params.set('ref', `${locationOrigin}${locationPathname}`);
		}
	}

	// if we have an activation token, we know we need to go to the create password/welcome page
	if (activationToken) {
		return `/welcome/${activationToken}?${params.toString()}`;
	}

	// if we have a reset password token, we know we need to go to the reset password page
	if (resetPasswordToken) {
		return `/reset-password/${resetPasswordToken}?${params.toString()}`;
	}

	// if we have a set password token, we know we need to go to the set password page
	if (setPasswordToken) {
		return `/set-password/${setPasswordToken}?${params.toString()}`;
	}

	// if we have a page parameter, we need to go to that page on gateway
	if (page) {
		// only allow certain pages
		switch (page) {
			// show a specific page on gateway
			case 'register':
				return `/${page}?${params.toString()}`;
			// instantly start google or apple authentication through gateway
			case 'google':
			case 'apple':
				return `/signin/${page}?${params.toString()}`;
			default:
				// if the page parameter is not one of the allowed pages, then break
				break;
		}
	}

	// if we don't have any tokens, we need to go to the sign in page
	return `/signin?${params.toString()}`;
};
