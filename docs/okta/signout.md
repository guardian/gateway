# Sign Out with Okta

Status: RFC

This document describes how we've implemented the sign out flow with Okta in Gateway.

In old (current) Identity land, when a user clicks the "sign out" button on the website, or visit the sign out link directly, if they have a valid session, determined using the `SC_GU_U` cookie, Identity API will invalidate all existing user sessions on all devices and browsers, and clear all Identity and related dotcom cookies on the current browser.

Since we're dual running Identity and Okta sessions, this functionality should also be replicated with the Okta sign out for now.

Okta provides an administrative API endpoint within the Users API to clear all user sessions, and we can use this to invalidate all sessions for a user, as well as revoke all access and refresh tokens that are currently valid.

https://developer.okta.com/docs/reference/api/users/#clear-user-sessions

This endpoint requires the okta `userId`, which we won't have access to initially, so we need to get an access/id token with this information.

This means when a user lands on the `/signout` url, we first perform an auth code flow to get an access token, and then we can use that access token to get the user's id. We then use this user id to clear all sessions for that user.

If there is no existing session then we'll render the sign in page.

During the dual running of the system we also need to clear the Identity session too. We can use this access token or the SC_GU_U cookie to call Identity API (TBD which option) to do this.

### User has existing session

```mermaid
sequenceDiagram
  participant Browser
  participant Gateway
  participant Okta
  participant Identity API
  Browser->>Gateway: GET /signout?returnUrl=...
  note over Gateway: <br/>We check session using Okta OAuth Auth Code flow<br/>using `prompt=none` means no okta login prompt shown<br/>and we get an access token with the okta userid
  Gateway->>Browser: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none...<br>see notes for other parameters/implementation
  Browser->>Okta: Request /authorize
  note over Okta: check for existing session<br>in this case session exists
  Okta->>Browser: Redirect request to gateway<br>/oauth/authorization-code/signout?code={auth_code}...<br/>see notes for other parameters/implementation
  Browser->>Gateway: Request to gateway<br>/oauth/authorization-code/signout?code={auth_code}...
  Gateway->>Okta: exchange auth_code<br/>for access_token
  Okta->>Gateway: Return access_token<br/>with userId
  Gateway->>Okta: Clear user sessions<br/>using userId<br/>DELETE /api/v1/users/${userId}/sessions?oauthTokens=true
  Okta->>Gateway: Return 204 No Content
  opt Clear Identity Session (dual running)
    Gateway->>Identity API: POST /unauth with SC_GU_U cookie
    Identity API->>Gateway: Return GU_SO cookie
  end
  Gateway->>Browser: Redirect to returnUrl<br/>clear identity cookies
```

### User has no existing session

```mermaid
sequenceDiagram
  participant Browser
  participant Gateway
  participant Okta
  Browser->>Gateway: GET /signout?returnUrl=...
  note over Gateway: <br/>We check session using Okta OAuth Auth Code flow<br/>using `prompt=none` means no okta login prompt shown
  Gateway->>Browser: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none...<br>see notes for other parameters/implementation
  Browser->>Okta: Request /authorize
  note over Okta: check for existing session<br>in this case session does not exists<br>Okta will respond with `error=login_required`
  Okta->>Browser: Redirect request to gateway<br>/oauth/authorization-code/signout?error=login_required
  Browser->>Gateway: Request /oauth/authorization-code/signout?error=login_required
  note over Gateway: check for `error=login_required`<br/>set `encryptedState.signInRedirect = true` as cookie
  Gateway->>Browser: Redirect request to gateway `/signin`
  Browser->>Gateway: Request gateway /signin
  note over Gateway: Sign in session is checked<br/>(encryptedState.signInRedirect == true)<br>remove/set to false from the encryptedState
  Gateway->>Browser: Return rendered sign in page
```
