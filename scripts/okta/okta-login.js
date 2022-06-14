/* eslint-disable no-var */

// This file is the custom JavaScript for the Okta Login page.
// We use this file to redirect users from the login page to our custom login/welcome page on Gateway.
// This is so we can use the Okta SDKs, but still use our own custom login pages.

// We use jsdelivr to load this script, the automatic minification reduces the size.
// e.g. <script src="https://cdn.jsdelivr.net/gh/guardian/gateway@main/scripts/okta/okta-login.min.js"></script>

// If testing out changes for a particular branch you can change the branch it's looking for in the custom HTML itself.
// e.g. for a branch called `feature-branch-xyz`
// <script src="https://cdn.jsdelivr.net/gh/guardian/gateway@feature-branch-xyz/scripts/okta/okta-login.min.js"></script>
// or commit
// <script src="https://cdn.jsdelivr.net/gh/guardian/gateway@df4557838d25ab7991130acc4cbe92e6ab063e6d/scripts/okta/okta-login.min.js"></script>

// This should be written in ES5 for maximum compatibility between all browsers, and coded defensively to ensure there are no runtime errors.
// URLSearchParams is polyfilled in browsers that don't support it in the okta-login.html file

// use IIFE to avoid global scope pollution on the Okta hosted login page
(function () {
  // set up params class to hold the parameters we'll be passing to our own login page
  var params = new URLSearchParams();

  // parse the current search params on the page
  var searchParams = new URLSearchParams(window.location.search);

  // Variable holders for the Okta params we want to pass to our own login page
  // This is the URI to redirect to after the user has logged in and has a session set to complete the Authorization Code Flow from the SDK.
  var fromURI;
  // This is the client ID of the application that is calling the SDK and in turn performing the Authorization Code Flow. This parameter can be used to customise the experience our pages. We attempt to get it from the OktaUtil object, with the existing search parameters as a fallback option
  var clientId;

  // force fallback flag, used to test fallback behaviour
  var forceFallback = searchParams.get('force_fallback');

  // attempt to get the parameters we need from the Okta hosted login page OktaUtil object
  if (window.OktaUtil && !forceFallback) {
    // try getting fromURI from OktaUtil signInWidgetConfig (property is called called relayState)
    var signInWidgetConfig =
      window.OktaUtil.getSignInWidgetConfig &&
      window.OktaUtil.getSignInWidgetConfig();
    if (signInWidgetConfig && signInWidgetConfig.relayState) {
      fromURI = signInWidgetConfig.relayState;
    }

    // try getting clientId from OktaUtil requestContext
    var requestContext =
      window.OktaUtil.getRequestContext && window.OktaUtil.getRequestContext();
    if (
      requestContext &&
      requestContext.target &&
      requestContext.target.clientId
    ) {
      clientId = requestContext.target.clientId;
    }
  }

  // if we're unable to get clientId from OktaUtil, try to get it from the search params where it will exist
  if (!clientId || forceFallback) {
    clientId = searchParams.get('client_id');
  }

  // add the parameters to the params class
  if (fromURI) {
    params.set('fromURI', fromURI);
  }
  if (clientId) {
    params.set('appClientId', clientId);
  }
  // set the useOkta flag
  params.set('useOkta', 'true');

  // check the Okta hosted login page query params for an activation toke
  var activationToken = searchParams.get('activation_token');
  if (activationToken) {
    // if we have an activation token, we know we need to go to the create password/welcome page
    window.location.replace(
      '/welcome/' + activationToken + '?' + params.toString(),
    );
  } else {
    // if we don't have an activation token, we need to go to the sign in page
    window.location.replace('/signin?' + params.toString());
  }
})();
