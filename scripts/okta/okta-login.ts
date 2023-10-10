// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./window.d.ts" />

import { getRedirectUrl } from './lib/helper';

// These files is the custom TypeScript for the Okta Login page. This includes this file, the helper file, and the window.d.ts file.
// We use these files to redirect users from the login page to our custom login/welcome page on Gateway.
// This is so we can use the Okta SDKs, but still use our own custom login pages.

// We use jsdelivr to load this script, the automatic minification reduces the size.
// e.g. <script src="https://cdn.jsdelivr.net/gh/guardian/gateway@main/scripts/okta/okta-login.min.js"></script>

// If testing out changes for a particular branch you can change the branch it's looking for in the custom HTML itself.
// e.g. for a branch called `feature-branch-xyz`
// <script src="https://cdn.jsdelivr.net/gh/guardian/gateway@feature-branch-xyz/scripts/okta/okta-login.min.js"></script>
// or commit
// <script src="https://cdn.jsdelivr.net/gh/guardian/gateway@df4557838d25ab7991130acc4cbe92e6ab063e6d/scripts/okta/okta-login.min.js"></script>

// If you make changes to these files, be sure to run `yarn gen:okta-login` to compile the TypeScript and generate the Javascript file, `okta-login.js`.
// Then be sure to commit the updated Javascript file in order to use it with jsdelivr.

// By writing these files in TypeScript, we can use modern syntax and features, and have the code compiled to ES5 JavaScript.
// It also allows us to use Jest to test this code, which will run as part of the CI pipeline, or manually using `yarn test` or `yarn test:unit`.

// When modifying these files, be sure to code defensively, as we want to handle any errors or unexpected flows that may occur.

// The Okta hosted sign in page doesn't have just one url which it executes on.
// We've noticed the following two urls (paths):
// - /login/login.htm
// - /oauth2/<authorization server id>/v1/authorize
// each will have a different query string and different config objects which are handled as appropriate in helper.ts.

const locationSearch = window.location.search;
const searchParams = new URLSearchParams(locationSearch);

// Okta Identity Engine now uses JS redirects instead of HTTP redirects.
// This has the consequence that Social Sign In requires the SDK and widget to be loaded on the page in order to authenticate.
// However we only want to do this in the case of Social Sign In, as we want to use our own custom login page for other flows.
// So we check for the `idp` query param, which is only present in the case of Social Sign In or the callback path for Social Sign In.
// If present, we load the SDK and widget to handle social sign in, otherwise we redirect to our custom login page.
if (
	searchParams.has('idp') ||
	window.location.pathname === '/oauth2/v1/authorize/callback'
) {
	const loginContainerId = 'okta-login-container';
	const config = window.OktaUtil.getSignInWidgetConfig();
	const oktaSignIn = new window.OktaSignIn(config);
	const loginContainer = document.getElementById('okta-login-container');
	oktaSignIn.renderEl(
		{ el: `#${loginContainerId}` },
		window.OktaUtil.completeLogin,
		(error) => {
			// eslint-disable-next-line no-console
			console.log(error.message, error);
			if (loginContainer) {
				// eslint-disable-next-line functional/immutable-data
				loginContainer.style.visibility = 'visible';
			}
		},
	);
} else {
	const redirectUrl = getRedirectUrl(
		searchParams,
		window.location.origin,
		window.location.pathname,
		window.OktaUtil,
	);

	window.location.replace(redirectUrl);
}
