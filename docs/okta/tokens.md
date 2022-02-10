# Tokens
Okta's tokens fall into two groups: the standard OAuth and OIDC (Open ID Connect) tokens and the custom tokens that form
part of its Authentication API

## Okta-specific tokens
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
