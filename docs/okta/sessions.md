# Sessions

In our legacy identity system the concept of a "session" was easy to grasp. A user would log in, and they would be given a cookie that would be used to identify them for the duration of their session. This cookie would be used to identify the user for all requests to the API, and would be used to identify the user for all requests to the API.

In Okta and OAuth, the concept of sessions can get a little more complicated. As there are multiple "session layers" that can be used to identify a user, it's important to understand how they all work together.

## Okta Sessions

https://developer.okta.com/docs/concepts/session/

There are two layers of session in Okta in the following hierarchy.

1. IdP Session (also we call Okta Session, or SSO Session, or Global Session)
2. Application Session (also we call OAuth Session, App Session, or Local Session)

### IdP Session

We generally call this the Global Session or Okta session internally, but is known in the Okta documentation as the IdP Session.

The IdP session is the session that is created when a user logs in to or authenticates with Okta with their credentials and any various MFA options. This session is created by Okta and is identified by a cookie named `idx` in the browser, and `sid` cookie may also be set, but this is a legacy Okta identification cookie.

This cookie is only valid on the Okta/login domain (at the Guardian this is the `profile` subdomain, e.g. https://profile.theguardian.com), and the value is the session id. This same session id which can be used by the [Okta Sessions API](https://developer.okta.com/docs/reference/api/sessions/). This is an opaque value, and only authenticates the user, it does not contain any information about the user, and should not be used to authenticate the user on any API.

This is the closest analogy to the legacy identity system's session cookie, but we do not use this cookie to authenticate any requests to any of our APIs. Instead, we use the application session to do this, specifically the OAuth access token.

This cookie is helpful for SSO (Single Sign-On) as it allows us to identify the user across multiple applications. For example, when a user logs in to the Guardian, they will be able to get logged in to any platform, e.g. from the main website, to manage my account to support. The easiest way to understand SSO is through native apps, where if a user logs into the Guardian Live app, they can then open the Guardian Puzzles app, click sign in, and they will be logged in without having to enter their credentials again.

We use a session length of 90 days for this, and will be automatically refreshed when a user goes though an OAuth flow, for example the Authorization Code flow.

### Application Session

We generally call this the OAuth Session, Local Session, or App Session internally, but is known in the Okta documentation as the Application Session.

The application session is identified through the use of OAuth tokens, specifically the Access and ID tokens, which are created when an app goes through a given OAuth flow, in most cases this will be the Authorization Code flow (with or without PKCE).

When creating an application session, the OAuth flow will check if the user has an IdP session, if they do the user is authenticated using that IdP session, and the OAuth flow completes and creates an application session. If a user does not have an IdP session, the OAuth flow will ask the user to first authenticate with their credentials, therefore creating an IdP session, and then the OAuth flow will complete and create an application session.

Application sessions will have a much shorter session length than the IdP session, usually in the range of 1 hour or a few hours. In order to extend the given application session, the user must go through the OAuth flow again, which will refresh the application session (and the tokens associated with it).

It is also possible to have a longer lived Application Session which can be completely separate from the IdP session through the use of the Refresh Token. Refresh tokens can be used to create new Access and ID tokens without having to go through the OAuth flow again. This is useful for native apps, where the user may want to stay logged in for a longer period of time, but not have to go through the OAuth flow again. The refresh tokens can live to an unlimited length. However security is a key concern with refresh tokens.

For more information about OAuth tokens see the [Tokens](tokens.md) documentation.

## Session management

As you can tell from above session management can be a little complicated, and there are a few different ways to manage sessions.

In general for native apps, we recommend using the Refresh Token to manage sessions, as this allows the user to stay logged in for a longer period of time, and not have to go through the OAuth flow again.

For web apps, we suggest only using the access and id tokens for the application session, and when these need to be refreshed, the user should be redirected to the OAuth flow again. This makes it a bit more seamless for the user on a browser, so that all browser applications have the same overall Global session length determined by the IdP session.
