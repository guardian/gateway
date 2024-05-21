export type ConsentPath = 'newsletters' | 'data' | 'review';

/**
 * These are all the accepted url routes for this application
 * If you want to add a new route, it will need to be added below
 */
export const ValidRoutePathsArray = [
	'/404',
	'/change-email/:token',
	'/change-email/complete',
	'/change-email/error',
	'/agree/GRS',
	'/email/:template',
	'/consent-token/:token/accept',
	'/consent-token/error',
	'/consent-token/resend',
	'/consent-token/email-sent',
	'/delete',
	'/delete/complete',
	'/delete/email-sent',
	'/delete-blocked',
	'/delete-email-validation',
	'/delete-set-password',
	'/error',
	'/maintenance',
	'/oauth/authorization-code/:callbackParam',
	'/oauth/authorization-code/application-callback',
	'/oauth/authorization-code/callback',
	'/oauth/authorization-code/delete-callback',
	'/oauth/authorization-code/interaction-code-callback',
	'/reauthenticate',
	'/register',
	'/register/email',
	'/register/email-sent',
	'/register/email-sent/resend',
	'/reset-password',
	'/reset-password/:token',
	'/reset-password/complete',
	'/reset-password/email-sent',
	'/reset-password/expired',
	'/reset-password/resend',
	'/set-password',
	'/set-password/:token',
	'/set-password/complete',
	'/set-password/email-sent',
	'/set-password/expired',
	'/set-password/resend',
	'/signed-in-as',
	'/signin',
	'/signin/refresh',
	'/signin/:social',
	'/signin/email-sent',
	'/signin/email-sent/resend',
	'/signout',
	'/signout/all',
	'/unsubscribe/:emailType/:data/:token',
	'/unsubscribe/success',
	'/unsubscribe/error',
	'/unsubscribe-all/:data/:token',
	'/subscribe/:emailType/:data/:token',
	'/subscribe/success',
	'/subscribe/error',
	'/verify-email', //this can be removed once Jobs has been migrated
	'/welcome',
	'/welcome/:token',
	'/welcome/:app/complete',
	'/welcome/complete',
	'/welcome/email-sent',
	'/welcome/expired',
	'/welcome/resend',
	'/welcome/google',
	'/welcome/apple',
	'/welcome/social',
	'/welcome/review',
	'/welcome/newsletters',
] as const;

export type RoutePaths = (typeof ValidRoutePathsArray)[number];

/**
 * These are all valid paths for the Identity API
 * New routes should be added below
 */
export type ApiRoutePaths =
	| '/auth'
	| '/auth/oauth-token'
	| '/auth/redirect'
	| '/consents'
	| '/consent-email/:token'
	| '/consent-email/resend/:token'
	| '/guest'
	| '/newsletters'
	| '/pwd-reset/reset-pwd-for-user'
	| '/pwd-reset/send-password-reset-email'
	| '/pwd-reset/user-for-token'
	| '/signin-token/token/:token'
	| '/unauth'
	| '/user/change-email'
	| '/unsubscribe'
	| '/subscribe'
	| '/unsubscribe-all'
	| '/user'
	| '/user/me'
	| '/user/me/consents'
	| '/user/me/group/:groupCode'
	| '/user/send-account-exists-email'
	| '/user/send-account-verification-email'
	| '/user/send-account-without-password-exists-email'
	| '/user/send-create-password-account-exists-email'
	| '/user/send-validation-email'
	| '/user/type/:email'
	| '/user/validate-email/:token'
	| '/users/me/consents'
	| '/users/me/newsletters'
	| '/users/me/touch-braze';

type OktaApiRoutePaths =
	| '/api/v1/apps/:id'
	| '/api/v1/authn'
	| '/api/v1/authn/credentials/reset_password'
	| '/api/v1/authn/recovery/token'
	| '/api/v1/sessions/me'
	| '/api/v1/sessions/:sessionId'
	| '/api/v1/users'
	| '/api/v1/users/:id'
	| '/api/v1/users/:id/credentials/forgot_password'
	| '/api/v1/users/:id/groups'
	| '/api/v1/users/:id/lifecycle/activate'
	| '/api/v1/users/:id/lifecycle/reactivate'
	| '/api/v1/users/:id/lifecycle/reset_password'
	| '/api/v1/users/:id/sessions';

type MembersDataApiRoutePaths = '/user-attributes/me';

export type PasswordRoutePath = Extract<
	'/reset-password' | '/set-password' | '/welcome',
	RoutePaths
>;

/**
 * This is all valid routes on the site, only used for the helper function addQueryParamsToPath
 */
export type AllRoutes =
	| ApiRoutePaths
	| RoutePaths
	| OktaApiRoutePaths
	| MembersDataApiRoutePaths;
