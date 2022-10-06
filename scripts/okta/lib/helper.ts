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
  getSignInWidgetConfig?: () => SignInWidgetConfig;
  getRequestContext?: () => RequestContext;
}

/**
 * @name getRelayState
 * @description Get the relayState from the Okta Sign-In Widget configuration.
 *
 * @param signInWidgetConfig
 * @returns string | undefined
 */
export const getRelayState = (
  signInWidgetConfig?: SignInWidgetConfig,
): string | undefined => {
  return signInWidgetConfig?.relayState;
};

/**
 * @name getClientId
 * @description Get the clientId from the Okta Sign-In Widget request context.
 *
 * @param requestContext
 * @returns string | undefined
 */
export const getClientId = (
  requestContext?: RequestContext,
): string | undefined => {
  return requestContext?.target?.clientId;
};

/**
 * @name getThirdPartyClientId
 * @description Get the third party clientId from the Okta Sign-In Widget request context. This is the legacy `clientId` parameter used in Gateway and Identity
 *
 * @param requestContext
 * @returns string | undefined
 */
export const getThirdPartyClientId = (
  requestContext?: RequestContext,
): string | undefined => {
  if (requestContext?.target?.label) {
    switch (requestContext?.target?.label) {
      case 'jobs_site':
        return 'jobs';
    }
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
  requestContext?: RequestContext,
): string | undefined => {
  if (requestContext?.target?.label) {
    switch (requestContext?.target?.label) {
      case 'jobs_site':
        return encodeURIComponent(locationOrigin.replace('profile', 'jobs'));
    }
  }
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
  locationSearch: string,
  locationOrigin: string,
  oktaUtil?: OktaUtil,
): string => {
  // set up params class to hold the parameters we'll be passing to our own login page
  const params = new URLSearchParams();

  // parse the current search params on the page
  const searchParams = new URLSearchParams(locationSearch);

  // force fallback flag, used to test fallback behaviour
  const forceFallback = searchParams.get('force_fallback');

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

  // attempt to get the parameters we need from the Okta hosted login page OktaUtil object
  if (oktaUtil && !forceFallback) {
    // try getting fromURI from OktaUtil signInWidgetConfig (property is called called relayState)
    const signInWidgetConfig = oktaUtil?.getSignInWidgetConfig?.();
    fromURI = getRelayState(signInWidgetConfig);

    // try getting clientId from OktaUtil requestContext
    const requestContext = oktaUtil?.getRequestContext?.();
    clientId = getClientId(requestContext);

    // determine if this is a third party client e.g. jobs and set the thirdPartyClientId and thirdPartyReturnUrl
    thirdPartyClientId = getThirdPartyClientId(requestContext);
    thirdPartyReturnUrl = getThirdPartyReturnUrl(
      locationOrigin,
      requestContext,
    );
  }

  // if we're unable to get clientId from OktaUtil, try to get it from the search params where it will exist
  if (!clientId || forceFallback) {
    clientId = searchParams.get('client_id') || undefined;
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

  // check the Okta hosted login page query params for an activation toke
  const activationToken = searchParams.get('activation_token');

  if (activationToken) {
    // if we have an activation token, we know we need to go to the create password/welcome page
    return `/welcome/${activationToken}?${params.toString()}`;
  } else {
    // if we don't have an activation token, we need to go to the sign in page
    return `/signin?${params.toString()}`;
  }
};
