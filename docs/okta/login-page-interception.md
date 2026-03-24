# Okta Hosted Login Interception

When performing the OAuth Authorization Code flow with Okta, while navigating to the `/authorize` endpoint Okta will check if the user has an existing session.

If they do, then the user will be redirected back to the client app with the `authorization_code` parameter, and the SDK will then exchange this for the OAuth tokens.

If they don't, or the `prompt=login` parameter is included in the request, then the user will be prompted to sign in/authenticate. However this is done by Okta showing their own hosted login page, which has a lack of customisation options, and it doesn't provide us full control over the user experience, or doesn't allow us to do specific things during the process.

Examples of things we currently do that we can't do with the Okta hosted login page:

- On login if the user has not validated their email or has a weak password, we can block them from logging in and asking them to verify their email and set a stronger password.
- Set any Guardian specific cookies that are required for the user, e.g. legacy Identity cookies, ad-free cookie.
- Perform remediation work, e.g. getting social users into the correct group/state after registration
- Including a custom "onboarding" process after registration.

By default Okta doesn't allow us to use our own login page, but they do allow us to customise the HTML and JavaScript of their hosted login page. Using this we can intercept when the Okta hosted login page is loaded, and using some JavaScript we can redirect the user to our own login page on Gateway. We can then use our flows to authenticate the user, and when they do we can then redirect the user back to Okta in order to complete the Authorization Code Flow.

## How the interception works

We customise the Okta hosted login page to not load the sign in widget, but instead redirect the user to our own login page. Luckily through the Okta dashboard we're able to customise the HTML, and in turn the JavaScript that is loaded.

From the Okta hosted login page we need to pass the following parameters to our own login page:

- **`fromURI`**: This is the URI to redirect to after the user has logged in and has a session set to complete the Authorization Code Flow from the SDK.
- **`clientId`**: This is the client ID of the application that is calling the SDK and in turn performing the Authorization Code Flow. This parameter can be used to customise the experience our pages.

In the SDK we're also able to pass additional parameters, which we can use to pass the `activation_token` from the user's email link. This can then be used to direct the user to the create password/welcome page instead of the login page, and complete the authorization code flow from there.

The custom javascript for this can be seen in [`scripts/okta/okta-login.ts`](../../scripts/okta/okta-login.ts). And the custom HTML can be seen in [`scripts/okta/okta-login.html`](../../scripts/okta/okta-login.html).

The code is rendered in the Okta hosted sign in page at `/login/login.htm` or even at `/oauth2/<authorization server id>/v1/authorize` depending on what Okta feels like on the day (essentially we don't know when Okta decides to use, but it seems the latter is becoming more common in Okta Identity Engine).

We get the `fromURI` and `clientId` from the javascript in the hosted sign in page, which are passed in by Okta using parameters from the SDK.

If these exist, then we can redirect the user to the Gateway sign in page which will persist the `fromURI` through the login process, and redirect the user back to the callback uri supplied to the app with the `authorization_code` the Okta SDK should then finish as normal.

The general steps for the interception are shown in this high level diagram:

```mermaid
sequenceDiagram

participant ClientApp
participant Browser
participant Gateway
participant Okta

ClientApp->>Browser: Start Authorization Code Flow (with PKCE)
Browser->>Okta: Call OAuth /authorize?...
note over Okta: Okta global session check
opt no existing session - interception happens here
  Okta->>Browser: Return Okta Hosted Login Page
  note over Browser: Load HTML, execute JS,<br>redirect to Gateway
  Browser->>Gateway: Request /signin?fromUri={fromUri}&clientId={clientId}&...
  Gateway->>Browser: Load /signin?fromUri={fromUri}&clientId={clientId}&...
  note over Browser: User authenticates<br>i.e sign in, create account,<br>or reset password<br><br>Okta session set in browser<br><br>Perform redirect to fromURI
  Browser->>Okta: Request fromUri
end
Okta->>Browser: Redirect request to app with the `auth_code` parameter<br/>oauth redirect_uri
Browser->>ClientApp: Passes `auth_code` to App
ClientApp->>Okta: App uses auth_code to call OAuth /token to get OAuth tokens
Okta->>ClientApp: Return tokens to app
note over ClientApp: The app manages the tokens, which can now be used to<br/>authenticate requests, and for checking the user's<br/>session
```

## Customising the interception code

All the code for the interception is in the [`src/okta`](../../src/okta/) folder with the following structure:

```
src/okta
├── __tests__                           # Tests for the interception code
│   ├─── getClientId.test.ts
│   ├─── getMaxAge.test.ts
│   ├─── getRedirectUrl.test.ts
│   ├─── getRelayState.test.ts
│   ├─── getThirdPartyClientId.test.ts
│   └─── getThirdPartyReturnUrl.test.ts
├── static                              # Static HTML files to upload to Okta
│   ├─── okta-login.CODE.html           # The custom HTML for the CODE Okta hosted login page, which includes the interception code
│   ├─── okta-login.code.html           # The custom HTML for the CODE Okta hosted login page, which includes the interception code
│   ├─── okta-login.prod.html           # The custom HTML for the PROD Okta hosted login page, which includes the interception code
│   └─── login-default.html             # Default HTML for the Okta hosted login page, used in case we need to reset the custom HTML
├── helper.ts                           # Main helper functions for the interception code
├── index.ts                            # The custom TypeScript file which is compiled to the okta-login.js file
└── window.d.ts                         # The TypeScript definition file for the window object
```

The interception code is written in TypeScript, and is compiled to JavaScript using Webpack. The compiled JavaScript file is then used in the Okta hosted login page.

For development the first place to start is `index.ts` where the interception code is written. The code is written in TypeScript, and the main functions are in the `helper.ts` file which are imported into the `index.ts` file.

By writing these files in TypeScript, we can use modern syntax and features, and have the code compiled to ES5 JavaScript. It also allows us to use Jest to test this code, which will run as part of the CI pipeline, or manually using `make test` or `make test-unit`.

When modifying these files, be sure to code defensively, as we want to handle any errors or unexpected flows that may occur.

The Okta hosted sign in page doesn't have just one url which it executes on.

We've noticed the following two urls (paths):

- `/login/login.htm`
- `/oauth2/<authorization server id>/v1/authorize`

Each will have a different query string and different config objects which are handled as appropriate in `helper.ts`.

Okta Identity Engine now uses JS redirects instead of HTTP redirects.

This has the consequence that Social Sign In requires the SDK and widget to be loaded on the page in order to authenticate.

However we only want to do this in the case of Social Sign In, as we want to use our own custom login page for other flows.

So we check for the `idp` query param, which is only present in the case of Social Sign In or the callback path for Social Sign In.

If present, we load the SDK and widget to handle social sign in, otherwise we redirect to our custom login page.

## Deployment

It's not possible to terraform the Okta hosted login page, so we have to manually update the HTML in the Okta dashboard.

From the dashboard this is under "Customization" > "Brands" > "The Guardian - [STAGE]", and the one with the custom domain. Then under the "Pages" tab, and the "Configure" button for the "Sign-in Page". From there you can edit the HTML and JavaScript.

Whenever making changes to the Javascript its recommended to bust the Fastly cache as the intercept Javascript bundle doesn't use file hashes unlike the rest of Gateway's javascript, meaning that it can take 24hrs for the Javascript to be reflected on all browsers unless we manually clear the cache.

This can be done by navigating to the profile.theguardian.com service in Fastly and pressing the Purge button to purge the following 2 URLs:

- https://profile.theguardian.com/static/okta.main.js
- https://profile.theguardian.com/static/okta.runtime.js
