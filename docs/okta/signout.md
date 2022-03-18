# Sign Out with Okta

Status: RFC

This document describes how we've implemented the sign out flow with Okta in Gateway.

In old (current) Identity land, when a user clicks the "sign out" button on the website, or visit the sign out link directly, if they have a valid session, determined using the `SC_GU_U` cookie, Identity API will invalidate all existing user sessions on all devices and browsers, and clear all Identity and related dotcom cookies on the current browser.

Since we're dual running Identity and Okta sessions, this functionality should also be replicated with the Okta sign out for now.

Okta provides an administrative API endpoint within the Users API to clear all user sessions, and we can use this to invalidate all sessions for a user, as well as revoke all access and refresh tokens that are currently valid.

https://developer.okta.com/docs/reference/api/users/#clear-user-sessions

This endpoint requires the okta `userId`, which we get from the okta sessions api using the current okta session id cookie `sid`

We then use this user id to clear all Okta sessions for that user.

In the sceario where the okta call to remove the fails (and we have a orphaned session), we delete the sid cookie anyway and we plan to allow the users to see their active sessions in manage my account section of the site where they can remove them manually.

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
  Gateway->>Okta: Get user id from Okta session cookie <br/> using GET /api/v1/sessions/:sessionId
  Okta->>Gateway: returns session Object with userId as one of the values
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
  note over Gateway: Check the presence of the SC_GU_U cookie and sid cookie, <br/>if neither are present they are not logged in
  Gateway->>Browser: Redirect request to gateway `/signin`
  Browser->>Gateway: Request gateway /signin
  note over Gateway: Sign in session is checked<br/>(encryptedState.signInRedirect == true)<br>remove/set to false from the encryptedState
  Gateway->>Browser: Return rendered sign in page
```
