# IDX API Documentation

_See the [README](./README.md#idx-api) for an introduction to the IDX API_

This document describes the Okta IDX API endpoints that are used in Gateway to authenticate a user using the Interaction Code flow.

See the [Hoppscotch](./hoppscotch.md) collection for a way to interact with the IDX API directly.

See the specific flow documentation for how the IDX API is used in Gateway for [sign in](./sign-in-idx.md), [create account](./create-account-idx.md), and [reset password](./reset-password-idx.md).

Within Gateway, everything that is directly specific for the IDX API is located in the [`src/server/lib/okta/idx`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx) directory. We use [`zod`](https://zod.dev/) to model and validate the request and response types for the IDX API. To make it easier to call the IDX API, we have a `fetch` wrapper method specifically for the IDX API implementation in Gateway, see the [`idxFetch` method](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/shared/idxFetch.ts#L85-L95) for information about that. This handles correctly parsing the request and response types, and also handles error handling and logging.

## API Endpoints

#### Endpoints used in Gateway

These endpoints are used in Gateway to authenticate a user using the Interaction Code flow.

- [`interact`](#interact) - `POST /oauth2/{authorizationServerId}/v1/interact`
- [`introspect`](#introspect) - `POST /idp/idx/introspect`
- [`identify`](#identify) - `POST /idp/idx/identify`
- [`enroll`](#enroll) - `POST /idp/idx/enroll`
- [`enroll/new`](#enrollnew) - `POST /idp/idx/enroll/new`
- [`challenge`](#challenge) - `POST /idp/idx/challenge`
- [`challenge/answer`](#challengeanswer) - `POST /idp/idx/challenge/answer`
- [`challenge/resend`](#challengeresend) - `POST /idp/idx/challenge/resend`
- [`recover`](#recover) - `POST /idp/idx/recover`
- [`credential/enroll`](#credentialenroll) - `POST /idp/idx/credential/enroll`

#### Other Endpoints

These endpoints are not used in Gateway, but are part of the IDX API, and could potentially be used or implemented in the future if needed. For now they are documented here as the [Hoppscotch](./hoppscotch.md) collection includes them.

- [`identify/select`](#identifyselect) - `POST /idp/idx/identify/select`
- [`skip`](#skip) - `POST /idp/idx/skip`
- [`cancel`](#cancel) - `POST /idp/idx/cancel`
- [`unlock-account`](#unlock-account) - `POST /idp/idx/unlock-account`

#### Login redirect

Not an endpoint per say, but the URL that the user should be redirected to after authenticating with the IDX API in order to complete the Interaction Code flow and set a global session cookie. This is the last step in the flow once the user has authenticated. This will eventually redirect the user back to the application that they were initially authenticating from.

- [`/login/token/redirect`](#logintokenredirect) - `303 See Other GET /idp/idx/login/token/redirect`

#### Usage

All methods are `POST` requests, and with the exception of the `interact` endpoint, all requests should have the `Content-Type` and `Accept` headers set to `application/ion+json; okta-version=1.0.0`, and include the `stateHandle` in the body of the request, along with any other required parameters.

The responses section of the IDX API endpoints describe a subset of the full response, as the response can vary depending on the user/state, and we don't include all possible fields/values.

For each of the endpoints for more implementation details, such as the exact request/response types and usages, see the implementation section which links to the source code in Gateway.

In most cases we rely on the remediation name to determine the next step in the flow, and the `stateHandle` to identify the current state of the interaction code flow, rather than the full response.

### `interact`

#### Implementation

[`src/server/lib/okta/idx/interact.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/interact.ts#L30-L45)

#### Description

Gets an interaction handle from the IDX API, and starts the Interaction Code flow. This is the first endpoint that should be called when authenticating a user using the Interaction Code flow.

The endpoint takes a parameters that are a subset of those used in the Authorization Code flow with PKCE, and returns an `interaction_handle` which is used to identify the current interaction.

This `interaction_handle` is then only used in the next step when calling the `introspect` endpoint, after which it can be discarded as the `stateHandle` is used to identify the process from that point forward.

In Gateway we only use the interaction code flow for authentication, in order to avoid using the Okta hosted sign in page. The standard authorization code flow is used for anything else.

#### Path

`POST /oauth2/{authorizationServerId}/v1/interact`

| Parameter               | Description                        | Value                                                        |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `authorizationServerId` | The ID of the authorization server | Set to the main Guardian custom authorization server in Okta |

#### Headers

```http
Content-Type: application/x-www-form-urlencoded
```

#### Body

The body parameters is similar to that used in the Authorization Code flow, which can be seen in the [Okta `/authorize` endpoint](https://developer.okta.com/docs/api/openapi/okta-oauth/oauth/tag/CustomAS/#tag/CustomAS/operation/authorizeCustomAS). Instead of the parameters being in the query string, they are in the body of the request as form data (`application/x-www-form-urlencoded`).

We only use a subset of the parameters available in the Authorization Code flow, as we don't need to use all of them, with the ones used shown below.

See [usage](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/interact.ts#L100-L116) in Gateway.

| Parameter               | Description                             | Value                                                                                               |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `client_id`             | The Client ID of the application        | Set to the Gateway (`profile`) client id in Okta                                                    |
| `redirect_uri`          | The redirect URI of the application     | Always set to the interaction code flow callback uri in Gateway                                     |
| `scope`                 | The scopes requested by the application | Set to the scopes required for authentication                                                       |
| `state`                 | The state parameter                     | Set to a random string to prevent CSRF, should match whats stored in the Authorization State cookie |
| `code_challenge`        | The code challenge                      | A random string used to verify the code verifier                                                    |
| `code_challenge_method` | The code challenge method               | Set to `S256` for PKCE                                                                              |

#### Response

```http
Content-Type: application/json
```

```json
{
	"interaction_handle": "<interaction_handle>"
}
```

| Parameter            | Description                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interaction_handle` | The interaction handle, used to identify the current interaction, a seemingly random string. Can be discarded after calling [`introspect`](#introspect), after which the `stateHandle` is used to identify the current process. |

### `introspect`

#### Implementation

[`src/server/lib/okta/idx/introspect.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/introspect.ts#L79-L92)

#### Description

IThe introspect step lets us know what kind of authentication we can perform and what the next steps are, called a "remediation". It also returns the `stateHandle` which identifies the current state of the authentication process, and should be preserved and used in any subsequent requests in the flow.

This is the second endpoint that should be called when authenticating a user using the Interaction Code flow (using an `interaction_handle` from the [`introspect`](#introspect) endpoint), or at any point in the flow to get the current state and remediation steps (using the `stateHandle` from any `/idp/idx/<endpoint>` call).

#### Path

`POST /idp/idx/introspect`

#### Body

**With `interactionHandle`**

```json
{
	"interactionHandle": "<interaction_handle>"
}
```

**With `stateHandle`**

```json
{
	"stateHandle": "<state_handle>"
}
```

#### Response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "<remediation_name>",
            ...
        },
        ...
    ]
}
```

| Parameter          | Description                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`          | The version of the IDX API, currently `1.0.0`                                                                                                                        |
| `stateHandle`      | The state handle, used to identify the current state of the interaction code flow. This should be persisted, and is used in all subsequent calls to the IDX API.     |
| `expiresAt`        | The time at which the state handle expires, in ISO 8601 format, e.g. `2024-10-21T12:08:37.789Z`. This can change depending on the current remediation step.          |
| `remediation`      | An array of remediation steps, each corresponding to a different "remediation" step in the Interaction Code flow. Each value can vary depending on the current step. |
| `remediation_name` | The name of the remediation step, is used to identify what next steps can be taken                                                                                   |

### `identify`

#### Implementation

[`src/server/lib/okta/idx/identify.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/identify.ts#L47-L56)

#### Description

Use the `identify` endpoint to start the sign in process or to reset password, for an existing user. Can be called after the first time after the `introspect` step.

#### Path

`POST /idp/idx/identify`

#### Body

```json
{
	"stateHandle": "<state_handle>",
	"identifier": "<email>",
	"rememberMe": true
}
```

| Parameter     | Description                                                                        | Value                                                                               |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from the [`introspect`](#introspect) step.                        |
| `identifier`  | User's primary identifier                                                          | The email address of the user to sign in, or reset the password for.                |
| `rememberMe`  | Whether to be able to set a global session after authentication                    | Always set to `true` as we always want a global session after authenticating a user |

#### Response

Users will get either the `select-authenticator-authenticate` or `challenge-authenticator` remediation step, depending on the user's current state. In most cases, the user will get the `select-authenticator-authenticate` remediation step should they be in the `ACTIVE` state.

**`select-authenticator-authenticate`** response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "select-authenticator-authenticate",
            "value": [
                {
                    "name": "authenticator",
                    "options": [
                        {
                          "label": "<authenticator_label>",
                          "value": {
                            "form": {
                                "value": [
                                    {
                                        "name": "id",
                                        "value": "<authenticator_id>"
                                        ...
                                    },
                                    {
                                        "name": "methodType",
                                        "value": "<authenticator_method>"
                                        ...
                                    }
                                ]
                            }
                          }
                        },
                        ...
                    ],
                    ...
                },
                ...
            ]
            ...
        },
        ...
    ]
}
```

| Parameter              | Description                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `authenticator_label`  | The label of the authenticator, e.g. `"Email"` or `"Password"`                                                     |
| `authenticator_id`     | The ID of the authenticator, used by the `challenge` step to try and authenticate the user with that authenticator |
| `authenticator_method` | The method type of the authenticator, e.g. `"password"` or `"email"`                                               |

**`challenge-authenticator`** response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "challenge-authenticator",
            "value": [
                {
                    "name": "credentials",
                    "form": {
                        "value": [
                            {
                                "name": "passcode",
                                ...
                            }
                        ]
                    },
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ]
}
```

| Parameter  | Description                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `passcode` | The passcode to authenticate the user with the `challenge/answer` endpoint, e.g. the user's password or a one-time passcode. |

### `enroll`

#### Implementation

[`src/server/lib/okta/idx/enroll.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/enroll.ts#L38-L46)

#### Description

Use the `enroll` endpoint to start the sign up process for a new user. Can be called after the first time after the `introspect` step. Note that this endpoint doesn't actually create the user, it just signals to the IDX API that we're entering the sign up process.

#### Path

`POST /idp/idx/enroll`

#### Body

```json
{
	"stateHandle": "<state_handle>"
}
```

| Parameter     | Description                                                                        | Value                                                        |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from the [`introspect`](#introspect) step. |

#### Response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "enroll-profile",
            ...
        },
        ...
    ]
}
```

| Parameter     | Description                                                                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `remediation` | The remediation step, in this case `enroll-profile`, which is the first step in the sign up process. If this is present we can call the [`enroll/new`](#enrollnew) endpoint to attempt to create a new user |

### `enroll/new`

#### Implementation

[`src/server/lib/okta/idx/enroll.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/enroll.ts#L125-L134)

#### Description

Use the `enroll/new` endpoint to attempt to create a new user. This is the second step in the sign up process, and is called after the `enroll` step. This endpoint will return a `remediation` step which will contain the next steps in the sign up process.

If a user already exists then the response will be the same as the `enroll` endpoint but also containing the `registration.error.notUniqueWithinOrg` error, and should be handled accordingly.

#### Path

`POST /idp/idx/enroll/new`

#### Body

```json
{
	"stateHandle": "<state_handle>",
	"userProfile": {
		"email": "<email>",
		"isGuardianUser": true,
		"registrationLocation": "<registration_location>",
		"registrationPlatform": "<registration_platform>"
	}
}
```

| Parameter              | Description                                                                              | Value                                                                                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stateHandle`          | The state handle, used to identify the current state of the interaction code flow.       | The `stateHandle` from a previous IDX API step.                                                                                                                                                                                                                        |
| `email`                | The email address of the user to sign up                                                 | The email address of the user to sign up                                                                                                                                                                                                                               |
| `isGuardianUser`       | Whether the user is a Guardian user, to add them to the `GuardianUser-All` group in Okta | Always set to `true`                                                                                                                                                                                                                                                   |
| `registrationLocation` | The optional geographic country where the user is creating the account from              | e.g. "United Kingdom", "United States", "Europe", "Other", etc. See [more](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/getRegistrationLocation.ts#L10-L47)                                                        |
| `registrationPlatform` | The optional application where the user is creating the account from                     | Corresponds to the application name in Okta based on the client ide.g. "android_live_app", "ios_feast_app", "profile" etc. See [more](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/registrationPlatform.ts#L6-L34) |

#### Response

Users will get either the `select-authenticator-enroll` or `enroll-authenticator` remediation step, depending on the current way create account process is setup in Okta.

Currently it will be set to `select-authenticator-authenticate` remediation step as we manually select the authenticators to use in the create account process. As first we enroll in the `email` authenticator for the user to verify their account, and then we enroll in the `password` authenticator for the user to set a password.

In the future this might change where we make the `password` authenticator optional.

**`select-authenticator-authenticate`** response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "select-authenticator-authenticate",
            "value": [
                {
                    "name": "authenticator",
                    "options": [
                        {
                          "label": "<authenticator_label>",
                          "value": {
                            "form": {
                                "value": [
                                    {
                                        "name": "id",
                                        "value": "<authenticator_id>"
                                        ...
                                    },
                                    {
                                        "name": "methodType",
                                        "value": "<authenticator_method>"
                                        ...
                                    }
                                ]
                            }
                          }
                        },
                        ...
                    ],
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ]
}
```

| Parameter              | Description                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `authenticator_label`  | The label of the authenticator, e.g. `"Email"` or `"Password"`                                                     |
| `authenticator_id`     | The ID of the authenticator, used by the `challenge` step to try and authenticate the user with that authenticator |
| `authenticator_method` | The method type of the authenticator, e.g. `"password"` or `"email"`                                               |

**`enroll-authenticator`** response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "enroll-authenticator",
            "value": [
                {
                    "name": "credentials",
                    "form": {
                        "value": [
                            {
                                "name": "passcode",
                                ...
                            }
                        ]
                    },
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ],
    "currentAuthenticator": {
        "value": {
            "type": "<authenticator_type>",
            ...
        }
    }
}
```

| Parameter            | Description                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `passcode`           | The passcode to authenticate the user with the `challenge/answer` endpoint, e.g. the user's password or a one-time passcode.                                               |
| `authenticator_type` | The type of the authenticator, e.g. `"password"` or `"email"`, the "currentAuthenticator" section can be used to check if it's possible to resend the authenticator email. |

### `challenge`

#### Implementation

[`src/server/lib/okta/idx/challenge.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/challenge.ts#L67-L75)

#### Description

Use the `challenge` endpoint to authenticate a user with a specified authenticator, currently "email" or "password". This is usually called after [`identity`](#identify) or [`enroll/new`](#enrollnew).

#### Path

`POST /idp/idx/challenge`

#### Body

```json
{
	"stateHandle": "<state_handle>",
	"authenticator": {
		"id": "<authenticator_id>",
		"methodType": "<authenticator_method>"
	}
}
```

| Parameter            | Description                                                                         | Value                                                                                                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stateHandle`        | The state handle, used to identify the current state of the interaction code flow.  | The `stateHandle` from a previous IDX API step.                                                                                                                                                                                                                     |
| `authenticator_id`   | The ID of the authenticator, used to authenticate the user with that authenticator. | Use [`findAuthenticatorId`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/shared/findAuthenticatorId.ts#L17-L25) to get the id from a given response, remediation name, and expected authenticator type |
| `authenticator_type` | The method type of the authenticator,                                               | `"password"` or `"email"`, depending on the authenticator id                                                                                                                                                                                                        |

#### Response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "challenge-authenticator",
            "value": [
                {
                    "name": "credentials",
                    "form": {
                        "value": [
                            {
                                "name": "passcode",
                                ...
                            }
                        ]
                    },
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        {
            "name": "select-authenticator-authenticate",
            "value": [
                {
                    "name": "authenticator",
                    "options": [
                        {
                          "label": "<authenticator_label>",
                          "value": {
                            "form": {
                                "value": [
                                    {
                                        "name": "id",
                                        "value": "<authenticator_id>"
                                        ...
                                    },
                                    {
                                        "name": "methodType",
                                        "value": "<authenticator_method>"
                                        ...
                                    }
                                ]
                            }
                          }
                        },
                        ...
                    ],
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ],
    "currentAuthenticatorEnrollment": {
        "value": {
            "type": "<authenticator_method>",
            "<resend|recover>": {
                ...
            }
            ...
        }
    }
    ...
}
```

| Parameter              | Description                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `passcode`             | The passcode to authenticate the user with the `challenge/answer` endpoint, e.g. the user's password or a one-time passcode. |
| `authenticator_label`  | The label of the authenticator, e.g. `"Email"` or `"Password"`                                                               |
| `authenticator_id`     | The ID of the authenticator, used by the `challenge` step to try and authenticate the user with that authenticator           |
| `authenticator_method` | The method type of the authenticator, e.g. `"password"` or `"email"`                                                         |
| `resend`               | The resend object, only when "email" authenticator method is selected. Allows us to resend an OTP email to the user          |
| `recover`              | The recover object, only when "password" authenticator method is selected. Allows us to recover (reset) the user's password  |

### `challenge/answer`

#### Implementation

[`src/server/lib/okta/idx/challenge.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/challenge.ts#L240-L249)

#### Description

Use the `challenge/answer` endpoint to answer the challenge from the `challenge` endpoint, and authenticate the user with the specified authenticator.

#### Path

`POST /idp/idx/challenge/answer`

#### Body

```json
{
	"stateHandle": "<state_handle>",
	"credentials": {
		"passcode": "<passcode>"
	}
}
```

| Parameter  | Description                                                                          | Value                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `passcode` | The credential to attempt authenticate the user with the `challenge/answer` endpoint | The user's password (when using "password" authenticator), or a one-time passcode (when using "email" authenticator). |

#### Response

If there are any errors then the response will contain a message with the error, and the `remediation` step will contain the same `challenge` step as the response, allowing the user to try again.

On a success response, one of two things could happen:

1. The user is fully authenticated and a `CompleteLoginResponse` is returned, with no `remediation`.
   - This will contain a `user` object
2. The user hasn't fully authenticated and additional `remediation` steps are returned.
   - `select-authenticator-enroll`
     - Returned if the user needs to enroll in an additional authenticator after authenticating with the previous one, e.g. the user has verifying with their email and now needs to set a password.
   - `reset-authenticator`
     - Returned if the user needs to reset an authenticator after validating the previous one, e.g. the user has forgotten their password and needs to reset it, so after verifying with their email they need to reset their password.
   - `skip`
     - Returned if the user can skip the current step, e.g. the user has verified their email and doesn't want to set a password. Will potentially be used in the future when we make the password authenticator optional.

**CompleteLoginResponse**

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "user": {
        "value": {
            "id": "<user_id>",
            "identifier": "<user_email>",
            "profile": {
                ...
            }
        },
        ...
    },
    ...
}
```

| Parameter    | Description                                      |
| ------------ | ------------------------------------------------ |
| `user_id`    | The Okta ID of the user.                         |
| `user_email` | The email address of the user.                   |
| `profile`    | The user's profile, with default fields included |

As noted since there is no `remediation` and has a `user` object the user has finished authenticating. To set a global session cookie and finish the Interaction Code flow we have to redirect the user to the [`/login/token/redirect`](#logintokenredirect) endpoint.

**`select-authenticator-enroll`** response

Returned when we need to enroll in an additional required authenticator if the user is not already enrolled in it.

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "select-authenticator-enroll",
            "value": [
                {
                    "name": "authenticator",
                    "options": [
                        {
                          "label": "<authenticator_label>",
                          "value": {
                            "form": {
                                "value": [
                                    {
                                        "name": "id",
                                        "value": "<authenticator_id>"
                                        ...
                                    },
                                    {
                                        "name": "methodType",
                                        "value": "<authenticator_method>"
                                        ...
                                    }
                                ]
                            }
                          }
                        },
                        ...
                    ],
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ]
}
```

| Parameter              | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `authenticator_label`  | The label of the authenticator, e.g. `"Email"` or `"Password"`       |
| `authenticator_id`     | The ID of the authenticator that we need to enroll in                |
| `authenticator_method` | The method type of the authenticator, e.g. `"password"` or `"email"` |

**`reset-authenticator`** response

Returned when we have to set a new password for the user after verifying their email during the [`recover`y](#recover) flow.

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "reset-authenticator",
            "value": [
                {
                    "name": "credentials",
                    "form": {
                        "value": [
                            {
                                "name": "passcode",
                                ...
                            }
                        ]
                    },
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ]
}
```

| Parameter  | Description                                                                              |
| ---------- | ---------------------------------------------------------------------------------------- |
| `passcode` | The user's new password which we have to call the `challenge/answer` endpoint again with |

### `challenge/resend`

#### Implementation

[`src/server/lib/okta/idx/challenge.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/challenge.ts#L268-L276)

#### Description

Use the `challenge/resend` endpoint to resend the OTP email to the user, when the user is enrolling/authenticating with the `email` authenticator. Available after the `challenge` step, and when the `challenge/answer` step returns the `resend` object inside the `currentAuthenticatorEnrollment`/`currentAuthenticatorEnrollment` object.

#### Path

`POST /idp/idx/challenge/resend`

#### Body

```json
{
	"stateHandle": "<state_handle>"
}
```

| Parameter     | Description                                                                        | Value                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from a previous IDX API step, where the `resend` object was present in the `currentAuthenticatorEnrollment`. |

#### Response

Same as the [`challenge`](#challenge) response.

### `recover`

#### Implementation

[`src/server/lib/okta/idx/recover.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/recover.ts#L55-L62)

#### Description

Use the `recover` endpoint to start the password recovery process for a user. This is called after the [`identify`](#identify) step, and starting the `password` authenticator [`challenge`](#challenge) step where the `recover` object is present in the `currentAuthenticatorEnrollment` object.

#### Path

`POST /idp/idx/recover`

#### Body

```json
{
	"stateHandle": "<state_handle>"
}
```

| Parameter     | Description                                                                        | Value                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from a previous IDX API step, where the `recover` object was present in the `currentAuthenticatorEnrollment`. |

#### Response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "authenticator-verification-data",
            "value": [
                {
                    "name": "authenticator",
                    "label": "<authenticator_label>",
                    "form": {
                        "value": [
                            {
                                "name": "id",
                                "value": "<authenticator_id>"
                                ...
                            },
                            {
                                "name": "methodType",
                                "value": "<authenticator_method>"
                                ...
                            }
                        ]
                    },
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ]
}
```

| Parameter              | Description                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `authenticator_label`  | The label of the authenticator, currently this will just be "Email"                                               |
| `authenticator_id`     | The ID of the authenticator, used to authenticate the user with it, currently the id of the "email" authenticator |
| `authenticator_method` | The method type of the authenticator, currently this will just be "email"                                         |

### `credential/enroll`

#### Implementation

[`src/server/lib/okta/idx/credential.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/credential.ts#L32-L40)

#### Description

Use the `credential/enroll` endpoint to enroll in a new credential, e.g. a password, after authenticating with the `email` authenticator. This usually after `challenge/answer` returns a remediation requesting this.

#### Path

`POST /idp/idx/credential/enroll`

#### Body

```json
{
	"stateHandle": "<state_handle>",
	"authenticator": {
		"id": "<authenticator_id>",
		"methodType": "<authenticator_method>"
	}
}
```

| Parameter            | Description                                                                         | Value                                                                                                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stateHandle`        | The state handle, used to identify the current state of the interaction code flow.  | The `stateHandle` from a previous IDX API step.                                                                                                                                                                                                                     |
| `authenticator_id`   | The ID of the authenticator, used to authenticate the user with that authenticator. | Use [`findAuthenticatorId`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/shared/findAuthenticatorId.ts#L17-L25) to get the id from a given response, remediation name, and expected authenticator type |
| `authenticator_type` | The method type of the authenticator,                                               | `"password"` or `"email"`, depending on the authenticator id                                                                                                                                                                                                        |

#### Response

```json
{
    "version": "1.0.0",
    "stateHandle": "<state_handle>",
    "expiresAt": "<expires_at>",
    "remediation": [
        {
            "name": "enroll-authenticator",
            "value": [
                {
                    "name": "credentials",
                    "form": {
                        "value": [
                            {
                                "name": "passcode",
                                ...
                            }
                        ]
                    },
                    ...
                },
                {
                    "name": "stateHandle",
                    ...
                }
            ]
            ...
        },
        ...
    ],
    "currentAuthenticator": {
        "value": {
            "type": "<authenticator_method>",
            "resend": {
                ...
            }
            ...
        }
    }
    ...
}
```

| Parameter              | Description                                                                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `passcode`             | The passcode to authenticate the user with the `challenge/answer` endpoint, e.g. the user's password or a one-time passcode.                                                                                                            |
| `authenticator_method` | The type of the authenticator, e.g. `"password"` or `"email"`, the "currentAuthenticator" section can be used to check if it's possible to resend the authenticator email, which is only available when enrolling in the "email" factor |

### `identify/select`

#### Description

Used to navigate back to the starting point from the `enroll` or `enroll/new` steps, to allow the user to sign in instead of signing up.

#### Path

`POST /idp/idx/identify/select`

#### Body

```json
{
	"stateHandle": "<state_handle>"
}
```

| Parameter     | Description                                                                        | Value                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from a previous IDX API step, where the user was in the `enroll` or `enroll/new` step and wants to sign in. |

#### Response

Same as the initial [`introspect`](#introspect) response, allowing the user to sign in instead of signing up.

### `skip`

#### Description

Allows the user to skip enrollment for an optional authenticator, e.g. the user has verified their email and doesn't want to set a password. May potentially be used in the future when we make the password authenticator optional.

#### Path

`POST /idp/idx/skip`

#### Body

```json
{
	"stateHandle": "<state_handle>"
}
```

| Parameter     | Description                                                                        | Value                                           |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from a previous IDX API step. |

#### Response

Same as the [`challenge/answer`](#challengeanswer) response, allowing the user to continue with the Interaction Code flow, or will be authenticated.

### `cancel`

#### Description

Allows the user to cancel the current interaction code flow, and return to the starting point. Not used in Gateway, if we want to restart, we just call [`interact`](#interact) again for a new `interaction_handle` followed by [`introspect`](#introspect).

#### Path

`POST /idp/idx/cancel`

#### Body

```json
{
	"stateHandle": "<state_handle>"
}
```

| Parameter     | Description                                                                        | Value                                           |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from a previous IDX API step. |

### `unlock-account`

#### Description

Allows the user to unlock their account, if they have been locked out due to too many failed login attempts. Not used in Gateway, as we don't have this feature currently.

#### Path

`POST /idp/idx/unlock-account`

#### Body

```json
{
	"stateHandle": "<state_handle>"
}
```

| Parameter     | Description                                                                        | Value                                           |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| `stateHandle` | The state handle, used to identify the current state of the interaction code flow. | The `stateHandle` from a previous IDX API step. |

### `/login/token/redirect`

#### Implementation

[`src/server/lib/okta/idx/shared/idxFetch.ts`](https://github.com/guardian/gateway/blob/bb8b32e30dd178a7ffe81ec75c64b2ce4ad93aeb/src/server/lib/okta/idx/shared/idxFetch.ts#L120-L128)

#### Description

The URL that the user should be redirected to after authenticating with the IDX API in order to complete the Interaction Code flow and set a global session cookie (the `idx` cookie).

This is the last step in the flow once the user has authenticated. This will eventually redirect the user back to the application that they were initially authenticating from.

#### Path

`303 See Other GET /idp/idx/login/token/redirect?stateToken={stateToken}`

| Parameter    | Description                                                                       | Value                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `stateToken` | The state token, used to identify the current state of the interaction code flow. | Derived from the `stateHandle`, and is the `stateHandle` only everything before the first tilde (`stateHandle.split('~')[0]`) |
