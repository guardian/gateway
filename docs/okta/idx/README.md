# Okta IDX API and Identity Engine

Status: WIP

#### To document

- [x] IDX API introduction
- [ ] Quick Start
- [x] Why passcodes and passwordless?
- [ ] Gateway implementation
- [x] Further implementation context
- [x] [Hoppsotch](./hoppscotch.md)
- [x] [API endpoints](./idx-api.md)
- [x] [Sign in](./sign-in-idx.md)
- [x] [Create account](./create-account-idx.md)
- [x] [Reset password](./reset-password-idx.md)

### Quick Start

_TODO: Add a quick start guide to using the IDX API_

## Identity Engine

In Q3 2023, we upgraded our Okta environment to [Identity Engine](https://developer.okta.com/docs/concepts/oie-intro/), which is Okta's new(ish) authentication pipeline with additional features compared to the older [Classic Engine](https://developer.okta.com/docs/guides/archive-overview/main/), which we'll refer to as "Okta Classic" or "Okta Legacy" or some variation of the two.

Primarily for us, Identity Engine enables features that were previously impossible or difficult to implement, such as sign in without a password, or MFA (multi-factor authentication). Currently in Gateway (and the identity platform as a whole), we've been implementing "email" factor authentication and recovery, primarily referred to as "passcodes" or "OTPs (one-time passcodes)", and the generic concept of "passwordless". See the ["Why passcodes and passwordless?"](#why-passcodes-and-passwordless) section for more information on why we're betting on passcodes and passwordless.

### Interaction Code flow

In order to utilise some of these new features with Identity Engine, Okta have created a **proprietary** extension to the [OAuth 2.0 and Open ID Connect](../oauth.md) standard called the "[Interaction Code](https://developer.okta.com/docs/concepts/interaction-code/) grant type", which in their words "enables you to create a more customized user authentication experience", and behaves in a similar way to the [Authorization Code flow with PKCE](../oauth.md#oauth-20-flowsgrant-types).

The [overview](https://developer.okta.com/docs/concepts/interaction-code/) gives a reasonable overview of how this new extension works. Essentially the flow consists a number of "interactions" between the client/user and the authorization server in order to authenticate the user. Each "interaction" is called a "remediation" step, and corresponds to a piece of user data or input required by the authorization server in order to continue to the next step, until the user is fully authenticated.

A bonus to the interaction code flow is that it makes it possible to both create new users and allow users to reset their password, as part of a single authentication process which wasn't previously possible using Classic flows. Previously we'd have to use multiple different Okta API endpoints to give the impression to the user that it was a single flow. Now with the Interaction Code flow, we can use this to potentially sign in, create a new user, or reset a password all as part of the same process!

The documentation suggests that in order to use all these new features, we have to migrate our applications to use the Interaction Code flow. But since this is a **proprietary** extension, we'd rather avoid implementing this everywhere, as that would lead to potential vendor lock in, and we'd have to migrate all the user facing applications we've already migrated to use OAuth just to enable features like passwordless. This isn't ideal.

Thankfully though, we have a simple solution to this, the only place that actually needs to migrate to use the Interaction Code flow is Gateway, as Gateway (and more accurately the `profile` subdomain) is the single point for all authentication activities at the Guardian. User facing applications that need an authenticated user session **_should_** continue to use the Authorization Code flow (with or without PKCE) in order to authenticate a user. This is because when the Authorization Code flow is started, it requires a browser based login, as it has to call the `/authorize` endpoint in order to check if the user is already authenticated or not. If the user isn't authenticated it uses the browser to attempt to authenticate the user.

This browser based sign in normally redirects to the Okta hosted login page. However thanks to our [Okta hosted login page interception](../login-page-interception.md) functionality, we perform a client side redirect from the Okta hosted page to Gateway, with all the parameters we need to authenticate the user. From there we use Gateway to authenticate the user, before redirecting back to the application once authenticated. This means the only place which we need to update to use the Interaction Code flow is Gateway!

Because the Interaction Code grant type is a proprietary extension by Okta, we have to interact with it the way Okta wants us to, this means using their new authentication API where the Interaction Code flow is supported, namely the Okta IDX API.

## IDX API

The IDX API is built on the Okta Identity Engine and implements the Interaction Code flow grant type. In order to implement this they want clients to use their SDKs where this API is supported. The IDX API is also undocumented outside of [SDK documentation](https://github.com/okta/okta-auth-js/blob/master/docs/idx.md). Under the hood however the SDKs are making standard HTTP requests to a number of different API endpoints.

Our initial plan was to use the SDK in order to implement the Interaction Code flow and the IDX API in Gateway, however we found that the SDKs were too limiting in terms of being able to fully customise the flow and experience for users, and it also wouldn't set a [global session](../sessions.md#idp-session) outside of the Okta hosted flow. The only option remaining was to reverse engineer the calls made to the IDX API.

Thankfully for us this was relatively straightforward, we could see how the Okta hosted login page was using the IDX API, and document the behaviour in order of us to replicate. This documentation serves as the primary source for what we found in our investigation and implementation of the IDX API.

The decision to reverse engineer wasn't straightforward, we had to be relatively certain that Okta wouldn't suddenly change the behaviour of the IDX API which would potentially break our reverse engineered implementation. We came to this conclusion for two reasons; 1) The Okta IDX API is versioned, it returns a `version` key (currently `1.0.0`) in the response, and through the header, `Accept` and `Content-Type` supply `application/ion+json; okta-version=1.0.0` and 2) the [SDK](https://github.com/okta/okta-auth-js/?tab=readme-ov-file#release-status) also has a "Release Status" section, showing which versions of the SDK are supported, and when they will be deprecated. This gives us some confidence that the API won't change too much in the near future.

The IDX API is a relatively simple API, it consists of a number of different endpoints, each corresponding to a different "remediation" step in the Interaction Code flow. The API is documented in the [IDX API documentation](./idx-api.md), and the [Hoppscotch](./hoppscotch.md) documentation shows how to interact directly with the API. You can specifically see how the IDX is implemented for [sign in](./sign-in-idx.md), [create account](./create-account-idx.md), and [reset password](./reset-password-idx.md) in their respective documentation.

## Why passcodes and passwordless?

Passwords present the greatest risk to users of digital services, particularly when users use the same password across multiple accounts.

The need to choose a password prevents a number readers from creating an account via the traditional email and password method, making it a significant point of friction in the account creation process. This prevents our readers from accessing our products in scenarios where registration is mandatory.

Links also cause a number of problems, particularly when it comes to apps. A user could open the link on a different device, or browser, often meaning they get signed in to a location they didn't expect (e.g. they get signed in to the default device browser, rather that the Guardian app). This can be confusing and frustrating for users, and can lead to a poor user experience, and a number of identity-related complaints to User Help and Customer Experience revolve around passwords.

By implementing passcodes and passwordless, we can reduce the friction in the account creation and sign in process, and provide a better user experience for our readers. While email isn't perfect, it's a step in the right direction, and we can continue to improve the experience for our readers by implementing more secure and user-friendly methods of authentication.

One-time passcodes have to be used in the same context from which they were requested, meaning that if a user requests a passcode on the app, they have to use that same app context where they input the passcode. This means the user will always get authenticated in the same app, and won't be signed in to a different app or browser. This is a significant improvement over the current email link flow.

Currently we still require users to choose a password after they create an account, but we will encourage users towards passwordless methods of authentication in the future, and potentially be able to remove passwords entirely, or at the very least make them optional.

Integrating with the Okta IDX API and passcodes allows us to realise the value of Okta, and potentially allows us to implement more secure and user-friendly methods of authentication in the future. Such as multi-factor authentication, or even the use of passkeys or biometrics.

## Gateway implementation

_TODO: Add a section on how the IDX API is implemented in Gateway_

## Further implementation context

Here's a list of PRs/Issues that are related to Identity Engine, IDX API, and passwordless (passcodes). This may not be conclusive.

Identity Engine Upgrade PRs:

- Gateway
  - https://github.com/guardian/gateway/pull/2422
  - https://github.com/guardian/gateway/pull/2424
  - https://github.com/guardian/gateway/pull/2433
  - https://github.com/guardian/gateway/pull/2450
  - https://github.com/guardian/gateway/pull/2463
- [Identity Platform](https://github.com/guardian/identity-platform)
  - https://github.com/guardian/identity-platform/pull/679
  - https://github.com/guardian/identity-platform/pull/682
  - https://github.com/guardian/identity-platform/pull/684
  - https://github.com/guardian/identity-platform/pull/685
  - https://github.com/guardian/identity-platform/pull/688

Okta IDX API Setup and Social Sign In using IDX - https://github.com/guardian/gateway/pull/2625 & https://github.com/guardian/identity-platform/pull/718

See the [`passwordless` label](https://github.com/guardian/gateway/issues?q=label%3Apasswordless+) for all PRs related to passcodes/passwordless, and the respective label in [`identity-platform` repo](https://github.com/guardian/identity-platform/issues?q=label%3Apasswordless)

Specific PRs are shown in the documents describing the individual implementations/flows of the IDX API.
