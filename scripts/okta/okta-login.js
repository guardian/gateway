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

// use IIFE to avoid global scope pollution on the Okta hosted login page
(function () {
  // set up params class to hold the parameters we'll be passing to our own login page
  const params = new URLSearchParams();

  // get the parameters from the Okta hosted login page
  const fromURI = window.OktaUtil.getSignInWidgetConfig().relayState;
  const clientId = window.OktaUtil.getRequestContext().target.clientId;

  // add the parameters to the params class
  params.set('fromURI', fromURI);
  params.set('clientId', clientId);
  // set the useOkta flag
  params.set('useOkta', 'true');

  // check the Okta hosted login page query params for an activation toke
  const searchParams = new URLSearchParams(window.location.search);
  const activationToken = searchParams.get('activation_token');
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
