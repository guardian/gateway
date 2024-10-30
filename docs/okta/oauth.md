# OAuth 2.0 and OpenID connect

Much of the following information is from the [Okta OAuth 2.0 and OpenID Connect Overview](https://developer.okta.com/docs/concepts/oauth-openid/), [oauth.com](https://oauth.com/), and [Auth0](https://auth0.com/docs/get-started/authentication-and-authorization-flow/which-oauth-2-0-flow-should-i-use#oauth-2-0-terminology).

## Authentication API vs OAuth 2.0 vs OpenID Connect

There are three major kinds of authentication that you can perform with Okta:

- The [Authentication API](https://developer.okta.com/docs/reference/api/authn/) controls user access to our Okta org. It provides operations to authenticate users, recover forgotten passwords etc.

- The OAuth 2.0 protocol controls authorization to access a protected resource, like a web app, native app, or backend service.

- The OpenID Connect protocol is built on the OAuth 2.0 protocol and helps authenticate users and convey information about them. It is also more opinionated than plain OAuth 2.0, for example in its scope definitions.

## OAuth 2.0

OAuth 2.0 is a standard that apps use to provide client applications with access. If you would like to grant access to your application data in a secure way, then you want to use the OAuth 2.0 protocol.

The OAuth 2.0 spec has four important roles:

- The "authorization server" — Server that authenticates the "resource owner" and issues Access Tokens after getting proper authorization. In our case we use Okta as the authorization server, specifically we create a custom auth server in our Okta org that act as the authorization server.

- The "resource owner" — Entity that can grant access to a protected resource. Typically, this is the end-user.

- The "client" — The application that requests the access token from Okta and then passes it to the resource server.

- The "resource server" — The server hosting the protected resources, accepts the access token and must verify that it's valid, and also . This is the API you want to access.

Other important terms:

- An OAuth 2.0 "grant" is the authorization given (or "granted") to the client by the user. Examples of grants are "authorization code" and "client credentials". Each OAuth grant has a corresponding flow, explained below.
- The "access token" is issued by the authorization server in exchange for the grant.
- The "refresh token" is an optional token that is exchanged for a new access token if the access token has expired.

The usual OAuth 2.0 grant flow looks like this:

- Client requests authorization from the resource owner (usually the user).
- If the user gives authorization, the client passes the authorization grant to the authorization server (in this case Okta).
- If the grant is valid, the authorization server returns an access token, possibly alongside a refresh and/or ID token.
- The client now uses that access token to access the resource server.

## OpenID Connect

OpenID Connect is an authentication standard built on top of OAuth 2.0. It adds an additional token called an ID token. OpenID Connect also standardizes areas that OAuth 2.0 leaves up to choice, such as scopes, endpoint discovery, and dynamic registration of clients.

Although OpenID Connect is built on top of OAuth 2.0, the OpenID Connect specification uses slightly different terms for the roles in the flows:

- The "OpenID provider" — The authorization server that issues the ID token. In this case Okta is the OpenID provider.

- The "end user" — Whose information is contained in the ID token

- The "relying party" — The client application that requests the ID token from Okta

- The "ID token" is issued by the OpenID Provider and contains information about the end user in the form of claims.

- A "claim" is a piece of information about the end user.

The high-level flow looks the same for both OpenID Connect and regular OAuth 2.0 flows. The primary difference is that an OpenID Connect flow results in an ID token, in addition to any access or refresh tokens.

## OAuth 2.0 Flows/Grant Types

OAuth 2.0 defines a number of flows to get an access token. These flows are called grant types. The links provide more information from Okta, and how they can be implemented.

- Authorization Code Flow

  - If you are building a server-side (or web) application that is capable of securely storing secrets, then the Authorization Code flow is the recommended method for controlling access to it.
  - https://developer.okta.com/docs/concepts/oauth-openid/#authorization-code-flow

- Authorization Code Flow with PKCE (Proof Key for Code Exchange)

  - If you are building a native application, single page application, or a client-side heavy application, then the Authorization Code flow with a Proof Key for Code Exchange (PKCE) is the recommended method for controlling the access between your application and a resource server.
  - The Authorization Code flow with PKCE is similar to the standard Authorization Code flow with an extra step at the beginning and an extra verification at the end.
  - https://developer.okta.com/docs/concepts/oauth-openid/#authorization-code-flow-with-pkce

- Client Credentials Flow

  - The Client Credentials flow is recommended for server-side (AKA confidential) client applications with no end user, which normally describes machine-to-machine communication.
  - The application needs to securely store its Client ID and secret and pass those to Okta in exchange for an access token.
  - https://developer.okta.com/docs/concepts/oauth-openid/#client-credentials-flow

- Implicit Flow

  - The Implicit flow is **not a recommended approach**, as it is extremely challenging to implement the Implicit flow securely.
  - The recommendation is to use Authorization Code Flow with PKCE if possible.
  - If you are building a Single-Page Application (SPA) on browsers that don't support Web Crypto for PKCE, then the Implicit flow can be used for controlling access between your SPA and a resource server.
  - The Implicit flow is intended for applications where the confidentiality of the client secret can't be guaranteed.
  - https://developer.okta.com/docs/concepts/oauth-openid/#implicit-flow

- Resource Owner Password Flow

  - The Resource Owner Password flow is **not a recommended approach**.
  - It is intended for applications for which no other flow works, as it requires your application code to be fully trusted and protected from credential-stealing attacks.
  - It is made available primarily to provide a consistent and predictable integration pattern for legacy applications that can't otherwise be updated to a more secure flow such as the Authorization Code flow.
  - This should be your last option, not your first choice.
  - https://developer.okta.com/docs/concepts/oauth-openid/#resource-owner-password-flow

Deciding which one is suited for your case depends mostly on your application type. In most cases the first three are the most suitable.

Okta have also created a **proprietary** extension to the OAuth 2.0 and Open ID Connect standard called the "[Interaction Code](https://developer.okta.com/docs/concepts/interaction-code/) grant type", which in their words "enables you to create a more customized user authentication experience", and behaves in a similar way to the Authorization Code flow with PKCE grant type. This is not a standard OAuth 2.0 flow, but is specific to Okta. See the [Okta Interaction Code documentation](./idx/README.md#interaction-code-flow) for more information.

## Gateway Usage

Within Gateway we use OAuth 2.0 and OpenID Connect to interact with Okta on a number of user flows.

We have implemented the Authorization Code Flow (and the related Interaction Code Flow) within this application. This is used in a number of places, including: [sign in](./idx/sign-in-idx.md), [sign out](./signout.md), change password, etc.

We use the Authorization Code Flow to both authorise a user and get an access token, as well as check if the user has an Okta session.

The [openid-client library](https://github.com/panva/node-openid-client) is used to help facilitate the OAuth 2.0 and OpenId Connect flows. This is an OpenId certified library, and sponsored by Auth0.

Much of the setup for the library is done within [`src/server/lib/okta/openid-connect.ts`](../../src/server/lib/okta/openid-connect.ts). This file exports a `ProfileOpenIdClient` which is an instance of this library with the correct metadata, client id, client secret, and redirect uri set up. It also only exports a subset of the methods that we need to use within our application.

We also use this file to set up helper methods to generate the `AuthorizationState`, which is used as the [`state`](https://developer.okta.com/docs/reference/api/oidc/#:~:text=Policy%3A%20no%2Dreferrer.-,state,-%3A) parameter in the authorization request.

In [`src/server/lib/okta/oauth.ts`](../../src/server/lib/okta/oauth.ts) we expose the `performAuthorizationCodeFlow` method, which is used to generate the `/authorize` url for the Auth Code flow and redirect the browser to this url to start it.

The redirect endpoint (`/oauth/authorization-code/callback`) is defined in [`src/server/routes/oauth.ts`](../../src/server/routes/oauth.ts). This is where the browser is redirected to from the authorization server during the flow. This checks the response we get back from the authorization server. If it completed successfully we get back an "auth code" which we can exchange for an access token, refresh token, and/or ID token. If it fails, we get back an error parameter which we deal with.

This method is also used to retrieve Identity cookies from Identity API as part of the dual running of systems. To do this we get an access token from the authorization server, send this to the Identity API (the "resource server" in this case), which validates the token, and returns signed Identity cookies if so.

Once all the checks are complete it will redirect the browser to an appropriate location.

## OAuth/OIDC Tokens, Claims, and Scopes

https://developer.okta.com/docs/reference/api/oidc/

There are 3 types of tokens that are used by OAuth 2.0 and OpenID Connect through Okta:

- [Access Token](#access-token)
- [ID Token](#id-token)
- [Refresh Token](#refresh-token)

The access token and id token are both [JWT](https://jwt.io) tokens, and the refresh token is an opaque string which is an optional token. As a JWT, the access and id tokens contain a header, a body, and a signature. The header contains the algorithm used to sign the token, and the body contains the claims as a key-value pair. The signature is used to verify that the token is valid.

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
