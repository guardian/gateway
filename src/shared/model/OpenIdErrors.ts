/**
 * Possible `error` types return by OpenID Connect and social login flows with okta
 * Sourced from https://developer.okta.com/docs/reference/error-codes/#example-errors-for-openid-connect-and-social-login
 */
export enum OpenIdErrors {
	UNAUTHORIZED_CLIENT = 'unauthorized_client',
	ACCESS_DENIED = 'access_denied',
	UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type',
	INVALID_SCOPE = 'invalid_scope',
	SERVER_ERROR = 'server_error',
	TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',
	INVALID_CLIENT = 'invalid_client',
	LOGIN_REQUIRED = 'login_required',
	INVALID_REQUEST = 'invalid_request',
	USER_CANCELED_REQUEST = 'user_canceled_request',
}

export enum OpenIdErrorDescriptions {
	ACCOUNT_LINKING_DENIED_GROUPS = 'User linking was denied because the user is not in any of the specified groups.',
}
