# Tokens

Okta's tokens fall into two groups: the standard OAuth and OIDC (Open ID Connect) tokens and the custom tokens that form
part of its Authentication API

## Okta Authentication API Tokens

### Recovery / Activation Tokens

Single use tokens for performing an account recovery action. They should be distributed out-of-band to a user such as
via email. We currently use these tokens when a user requests to reset their password, or when a new user registers and
is sent an activation email. The tokens are exchanged for state tokens to complete the recovery operation.

### State token

An ephemeral token encoding the current state of the recovery operation. To use a concrete example, when a user resets
their password they are sent a recovery token by email. When they click on the link their recovery token is exchanged
for a state token. The state token is then sent on the request to reset the user's password.

### Session token

A single-use token which can be exchanged for a login session via the [OIDC & OAuth API](https://developer.okta.com/docs/reference/api/oidc/)
or the [Sessions API](https://developer.okta.com/docs/reference/api/sessions/)

Documentation on Okta tokens can be found here: https://developer.okta.com/docs/reference/api/authn/#tokens

## OAuth/OIDC Tokens, Claims, and Scopes

https://developer.okta.com/docs/reference/api/oidc/

There are 3 types of tokens that are used by OAuth and returned by the Okta SDK. These are:

- Access Token
- ID Token
- Refresh Token

The access token and id token are both JWT tokens, and the refresh token is an opaque string which is an optional token. As a JWT, the access and id tokens contain a header, a body, and a signature. The header contains the algorithm used to sign the token, and the body contains the claims as a key-value pair. The signature is used to verify that the token is valid.

### Claims

https://developer.okta.com/docs/reference/api/oidc/#claims

Tokens issued by Okta contain claims that are statements about a subject (user). For example, the claim can be about a name, identity, key, group, or privilege. The claims in a given token are dependent upon the type of token, the type of credential used to authenticate the user, and the application configuration.

The claims is generally provided in the body of the access and id tokens, which are key-value pairs.

The default claims can be seen in the Okta documentation, but it is also possible to add custom claims to the tokens. For example a custom claim could be added to the id token to indicate if the user has a validated email. Custom claims are dependant on the scopes that are requested by the application, and can be customised by the [Identity team in the Okta configuration](https://github.com/guardian/identity-platform/blob/main/okta/terraform/modules/okta/auth_server_claims.tf).

### Scopes

https://developer.okta.com/docs/reference/api/oidc/#scopes

Scopes are used to define what claims are returned in the token. The scopes that are returned in the token are defined by the `scopes` parameter in the request. The `scopes` parameter is a space-delimited list of scopes. The `openid` scope is required to get an id token. The `offline_access` scope is also required to get a refresh token.
Scopes are also used by access tokens to define what actions the user can perform using that particular scope. The list of scopes that are available for a particular user can be found in the `scp` claim of the access token. This way an API can check the `scp` claim to see if the user has the correct permissions to perform the action.

We are able to limit which scopes a given application has access to through the Okta configuration.

The default scopes that are available are:

- `openid` - Identifies the request as an OpenID Connect request. This is the only required scope.
- `profile` - Requests access to the end user's default profile claims.
- `email` - Requests access to the `email` claim.
- `offline_access` - Requests a refresh token used to obtain more access tokens without re-prompting the user for authentication.

Some scopes that are not currently used by us are:

- `address` - Requests access to the `address` claim.
- `phone` - Requests access to the `phone_number` claim (not currently used by us).
- `groups` - Requests access to the `groups` claim.
- `device_sso` - Requests a device secret used to obtain a new set of tokens without re-prompting the user for authentication.

We also define custom scopes which are used to define what actions the application can perform on behalf of the user. These scopes are defined in the [Okta configuration by the identity team](https://github.com/guardian/identity-platform/blob/main/okta/terraform/modules/okta/guardian_auth_server_scopes.tf). We define them in two types: `API Scopes` and `Client Scopes`.

#### API Scopes

API scopes are used to control operations and access to user data during communication between a user client and an API which holds the data. The API subdomain refers to the API providing or processing the data.

The general naming convention for API scopes is:

`guardian.<apiSubdomain>[.<resourceSubtype>...].<read|create|update|delete>.<self|all>[.secure]`

e.g.

`guardian.members-data-api.complete.read.self.secure`

Where:

- `guardian` - The prefix for all API scopes.
- `apiSubdomain` - The subdomain of API eg `discussion-api` except where there the subdomain isn't particularly clear, eg. `identity-api` instead of `idapi` or where the protected endpoints are logically separate from the rest of the API, eg. `save-for-later`
- `resourceSubtype` - Part of the API that needs more specific access, optional.
- `read|create|update|delete` - The operation that is being performed on the resource.
- `self|all` - Whether the resource is for data belonging to the user or for general access
- `secure` - The API endpoint requires the access token to be additionally verified on the Okta authorization server, usually for more sensitive operations, e.g. updating a users profile, posting a new comment, optional.

#### Client Scopes

Client scopes are used to control read access to data consumed by a given client/app, irrespective of the data's origin. The data is returned in the ID Token. For example to return additional claims about the user in the ID Token, e.g. the user's name.

The general naming convention for client scopes is:

`id_token.<dataDomain>.<clientName>`

e.g.

`id_token.profile.ios_live_app`

Where:

- `id_token` - The prefix for all client scopes, indicating this should only be consumed in an ID token.
- `dataDomain` - The category/domain of data being returned in the ID token, e.g. 'profile'.
- `clientName` - The name/identifier of the client/app using this scope, e.g. 'ios_live_app'.

### Access Token

https://developer.okta.com/docs/reference/api/oidc/#access-token

The access token is used to authenticate requests to an API, e.g. discussion API, members data api. It is a JWT token that is signed by Okta. The token is valid for 1 hour by default, but can be configured to be longer or shorter, from 5 mins to 24 hours.

The body of the access token contains claims about the token, as well as some additional ones about the user which the API uses. The default claims can be seen in the documentation, the main one being `scp` which is the list of scopes that the token has access to on behalf of the user. We also provide some custom claims which are helpful in most API calls, namely `legacy_identity_id`, `email`, and `email_validated` claims.

### ID Token

https://developer.okta.com/docs/reference/api/oidc/#id-token

The OpenId Connect standard introduces an additional token to OAuth 2.0, the ID token. The ID token is a JWT token that is signed by Okta. The token is valid for 1 hour by default, and cannot be changed. The ID tokens contains information about an authentication event and claims about the authenticated user.

The ID token is what applications should use to read information about a given user. We're able to customise the claims that the ID token returns through the Okta configuration and which scopes were used to generate the token. This is dependant per application, but may include things like the user's name, legacy identity id, email, email validation status, and groups. Pretty much anything that is available in the user's profile could be added to the ID token.

### Refresh Token

https://developer.okta.com/docs/guides/refresh-tokens/main/

Refresh tokens are an opaque string that can be used to obtain new access tokens. This is an optional token which is available through the `offline_access` scope.

Typically, a user needs a new access token when they attempt to access a resource for the first time or after the previous access token that was granted to them expires. A refresh token is a special token that is used to obtain additional access tokens. This allows you to have short-lived access tokens without having to collect credentials every time one expires, or having to redirect a user through an OAuth flow again. You request a refresh token alongside the access and/or ID tokens as part of a user's initial authentication and authorization flow. Applications must then securely store refresh tokens since they allow users to remain authenticated.

However, public clients such as browser-based applications have a much higher risk of a refresh token being compromised when a persistent refresh token is used. With clients such as single-page applications (SPAs), long-lived refresh tokens aren't suitable, because there isn't a way to safely store a persistent refresh token in a browser and assure access by only the intended app. These threats are reduced by rotating refresh tokens. Refresh token rotation helps a public client to securely rotate refresh tokens after each use. With refresh token rotation behaviors, a new refresh token is returned each time the client makes a request to exchange a refresh token for a new access token. Refresh token rotation works with SPAs, native apps, and web apps in Okta.

Refresh tokens are valid for 90 days by default, but can be configured to be longer or shorter, from 5 mins to unlimited, we also recommend that you rotate the refresh token after each use.

Refresh tokens provide an additional "session" layer on top of the in browser `idx` cookie (which is set after login in browser). Meaning these two sessions are independent of each other, and can be used to manage the user's session in different ways. You can see the [Sessions](sessions.md) documentation for more information on how we use these sessions.

### Token management

Managing tokens is a complex topic, and there are many different ways to do it depending on the application. We have a few different approaches depending on the type of application.

#### Web applications

In general for web applications we only recommend using access and ID tokens. We don't recommend refresh tokens due to the complexity that arises in being able to manage the refresh token session, as well as difficulty in storing the refresh token securely.

Depending on the type of web application the storage of tokens will happen in different places. For application which are mostly client side based (e.g. using JS to do user actions) we recommend storing the tokens in local storage. For applications which are mostly server side based (e.g. using a server to do user actions) we recommend storing the tokens in a cookie.

#### Native applications

In general for native applications we recommend using all access, ID, and refresh tokens. We recommend using an SDK to manage the tokens, as well as refreshing any tokens that we need to, as the SDK will store the tokens securely in the recommended way for the platform.
