# Native apps integration with Okta

## Authentication

The approach for both sign in and registration in native apps uses the Okta SDK along with a in-app browser tab (iOS: `SFSafariViewController`/`SFAuthenticationSession`, Android: `CustomTabsService` (Custom Tab)). First use the in-app browser tab to authenticate against the identity sign in and registration pages and get an Okta session cookie set in the user's browser. At the end of this process we redirect back into the application, and use the Okta SDK `signin`/`signInWithBrowser` with the `prompt=none` option to get the OAuth tokens, specifically the `id_token`, `access_token` and `refresh_token`. Once the tokens are received, checking the validity of these tokens is enough to check if the user is signed in, instead of having to perform the full login flow again.

See [RFC 8252: OAuth 2.0 for Mobile and Native Apps](https://datatracker.ietf.org/doc/html/rfc8252) for the full recommendations. Specifically, the [Platform-Specific Implementation Details](https://datatracker.ietf.org/doc/html/rfc8252#appendix-B) section of the RFC describes the best practices for each platform - [iOS](https://datatracker.ietf.org/doc/html/rfc8252#appendix-B.1), [Android](https://datatracker.ietf.org/doc/html/rfc8252#appendix-B.2).

To hand control back to the App Native layer from the In-App Browser Tab we recommend [private-use URI scheme](https://datatracker.ietf.org/doc/html/rfc8252#section-7.1) (referred to as "custom URL scheme") redirects and [claimed "https" scheme URIs](https://datatracker.ietf.org/doc/html/rfc8252#section-7.2) (known as "Universal Links"). From our testing and POC implementation, we found that "custom URL schemes" worked better for redirects from the "in-app browser tab", however using this approach we should be careful not to send any identifiable information to the redirect URL, and when handling the redirect not to take any action with an unindented side effect.

The general steps for native apps integration are shown in this high level diagram:

```mermaid
sequenceDiagram
autonumber
  participant NativeLayer
  participant InAppBrowserTab
  participant Gateway
  participant Okta

  opt generally handled by app/identity (Authentication/Session Setting)
    NativeLayer->>InAppBrowserTab: Open Browser Tab:<br/>`https://profile.theguardian.com/{signin|register}`
    InAppBrowserTab->>Gateway: Request `/signin` or `/register`
    Gateway->>InAppBrowserTab: Show requested page
    note over NativeLayer,Gateway: User takes action to sign in or register and<br/>a session gets set in the browser through<br/>the in-app browser tab
    Gateway->>InAppBrowserTab: Redirect back to app after<br/>session cookie set <br/>using custom URL scheme
    InAppBrowserTab->>NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>using custom URL scheme
    note over NativeLayer: Handle the callback<br/>request from the in-app browser<br/>tab to the native layer.<br/>The SDK will handle the rest of the following steps
  end
  opt generally handled by Okta SDK (Authorization)
    NativeLayer->>InAppBrowserTab: Call `signin`/`signInWithBrowser`<br/>with the `prompt=none` option method to perform<br />Authorization Code Flow with PKCE
    note over InAppBrowserTab: SDK will launch another in-app browser<br/>tab to handle the session check,<br/> and redirect back to the app with
    InAppBrowserTab->>Okta: call OAuth /authorize?prompt=none
    note over Okta: session check
    Okta->>InAppBrowserTab: Redirect request to app with the `auth_code` parameter<br/>oauth redirect_uri
    InAppBrowserTab->>NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>oauth redirect_uri?auth_code={code}
    NativeLayer->>Okta: SDK uses auth_code to call OAuth /token to get OAuth tokens
    Okta->>NativeLayer: Return tokens to SDK
    note over NativeLayer: the SDK manages the tokens, which can now be used to<br/>authenticate requests, and for checking the user's<br/>session
  end
```

## Setup

To setup a native app, we will need to register the application as an client within Okta. The identity team will be able to do this for you. We will need to know 3 things, all do do with redirects.

1. A redirect URI for redirection from sign in and registration pages (authentication).
   - This is the URI that the native app will be redirected to after a user signs in or registers on the profile subdomain and gets a session cookie set in the browser.
   - This callback should be used to call the Okta SDK `signin`/`signInWithBrowser` with the `prompt=none` option to get the OAuth tokens, specifically the `id_token`, `access_token` and `refresh_token`.
   - We suggest a custom URL scheme for this URI, which we can identify (`your-app:/authentication/callback`).
   - e.g. `com.theguardian.app:/authentication/callback`
2. A redirect callback URI for Okta authorization callback
   - This is used by the Okta SDK to redirect back to after performing the authorization code flow with PKCE used to get OAuth tokens if a session is set.
   - Similar to above we suggest a custom URL scheme for this URI, which we can identify (`your-app:/authorization/callback`).
   - e.g. `com.theguardian.app:/authorization/callback`
3. A redirect callback URI for Okta logout callback
   - This is used by the Okta SDK to redirect back to after calling the logout method in the SDK.
   - Similar to above we suggest a custom URL scheme for this URI, which we can identify (`your-app:/logout/callback`).
   - e.g. `com.theguardian.app:/logout/callback`

No 1. will have to be handled by the native app itself by registering the custom url scheme.

No 2. will be handled by the Okta SDK.

No 3. may have to be handled by the application rather than the Okta SDK to handle post logout clean up.

We will need a set for the PROD, CODE, and possibly DEV environments.

Once the app is set up within Okta and this project. The Identity team will give you the following information to configure the Okta SDK:

| Name                | Key                                            | Explanation                                                                                                                                                                                                       | Example                                                                           |
| ------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Client ID           | `client_id`/`clientId`                         | The client ID from the app integration that was created                                                                                                                                                           | `0ux3rutxocxFX9xyz3t9`                                                            |
| Issuer              | `discovery_uri`/`issuer`                       | Domain of the Okta app, followed by the OAuth authorization server. We use a custom authorization server rather than the default one as it lets us customise lifetimes of tokens                                  | `https://profile.theguardian.com/oauth2/aus2qtyn7pS1YsVLs0x7`                     |
| Logout Redirect URI | `end_session_redirect_uri`/`logoutRedirectUri` | The post-logout redirect URI from the app integration that was created                                                                                                                                            | `com.theguardian.app:/logout/callback`                                            |
| Redirect URI        | `redirect_uri`/`redirectUri`                   | The Redirect URI from the app integration that was created                                                                                                                                                        | `com.theguardian.app:/authorization/callback`                                     |
| Scopes              | `scopes`                                       | Default permissions for the OAuth tokens, you'll want `openid profile offline_access` at the minimum. Information about the scopes can be seen [here](https://developer.okta.com/docs/reference/api/oidc/#scopes) | `openid profile offline_access` or json `["openid", "profile", "offline_access"]` |

## Full sign in diagram

Much of the following is adopted from [signin.md](signin.md), with changes to fit the native apps implementation. Apps should only need to be aware of what's happening in the native layer, but the full flow is useful for understanding the interaction between the native layer and the identity system. User interaction is implied.

```mermaid
sequenceDiagram
  participant NativeLayer
  participant InAppBrowserTab
  participant Gateway
  participant Okta
  NativeLayer->>InAppBrowserTab: Open Browser Tab:<br/>`https://profile.theguardian.com/signin`
  alt no existing session
    InAppBrowserTab->>Gateway: Request gateway /signin
    note over Gateway: Sign in session is not checked<br/>(encryptedState.signInRedirect == false | undefined)
    note over Gateway: <br/>We check session using Okta OAuth Auth Code flow<br/>using `prompt=none` means no okta login is shown,<br/>and "error" returned instead
    Gateway->>InAppBrowserTab: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none...<br>see notes for other parameters/implementation
    InAppBrowserTab->>Okta: Request /authorize
    note over Okta: check for existing session<br>in this case none exists
    Okta->>InAppBrowserTab: Redirect request to gateway<br>/oauth/authorization-code/callback?error=login_required
    InAppBrowserTab->>Gateway: Request /oauth/authorization-code/callback?error=login_required
    note over Gateway: check for `error=login_required`<br/>set `encryptedState.signInRedirect = true` as cookie
    Gateway->>InAppBrowserTab: Redirect request to gateway `/signin`
    InAppBrowserTab->>Gateway: Request gateway /signin
    note over Gateway: Sign in session is checked<br/>(encryptedState.signInRedirect == true)<br>remove/set to false from the encryptedState
    Gateway->>InAppBrowserTab: Return rendered sign in page
    InAppBrowserTab->>Gateway: Login form POST /signin (email + password)
    Gateway->>Okta: Authenticate with Okta<br/>/authn with email + pw)
    note over Okta: validate email + password
    Okta->>Gateway: response with sessionToken<br/>+ email/okta_id
    note over Gateway: Perform auth code flow to create<br>Okta session
    Gateway->>InAppBrowserTab: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none&sessionToken={sessionToken}...<br>see notes for other parameters/implementation
    InAppBrowserTab->>Okta: Request /authorize
    note over Okta: Use sessionToken to create an okta session on<br/>auth subdomain as cookie
  else existing existing session
    InAppBrowserTab->>Gateway: Request gateway /signin
    note over Gateway: Sign in session is not checked<br/>(encryptedState.signInRedirect == false | undefined)
    note over Gateway: <br/>We check session using Okta OAuth Auth Code flow<br/>using `prompt=none` means no okta login is shown
    Gateway->>InAppBrowserTab: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none...<br>see notes for other parameters/implementation
    InAppBrowserTab->>Okta: Request /authorize
    note over Okta: check for existing session<br>in this case session exists<br>Okta will refresh the existing session
  end
  Okta->>InAppBrowserTab: Redirect request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...<br/>see notes for other parameters/implementation
  InAppBrowserTab->>Gateway: Request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...
  Gateway->>InAppBrowserTab: Redirect to return_url (app callback using custom url scheme)<br/> e.g. `com.theguardian.app:/authentication/callback`
  InAppBrowserTab->>NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>e.g. `com.theguardian.app:/authentication/callback`
  note over NativeLayer: Handle the callback<br/>request from the in-app browser<br/>tab to the native layer.<br/>At this point use the SDK for the rest of the flow,<br/>to check the okta session and get the<br/>relevant OAuth tokens.
  NativeLayer->>InAppBrowserTab: Call `signin`/`signInWithBrowser`<br/>with the `prompt=none` option method to perform<br />Authorization Code Flow with PKCE
  note over InAppBrowserTab: SDK will launch another in-app browser<br/>tab to handle the session check,<br/> and redirect back to the app with
  InAppBrowserTab->>Okta: call OAuth /authorize?prompt=none
  note over Okta: session check
  Okta->>InAppBrowserTab: Redirect request to app with the `auth_code` parameter<br/>e.g. `com.theguardian.app:/authorization/callback?auth_code={auth_code}`
  InAppBrowserTab->>NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>e.g.`com.theguardian.app:/authorization/callback?auth_code={auth_code}`
  NativeLayer->>Okta: SDK uses auth_code to call OAuth /token to get OAuth tokens
  Okta->>NativeLayer: Return tokens to SDK
  note over NativeLayer: the SDK manages the tokens, which can now be used to<br/>authenticate requests, and for checking the user's<br/>session
```

## Full registration diagram

Similar to sign in, much of the following is adopted from [registration.md](registration.md), with changes to fit the native apps implementation. Apps should only need to be aware of what's happening in the native layer, but the full flow is useful for understanding the interaction between the native layer and the identity system. User interaction is implied.

// TODO: Add full registration document/details

```mermaid
sequenceDiagram
  participant NativeLayer
  participant InAppBrowserTab
  participant Gateway
  participant Okta
  participant EmailInbox
  NativeLayer->>InAppBrowserTab: Open Browser Tab:<br/>`https://profile.theguardian.com/register`
  InAppBrowserTab->>Gateway: Request gateway /register
  Gateway->>InAppBrowserTab: Return rendered register page
  InAppBrowserTab->>Gateway: POST /register with email
  note over Gateway: Registration with Okta handled by Gateway
  Gateway->>Okta: Create user in Okta
  par
    Okta->>EmailInbox: Send activation email
    Okta->>Gateway: OK response
  end
  Gateway->>InAppBrowserTab: Show email sent page<br/>with link to email inbox
  note over InAppBrowserTab,EmailInbox: Assume user clicks activation link in email on same device
  EmailInbox->>InAppBrowserTab: Click link in email /welcome/{activationToken}
  InAppBrowserTab->>Gateway: GET /welcome/{activationToken}
  note over Gateway: Validate token in Okta
  Gateway->>InAppBrowserTab: Return rendered welcome/<br/>set password page
  InAppBrowserTab->>Gateway: POST /welcome/{activationToken} with password
  note over Gateway:set password and add session
  Gateway->>InAppBrowserTab: Redirect to return_url (app callback using custom url scheme)<br/> e.g. `com.theguardian.app:/authentication/callback`
  InAppBrowserTab->>NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>e.g. `com.theguardian.app:/authentication/callback`
  note over NativeLayer: Handle the callback<br/>request from the in-app browser<br/>tab to the native layer.<br/>At this point use the SDK for the rest of the flow,<br/>to check the okta session and get the<br/>relevant OAuth tokens.
  NativeLayer->>InAppBrowserTab: Call `signin`/`signInWithBrowser`<br/>with the `prompt=none` option method to perform<br />Authorization Code Flow with PKCE
  note over InAppBrowserTab: SDK will launch another in-app browser<br/>tab to handle the session check,<br/> and redirect back to the app with
  InAppBrowserTab->>Okta: call OAuth /authorize?prompt=none
  note over Okta: session check
  Okta->>InAppBrowserTab: Redirect request to app with the `auth_code` parameter<br/>e.g. `com.theguardian.app:/authorization/callback?auth_code={auth_code}`
  InAppBrowserTab->>NativeLayer: Handle redirect request<br/>in-app browser tab to app<br/>e.g.`com.theguardian.app:/authorization/callback?auth_code={auth_code}`
  NativeLayer->>Okta: SDK uses auth_code to call OAuth /token to get OAuth tokens
  Okta->>NativeLayer: Return tokens to SDK
  note over NativeLayer: the SDK manages the tokens, which can now be used to<br/>authenticate requests, and for checking the user's<br/>session
```
