# Native apps integration with Okta

See [RFC 8252: OAuth 2.0 for Mobile and Native Apps](https://datatracker.ietf.org/doc/html/rfc8252) for the full recommendations. Specifically, the [Platform-Specific Implementation Details](https://datatracker.ietf.org/doc/html/rfc8252#appendix-B) section of the RFC describes the best practices for each platform - [iOS](https://datatracker.ietf.org/doc/html/rfc8252#appendix-B.1), [Android](https://datatracker.ietf.org/doc/html/rfc8252#appendix-B.2).

To hand control back to the App Native layer from the In-App Browser Tab we recommend [private-use URI scheme](https://datatracker.ietf.org/doc/html/rfc8252#section-7.1) (referred to as "custom URL scheme") redirects and [claimed "https" scheme URIs](https://datatracker.ietf.org/doc/html/rfc8252#section-7.2) (known as "Universal Links"). From our testing and POC implementation, we found that "custom URL schemes" worked better for redirects from the "in-app browser tab", however using this approach we should be careful not to send any identifiable information to the redirect URL, and when handling the redirect not to take any action with an unindented side effect.

However the below should be enough to implement the flows.

## Authentication (Sign in, Registration, Reset Password, Set Password)

### Sign In

The approach for both sign in and registration in native apps uses the Okta SDK methods to launch the authentication flow and handle the OAuth2/OIDC flow. From the Identity side, the call to the Okta own login page is intercepted and we redirect to our own login page with the parameters provided from the Okta hosted sign in page.

The SDKs we're using are the [Okta OIDC iOS SDK](https://github.com/okta/okta-oidc-ios) and [Okta OIDC Android SDK](https://github.com/okta/okta-oidc-android).

To initiate login or registration the app will use the SDK to call the relevant method. In Android this is done by calling `.signIn(...)` and in iOS by calling `.signInWithBrowser(...)`, without any additional parameters. The SDK uses this method to launch the Authorization Code Flow with PKCE. It will launch an in-app browser tab (iOS: `ASWebAuthenticationSession`, Android: `CustomTabsService` (Custom Tab)) to check if a user session exists in Okta. In most cases you will want to pass the `prompt=login` parameter to the SDK to ensure that the user is shown the sign in page regardless of if they have an existing session or not.

If a user session exists, Okta will redirect back to the app with an authorization code. The app will then use the SDK to exchange the authorization code for any tokens, usually the `id_token`, `access_token` and `refresh_token`. These tokens are stored in the SDK and can be used to authenticate the user, and authorize the app to access other resources. Once the tokens are received, checking the validity of these tokens is enough to check if the use is signed in, instead of having to perform the full login flow again.

If no user session exists, Okta will attempt to show it's own login page. When the browser attempts to load this page, we perform a JavaScript redirect to our own login page instead with any parameters that are required to complete the Authorization Code flow in the Native App. At this point the user can navigate between sign in and registration.

If the user signs in successfully, a session cookie will be set in the browser, and we complete sign in by redirecting the user back to the `fromURI` parameter. This will redirect the user to Okta, which will then redirect the user back to the app with the authorization code, and as above this is exchanged for tokens.

### Registration / Reset Password / Set Password

Registration works a bit differently. You may not need to implement this in your application as this can all be handled from within a browser, however the user would be asked to sign in again after registering if this approach was taken.

After launching the `.signIn(...)`/`.signInWithBrowser(...)` method the user will navigate to the registration page, enter their email, and be sent a registration email. The user will then have to navigate to their inbox, and click the link in the email. The app should intercept this link using the [claimed "https" scheme URIs](https://datatracker.ietf.org/doc/html/rfc8252#section-7.2) (known as "Universal Links"). The token should be extracted from this link, and passed to the SDK `.signIn(...)`/`.signInWithBrowser(...)` method as an additional parameter called `activation_token`. This will again launch the in-app browser to the Okta login page, on that page we check for this `activation_token` parameter and then redirect to our own set password/welcome page. The user will then set their password, get a session set, and we complete sign in by redirecting the user back to the `fromURI` parameter. Again, This will redirect the user to Okta, which will then redirect the user back to the app with the authorization code, and as above this is exchanged for tokens.

The link we send to the user will have a format like this:

```text
https://profile.theguardian.com/welcome/<app_prefix>_<token>

e.g. for the iOS live app (prefix is `il_`) a token could look like this:

https://profile.theguardian.com/welcome/il_nF2_qsKfDdPQlGFsEbYn

where everything after the prefix `il_` is the token.
```

A similar flow to registration is also required for reset password and set password flows. After launching the `.signIn(...)`/`.signInWithBrowser(...)` method the user will navigate to the reset password page, enter their email, and be sent a reset password or set password email depending on the state of their account. The difference to registration would be the link and the parameter required. The link we send to the user will have a format like this:

```text
# Reset password
https://profile.theguardian.com/reset-password/<app_prefix>_<token>

# Set password
https://profile.theguardian.com/set-password/<app_prefix>_<token>

e.g. for the android live app (prefix is `al_`) a token could look like this:

https://profile.theguardian.com/reset-password/al_nF2_qsKfDdPQlGFsEbYn

https://profile.theguardian.com/set-password/al_nF2_qsKfDdPQlGFsEbYn

where everything after the prefix `al_` is the token.
```

After intercepting these endpoints, like the registration method, the token should be extracted from this link and passed to the SDK `.signIn(...)`/`.signInWithBrowser(...)` method as an additional parameter called `reset_password_token` for reset password and `set_password_token` for set password. This will again launch the in-app browser to the Okta login page, on that page we check for this `reset_password_token`/`set_password_token` parameter and then redirect to our own reset password/set password page. The user will then set their password, get a session set, and we complete sign in by redirecting the user back to the `fromURI` parameter. Again, This will redirect the user to Okta, which will then redirect the user back to the app with the authorization code, and as above this is exchanged for tokens.

## Setup

To setup a native app, we will need to register the application as an client within Okta. The identity team will be able to do this for you. We will need to know 3 things, all do do with redirects.

1. A redirect callback URI for Okta authorization callback
   - This is used by the Okta SDK to redirect back to after performing the authorization code flow with PKCE used to get OAuth tokens if a session is set.
   - Similar to above we suggest a custom URL scheme for this URI, which we can identify (`your-app:/authorization/callback`).
   - e.g. `com.theguardian.app.oauth:/authorization/callback`
2. A redirect callback URI for Okta logout callback
   - This is used by the Okta SDK to redirect back to after calling the logout method in the SDK.
   - Similar to above we suggest a custom URL scheme for this URI, which we can identify (`your-app:/logout/callback`).
   - e.g. `com.theguardian.app.oauth:/logout/callback`

No 1. will be handled by the Okta SDK.

No 2. may have to be handled by the application rather than the Okta SDK to handle post logout clean up.

We will need a set for the PROD, CODE, and possibly DEV environments.

Once the app is set up within Okta and this project. The Identity team will give you the following information to configure the Okta SDK:

| Name                | Key                                            | Explanation                                                                                                                                                                                                       | Example                                                                           |
| ------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Client ID           | `client_id`/`clientId`                         | The client ID from the app integration that was created                                                                                                                                                           | `0ux3rutxocxFX9xyz3t9`                                                            |
| Issuer              | `discovery_uri`/`issuer`                       | Domain of the Okta app, followed by the OAuth authorization server. We use a custom authorization server rather than the default one as it lets us customise lifetimes of tokens                                  | `https://profile.theguardian.com/oauth2/aus2qtyn7pS1YsVLs0x7`                     |
| Logout Redirect URI | `end_session_redirect_uri`/`logoutRedirectUri` | The post-logout redirect URI from the app integration that was created                                                                                                                                            | `com.theguardian.app.oauth:/logout/callback`                                      |
| Redirect URI        | `redirect_uri`/`redirectUri`                   | The Redirect URI from the app integration that was created                                                                                                                                                        | `com.theguardian.app.oauth:/authorization/callback`                               |
| Scopes              | `scopes`                                       | Default permissions for the OAuth tokens, you'll want `openid profile offline_access` at the minimum. Information about the scopes can be seen [here](https://developer.okta.com/docs/reference/api/oidc/#scopes) | `openid profile offline_access` or json `["openid", "profile", "offline_access"]` |

The relevant `.well-known` files to be able to handle these redirects within the app.

See [apple-app-site-association](../../src/client/.well-known/apple-app-site-association) for iOS and [assetlinks.json](../../src/client/.well-known/assetlinks.json) for Android to be able to do this.

## Diagrams

### Sign In

Much of the following is adopted from [signin.md](signin.md), with changes to fit the native apps implementation. Apps should only need to be aware of what's happening in the native layer, but the full flow is useful for understanding the interaction between the native layer and the identity system. User interaction is implied.

To initiate sign-in from the app, you can call this via the Okta SDK using `.signInWithBrowser(from: self)` in iOS or `.signIn(this, null)` in Android.

```mermaid
sequenceDiagram
autonumber

participant NativeLayer
participant InAppBrowserTab
participant Gateway
participant Okta

NativeLayer ->> InAppBrowserTab: Call `signin`/`signInWithBrowser`<br/>to perform<br />Authorization Code Flow with PKCE
note over InAppBrowserTab: SDK will launch another in-app browser<br/>tab to handle the session check,<br/> and redirect back to the app with auth code
InAppBrowserTab->>Okta: call OAuth /authorize
note over Okta: Existing session check
opt no existing session
  Okta->>InAppBrowserTab: Redirect request to /login/login.html
  InAppBrowserTab->>Okta: Request  /login/login.html
  Okta->>InAppBrowserTab: Return /login/login.html
  note over InAppBrowserTab: Run JS script<br>This redirect to /signin or /welcome/:token<br> with fromURI and clientId params
  InAppBrowserTab->>Gateway: Request /signin
  Gateway->>InAppBrowserTab: Return /signin
  InAppBrowserTab ->> Gateway: Login form POST /signin (email + password)
  Gateway ->> Okta: Authenticate with Okta<br/>/authn with email + pw)
  note over Okta: validate email + password
  Okta ->> Gateway: response with sessionToken<br/>+ email/okta_id
  note over Gateway: Perform auth code flow to create<br>Okta session
  Gateway ->> InAppBrowserTab: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none&sessionToken={sessionToken}...<br>see notes for other parameters/implementation
  InAppBrowserTab ->> Okta: Request /authorize
  note over Okta: Use sessionToken to create an okta session on<br/>auth subdomain as cookie
  Okta ->> InAppBrowserTab: Redirect request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...<br/>see notes for other parameters/implementation
  InAppBrowserTab ->> Gateway: Request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...
  Gateway ->> InAppBrowserTab: Redirect to fromURI parameter<br/> e.g. `/authorize?okta_key={okta_key}`
  InAppBrowserTab ->> Okta: Request /authorize?okta_key={okta_key}
  note over Okta: Session check<br>at this point session exists<br>in all scenarios
end
Okta ->> InAppBrowserTab: Redirect request to app with the `auth_code` parameter<br/>e.g. `com.theguardian.app.oauth:/authorization/callback?auth_code={auth_code}`
InAppBrowserTab ->> NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>e.g.`com.theguardian.app.oauth:/authorization/callback?auth_code={auth_code}`
NativeLayer ->> Okta: SDK uses auth_code to call OAuth /token to get OAuth tokens
Okta ->> NativeLayer: Return tokens to SDK
note over NativeLayer: the SDK manages the tokens, which can now be used to<br/>authenticate requests, and for checking the user's<br/>session
```

### Registration (and (Re)set Password)

Similar to sign in, but with changes around registration to fit the native apps implementation. Apps should only need to be aware of what's happening in the native layer, but the full flow is useful for understanding the interaction between the native layer and the identity system. User interaction is implied. This flow is very similar for reset and set password.

On certain applications you might not need to implement the Registration and Reset Password flows, especially as this adds development overhead. It's always possible to register the user on an in-app browser tab and then have the user sign in again. However this is an extra step for the user.

We also support the scenario where we want to log the user in once they have exchanged the activation_token from their email inbox and set their password, this is the 2nd step of the registration flow.

To initiate 2nd step of the registration flow from the app, you can call this via the Okta SDK using `.signInWithBrowser(additionalParameters: [activation_token: {activationToken}])` or `.signIn(this, payload)` in Android, where `payload` can be seen [here](https://github.com/okta/okta-oidc-android#sign-in-with-a-browser), with an `.addParameter("activation_token", activationToken)`.

The start of this flow is very similar to the sign in journey.

```mermaid
sequenceDiagram
autonumber

participant NativeLayer
participant InAppBrowserTab
participant Gateway
participant Okta
participant EmailInbox

NativeLayer ->> InAppBrowserTab: Call `signin`/`signInWithBrowser`<br/>to perform<br />Authorization Code Flow with PKCE
note over InAppBrowserTab: SDK will launch another in-app browser<br/>tab to handle the session check
InAppBrowserTab ->> Okta: call OAuth /authorize
note over Okta: Existing session check
alt
  Okta ->> InAppBrowserTab: Redirect request to /login/login.html
  InAppBrowserTab ->> Okta: Request  /login/login.html
  Okta ->> InAppBrowserTab: Return /login/login.html
  note over InAppBrowserTab: Run JS script<br>This redirect to /signin<br> with fromURI and clientId params
  InAppBrowserTab ->> Gateway: Request /signin
  Gateway ->> InAppBrowserTab: Return /signin
  InAppBrowserTab ->> Gateway: Request /register
  Gateway ->> InAppBrowserTab: Return /register
  InAppBrowserTab  ->>  Gateway: Login form POST /register (email)
  Gateway ->> Okta: register with Okta (no password) POST /api/v1/users?activate=false
  Okta ->> Gateway: user response object status: STAGED
  par Okta setup account
    Gateway ->> Okta: activate user POST /api/v1/users/${userId}/lifecycle/activate?sendEmail=true
    Okta ->> Gateway: activation token status: PROVISIONED
  and
    Okta ->> EmailInbox: Activation email
  end
  Gateway ->> InAppBrowserTab: Redirect to /register/email-sent
  InAppBrowserTab ->> Gateway: Request /register/email-sent
  Gateway ->> InAppBrowserTab: Return /register/email-sent
  note over InAppBrowserTab: At this point the user<br>has to navigate to the email inbox<br/>and click the activation<br>link to activate their account.<br>The app should intercept this link<br>and handle the activation<br>process.
  EmailInbox ->> InAppBrowserTab: Click link in email /welcome/{prefix}_{activationToken}
  InAppBrowserTab ->> NativeLayer: Intercept activation link<br/>in-app browser tab to app
  note over NativeLayer: Extract token from link<br/>and use SDK methods
  NativeLayer ->> InAppBrowserTab: Call `signin`/`signInWithBrowser`<br/>to perform<br />Authorization Code Flow with PKCE<br>pass `activation_token` as additional parameter<br>or `reset_password_token` for reset password<br>or `set_password_token` for set password
  note over InAppBrowserTab: SDK will launch another in-app browser<br/>tab to handle the session check
  InAppBrowserTab ->> Okta: call OAuth /authorize
  note over Okta: Existing session check
  Okta ->> InAppBrowserTab: Redirect request to /login/login.html
  InAppBrowserTab ->> Okta: Request  /login/login.html
  Okta ->> InAppBrowserTab: Return /login/login.html
  note over InAppBrowserTab: Run JS script redirect<br>/welcome/:token<br>with fromURI and clientId params
  InAppBrowserTab ->> Gateway: Request /welcome/:token
  Gateway ->> InAppBrowserTab: Return /welcome/:token
  InAppBrowserTab->>Gateway: POST /welcome/{activationToken} with password
  Gateway ->> Okta: Set password return session token
  note over Gateway: Perform auth code flow to create<br>Okta session
  Gateway ->> InAppBrowserTab: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none&sessionToken={sessionToken}...<br>see notes for other parameters/implementation
  InAppBrowserTab ->> Okta: Request /authorize
  note over Okta: Use sessionToken to create an okta session on<br/>auth subdomain as cookie
  Okta ->> InAppBrowserTab: Redirect request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...<br/>see notes for other parameters/implementation
  InAppBrowserTab ->> Gateway: Request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...
  Gateway ->> InAppBrowserTab: Redirect to fromURI parameter<br/> e.g. `/authorize?okta_key={okta_key}`
  InAppBrowserTab ->> Okta: Request /authorize?okta_key={okta_key}
  note over Okta: Session check<br>at this point session exists<br>in all scenarios
end
Okta ->> InAppBrowserTab: Redirect request to app with the `auth_code` parameter<br/>e.g. `com.theguardian.app.oauth:/authorization/callback?auth_code={auth_code}`
InAppBrowserTab ->> NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>e.g.`com.theguardian.app.oauth:/authorization/callback?auth_code={auth_code}`
NativeLayer ->> Okta: SDK uses auth_code to call OAuth /token to get OAuth tokens
Okta ->> NativeLayer: Return tokens to SDK
note over NativeLayer: the SDK manages the tokens, which can now be used to<br/>authenticate requests, and for checking the user's<br/>session
```
