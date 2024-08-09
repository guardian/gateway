/**
 * Possible `error` types return by OpenID Connect and social login flows with okta
 * Sourced from https://developer.okta.com/docs/reference/error-codes/#example-errors-for-openid-connect-and-social-login
 */
export enum OpenIdErrors {
	ACCESS_DENIED = 'access_denied',
	LOGIN_REQUIRED = 'login_required',
}

export enum OpenIdErrorDescriptions {
	ACCOUNT_LINKING_DENIED_GROUPS = 'User linking was denied because the user is not in any of the specified groups.',
	USER_STATUS_INVALID = 'User status is invalid.',
}
