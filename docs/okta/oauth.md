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

## Gateway Usage

Within Gateway we use OAuth 2.0 and OpenID Connect to interact with Okta on a number of user flows.

We have implemented the Authorization Code Flow within this application. This is used in a number of places, including: [sign in](./signin.md), [sign out](./signout.md), change password, etc.

We use the Authorization Code Flow to both authorise a user and get an access token, as well as check if the user has an Okta session.

The [openid-client library](https://github.com/panva/node-openid-client) is used to help facilitate the OAuth 2.0 and OpenId Connect flows. This is an OpenId certified library, and sponsored by Auth0.

Much of the setup for the library is done within [`src/server/lib/okta/openid-connect.ts`](../../src/server/lib/okta/openid-connect.ts). This file exports a `ProfileOpenIdClient` which is an instance of this library with the correct metadata, client id, client secret, and redirect uri set up. It also only exports a subset of the methods that we need to use within our application.

We also use this file to set up helper methods to generate the `AuthorizationState`, which is used as the [`state`](https://developer.okta.com/docs/reference/api/oidc/#:~:text=Policy%3A%20no%2Dreferrer.-,state,-%3A) parameter in the authorization request.

In [`src/server/lib/okta/oauth.ts`](../../src/server/lib/okta/oauth.ts) we expose the `performAuthorizationCodeFlow` method, which is used to generate the `/authorize` url for the Auth Code flow and redirect the browser to this url to start it.

The redirect endpoint (`/oauth/authorization-code/callback`) is defined in [`src/server/routes/oauth.ts`](../../src/server/routes/oauth.ts). This is where the browser is redirected to from the authorization server during the flow. This checks the response we get back from the authorization server. If it completed successfully we get back an "auth code" which we can exchange for an access token, refresh token, and/or ID token. If it fails, we get back an error parameter which we deal with.

This method is also used to retrieve Identity cookies from Identity API as part of the dual running of systems. To do this we get an access token from the authorization server, send this to the Identity API (the "resource server" in this case), which validates the token, and returns signed Identity cookies if so.

Once all the checks are complete it will redirect the browser to an appropriate location.
