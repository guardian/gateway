# Sign In with Okta

This document describes how we've implemented the sign in flow with Okta in Gateway. There are two parts to this, sign in with email + password, and sign in with social.

## Email + Password

The bulk of the work to implement sign in with email and password with Okta was done in this PR: https://github.com/guardian/gateway/pull/1410, which has some additional information, and specific commits you can follow along.

We use the [Okta Authentication API](https://developer.okta.com/docs/api/resources/authn) to implement this, specifically the [Primary authentication with public application](https://developer.okta.com/docs/reference/api/authn/#primary-authentication-with-public-application) operation.

To create a session we [retrieve a session cookie through the OpenID Connect authorization endpoint](https://developer.okta.com/docs/guides/session-cookie/main/#retrieve-a-session-cookie-through-the-openid-connect-authorization-endpoint), which implements the [Authorization Code flow](https://developer.okta.com/docs/concepts/oauth-openid/#authorization-code-flow).

More information about OAuth, OpenId Connect, and our usage of it, is available in the [./oauth.md](./oauth.md) document.

As we don't want users with existing sessions to be shown the sign in page, we all implement an existing session check, which also utilises the same flow, if a session exists we complete the flow and refresh the existing session, if a session does not exist Okta responds with an `error=login_required` parameter which we can intercept and use.

Throughout the implementation of the sign in code, there are many in line comments that explain what is happening.

In general the steps of sign in with email and password are summarised as follows, assuming okta is enabled, this does not detail all technical requirements, just the main high level:

- User navigates to `/signin`
  - Check `sid` cookie for existing Okta session, if this is present it checks if the session is still valid.
  - If the current session does not exist, or is invalid, sign in page shown
    - user enters email and password, makes request to gateway `POST /signin`
    - Use okta authenticate endpoint with the email and password `/api/v1/authn`
      - If email/password wrong, show `email or password was incorrect` error
      - If correct, okta returns a single use `sessionToken` which can be exchanged for an session cookie
        - to exchange this for a session cookie, we perform the auth code flow, pass the `sessionToken` to `/authorize` and redirect to okta `/authorize`
          - Okta will redirect to callback endpoint `/oauth/authorization-code/callback`
          - if all good, a session cookie will be set on okta domain, complete the auth code flow and refreshing identity cookies
          - redirect to original `returnUrl`

Here are some sequence diagrams which show this flow in an alternate way:

### No Okta session exists

```mermaid
sequenceDiagram
  participant Browser
  participant Gateway
  participant Okta
  participant Identity API
  Browser->>Gateway: Request gateway /signin
  note over Gateway: Sign in session is checked by inspecting the `sid` cookie
  Gateway->>Okta: GET /api/v1/sessions/:sessionId
  Okta->>Gateway: return invalid session response
  Gateway->>Browser: render sign in page
  Browser->>Gateway: Login form POST /signin (email + password)
  Gateway->>Okta: Authenticate with Okta<br/>/authn with email + pw)
  note over Okta: validate email + password
  Okta->>Gateway: response with sessionToken<br/>+ email/okta_id
  note over Gateway: Perform auth code flow to create<br>Okta session
  Gateway->>Browser: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none&sessionToken={sessionToken}...<br>see notes for other parameters/implementation
  Browser->>Okta: Request /authorize
  note over Okta: Use sessionToken to create an okta session on<br/>auth subdomain as cookie
  Okta->>Browser: Redirect request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...<br/>see notes for other parameters/implementation
  Browser->>Gateway: Request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...
  opt Get IDAPI Cookies
    Gateway->>Okta: exchange auth_code<br/>for access_token
    Okta->>Gateway: Return access_token
    Gateway->>Identity API: Request identity cookies for user using access_token
    note over Identity API: check the access token is valid<br>create identity session/cookies if valid
    Identity API->>Gateway: return signed identity cookie values
  end
  Gateway->>Browser: Redirect to return_url (usually on *.theguardian.com)<br>set identity cookies if applicable
```

### Okta session exists

```mermaid
sequenceDiagram
  participant Browser
  participant Gateway
  participant Okta
  participant Identity API
  Browser->>Gateway: Request gateway /signin
  note over Gateway: Sign in session is checked by inspecting the `sid` cookie and validating the session against the Okta session API
  note over Okta: check for existing session<br>in this case a session exists
  Gateway->>Okta: GET /api/v1/sessions/:sessionId
  Okta->>Gateway: return valid session response
  Gateway->>Browser: Redirect to return_url (usually on *.theguardian.com)
```

## Social

Social sign in uses the authorization code flow to perform authentication with the social provider. This is done by directly redirecting the user to the Okta custom authorization server `/authorize` endpoint (similar to what we do post sign in to set a session with Okta) with the `idp` parameter, which is the ID of the Social Identity Provider defined within our Okta tenant. The user then authenticates (if required) and authorizes the application on the social provider, and the social provider does a callback to Okta authorizing the user. Okta will then check the state of the user, e.g. if they're a new or existing user, and take the appropriate action. Okta will then authenticate the user and set a session cookie in that users browser.

Once the user is authenticated with the session cookies, Okta will complete the authorization code flow that was started in Gateway, and does a callback to the `/oauth/authorization-code/callback` endpoint (the same as how it works for email + password). We then exchange the auth code for the access tokens, get the old identity cookies if required, and redirect the user back to the return url.

### Existing users

For existing users in Okta, we automatically link their account. We also restrict automatic account linking to users within the `GuardianUser-EmailValidated` group to mitigate account squatting, as we know that users in the email validated group have validated they own the account through access in their email inbox.

By restricting account linking, the user is blocked from authentication, and we receive a generic ‘User linking was denied because the user is not in any of the specified groups’ error without any user details. In this case we use this error to display a custom error message on the sign-in page but we won’t be able to auto-fill the email address because we won’t know what it is. This is roughly equivalent to what we already have with a slightly degraded user experience as the email is not pre-populated. It does not perform any manual account linking.

```mermaid
sequenceDiagram

participant Browser
participant Gateway
participant Okta
participant Social
participant Identity API

Browser ->> Gateway: Request /signin (or /register),<br>will just be referred to as /signin or sign in for<br>simplicity, as the same thing happens<br>in either case
note over Gateway: Sign in session is checked by inspecting the `sid` cookie
Gateway ->> Okta: GET /api/v1/sessions/:sessionId
Okta ->> Gateway: Return invalid session response
Gateway ->> Browser: Render sign in page
note over Browser: User clicks a<br>social sign in button
Browser ->> Gateway: GET /signin/:social
note over Gateway: Turn `social` param into `idp` id
Gateway ->> Browser: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none&idp={idp}...<br>see notes for other parameters/implementation
Browser ->> Okta: Request /authorize
Okta ->> Browser: Redirect request to social provider Oauth endpoint
Browser ->> Social: Request OAuth endpoint
note over Browser,Social: Social IDP authenticates/authorizes user
Social ->> Browser: Redirect request to Okta callback endpoint<br>/oauth2/v1/authorize/callback?code={social_auth_code}&state={okta_state}
Browser ->> Okta: Request/oauth2/v1/authorize/callback?code={social_auth_code}&state={okta_state}
note over Okta: Okta exchanges auth_code for access_token<br>with social provider and uses the Social provider to determine<br> if the user is an existing user or a new user.<br>In this case they're an existing user.<br>If the user is in the `GuardianUser-EmailValidated`<br>then Okta will link their<br>social account to their existing account.<br>Okta will then create a session for the user and set<br>a session cookie in their browser.<br>If the user is NOT in the `GuardianUser-EmailValidated`<br>then Okta will callback with an error<br>and the user will be redirected to the sign in page<br>with a account linking required error message.
alt [User in the `GuardianUser-EmailValidated` group]
  Okta ->> Browser: Redirect request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...<br/>see notes for other parameters/implementation
  Browser ->> Gateway: Request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...
  opt Get IDAPI Cookies
    Gateway ->> Okta: exchange auth_code<br/>for access_token
    Okta ->> Gateway: Return access_token
    Gateway ->> Identity API: Request identity cookies for user using access_token
    note over Identity API: check the access token is valid<br>create identity session/cookies if valid
    Identity API ->> Gateway: return signed identity cookie values
  end
  Gateway ->> Browser: Redirect to return_url (usually on *.theguardian.com)<br>set identity cookies if applicable
else [User is not in the `GuardianUser-EmailValidated` group]
  Okta ->> Browser: Redirect request to gateway<br>/oauth/authorization-code/callback?error=access_denied&<br>error_description=User+linking+was+denied+because<br>+the+user+is+not+in+any+of+the+specified+groups
  Browser ->> Gateway: Request /oauth/authorization-code/callback?error=access_denied&<br>error_description=...
  Gateway ->> Browser: Redirect to /signin?error=accountLinkingRequired
  Browser ->> Gateway: Request /signin?error=accountLinkingRequired
  Gateway ->> Browser: Render sign in page with account linking required error message
end
```

### New users

If a user doesn't exist and tries to sign-in with social, we create them automatically using JIT (just in time) provisioning which creates a new user record. When a user is created by JIT, we can automatically assign them to a group, in our case we assign them to the `GuardianUser-All` and `GuardianUser-EmailValidated` groups, which match similarly to what we have in old Identity land.

A new user that registers with a social account becomes `ACTIVE` in Okta, with the `SOCIAL` provider and no password set. This creates some issues regarding reset password.

When a `SOCIAL` user tries to reset their password using a reset/forgot password form, the request will fail with an error mentioning they do not have permissions to take that action. To be able to send a password reset email to the user we have to get them from the `SOCIAL` provider to the `OKTA` provider with the `ACTIVE` state and a placeholder/temporary password set.

```mermaid
sequenceDiagram

participant Browser
participant Gateway
participant Okta
participant Social
participant Identity API

Browser ->> Gateway: Request /signin (or /register),<br>will just be referred to as /signin or sign in for<br>simplicity, as the same thing happens<br>in either case
note over Gateway: Sign in session is checked by inspecting the `sid` cookie
Gateway ->> Okta: GET /api/v1/sessions/:sessionId
Okta ->> Gateway: Return invalid session response
Gateway ->> Browser: Render sign in page
note over Browser: User clicks a<br>social sign in button
Browser ->> Gateway: GET /signin/:social
note over Gateway: Turn `social` param into `idp` id
Gateway ->> Browser: Redirect request to OAuth auth code flow<br/>/authorize?prompt=none&idp={idp}...<br>see notes for other parameters/implementation
Browser ->> Okta: Request /authorize
Okta ->> Browser: Redirect request to social provider Oauth endpoint
Browser ->> Social: Request OAuth endpoint
note over Browser,Social: Social IDP authenticates/authorizes user
Social ->> Browser: Redirect request to Okta callback endpoint<br>/oauth2/v1/authorize/callback?code={social_auth_code}&state={okta_state}
Browser ->> Okta: Request/oauth2/v1/authorize/callback?code={social_auth_code}&state={okta_state}
note over Okta: Okta exchanges auth_code for access_token<br>with social provider and uses the Social provider to determine<br> if the user is an existing user or a new user.<br>In this case they're a new user. So Okta will create a new account.<br>In the `GuardianUser-All` and `GuardianUser-EmailValidated` groups. <br>Okta will then create a session for the user and set<br>a session cookie in their browser.
Okta->>Browser: Redirect request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...<br/>see notes for other parameters/implementation
Browser->>Gateway: Request to gateway<br>/oauth/authorization-code/callback?code={auth_code}...
opt Get IDAPI Cookies
  Gateway->>Okta: exchange auth_code<br/>for access_token
  Okta->>Gateway: Return access_token
  Gateway->>Identity API: Request identity cookies for user using access_token
  note over Identity API: check the access token is valid<br>create identity session/cookies if valid
  Identity API->>Gateway: return signed identity cookie values
end
Gateway->>Browser: Redirect to return_url (usually on *.theguardian.com)<br>set identity cookies if applicable
```

### Reset password for new users

This takes a few steps to do to get a user into the correct state with a placeholder password set.

Firstly we listen out for the error when a user attempts to reset their password.

When we see this error we run a few checks to make sure the user is in the particular state without a password set. We first get the `user` object by using their email. This may have a `credentials` property. When a user does not have a password set the `user.credentials.password` object will not exist, so we can use this to perform logic.

When a password isn't set, we HAVE to use the users api reset password endpoint ([method](https://github.com/guardian/gateway/blob/585b4d0f7b65e2acec156a2acd48b4a1cad14d55/src/server/lib/okta/api/users.ts#L177)/[api doc](https://developer.okta.com/docs/reference/api/users/#reset-password)), this forces the user from the `SOCIAL` provider to the `OKTA` provider, and into the `RECOVERY` state. No other endpoint does this, so we have to use this endpoint.

This returns a one time recovery token, which we don't send to the user. We use this token to get the authentication `stateToken`.
We then use this `stateToken` to set a randomly generated unreadable password, and this forces the user into the `ACTIVE` state with a password set.
Now the user is in this state we can send a user an email to be able to reset their password.

```mermaid
sequenceDiagram

participant Browser
participant Gateway
participant Okta

Browser ->> Gateway: GET /reset-password
Gateway ->> Browser: Render reset password page
note over Browser: User adds email to form
Browser ->> Gateway: POST /reset-password
Gateway ->> Okta: POST /api/v1/authn/recovery/password
note over Okta: Okta attempts to send reset password link to user's email<br>but fails as user does not have credentials.
Okta ->> Gateway: Return {status: 403, code: "E0000006"}
note over Gateway: Gateway has to make sure user does not have credentials<br>to make sure this isn't another unrelated error
Gateway ->> Okta: GET /api/v1/users/:email
Okta ->> Gateway: Return `user` object
note over Gateway: Check if user has credentials<br>`!user.credentials.password`<br> in this case user does not have<br>a password set so we can<br>set a placeholder password and<br>force them into the `ACTIVE` state
Gateway ->> Okta: POST /api/v1/users/:id/lifecycle/reset_password?sendEmail=false
note over Okta: Okta generates resetPasswordUrl,<br>puts user in RECOVERY state
Okta ->> Gateway: Return { resetPasswordUrl: 'https://.../signin/reset-password/:token' }
note over Gateway: Extract the `token` (recoveryToken) from the resetPasswordUrl,<br>and validate recoveryToken to get `stateToken`
Gateway ->> Okta: POST /api/v1/authn/recovery/token
Okta ->> Gateway: Return { stateToken: '...', ... }
note over Gateway: Use stateToken to set a placeholder password<br>the password is a cryptographically secure random UUID string<br>which we do not read
Gateway ->> Okta: POST /api/v1/authn/credentials/reset_password with recoveryToken and password
note over Okta: Okta sets placeholder password and<br>forces user into the `ACTIVE` state
Okta ->> Gateway: Return { status: 200, ... }
note over Gateway: User is now in the `ACTIVE` state,<br>so we can send them an email to reset their password
Gateway ->> Okta: POST /api/v1/authn/recovery/password
note over Okta: Okta attempts to send reset password link to user's email<br>and succeeds as user now has credentials.
```
