/**
 * These are all the accepted url routes for this application
 * If you want to add a new route, it will need to be added below
 */
export type RoutePaths =
  | '/signin'
  | '/register'
  | '/register/email-sent'
  | '/register/email-sent/resend'
  | '/reset-password'
  | '/reset-password/email-sent'
  | '/reset-password/expired'
  | '/reset-password/:token'
  | '/reset-password/complete'
  | '/reset-password/resend'
  | '/set-password'
  | '/set-password/expired'
  | '/set-password/:token'
  | '/set-password/complete'
  | '/set-password/resend'
  | '/set-password/email-sent'
  | '/consents/data'
  | '/consents/communication'
  | '/consents/newsletters'
  | '/consents/review'
  | '/consents/:page'
  | '/consents'
  | '/welcome'
  | '/welcome/resend'
  | '/welcome/expired'
  | '/welcome/email-sent'
  | '/welcome/complete'
  | '/welcome/:token'
  | '/verify-email' //this can be removed once Jobs has been migrated
  | '/magic-link' //this is not being used until MVP4
  | '/magic-link/email-sent' //this is not being used until MVP4
  | '/error'
  | '/404'
  | '/maintenance';

/**
 * These are all valid paths for the Identity API
 * New routes should be added below
 */
export type ApiRoutePaths =
  | '/pwd-reset/send-password-reset-email'
  | '/pwd-reset/user-for-token'
  | '/pwd-reset/reset-pwd-for-user'
  | '/user/validate-email/:token'
  | '/user/send-validation-email'
  | '/signin-token/token/:token'
  | '/auth/redirect'
  | '/auth'
  | '/consents'
  | '/user/me/consents'
  | '/users/me/consents'
  | '/users/me/newsletters'
  | '/user/me'
  | '/user/me/group/:groupCode'
  | '/user/type/:email'
  | '/guest'
  | '/newsletters'
  | '/user/send-account-verification-email'
  | '/user/send-account-exists-email'
  | '/user/send-account-without-password-exists-email'
  | '/user/send-create-password-account-exists-email';

export type OktaApiRoutePaths =
  | '/api/v1/authn'
  | '/api/v1/authn/credentials/reset_password'
  | '/api/v1/authn/recovery/password'
  | '/api/v1/users'
  | '/api/v1/users/:id'
  | '/api/v1/users/:id/lifecycle/activate'
  | '/api/v1/users/:id/lifecycle/reactivate';

export type PasswordRoutePath = Extract<
  '/reset-password' | '/set-password' | '/welcome',
  RoutePaths
>;

/**
 * This is all valid routes on the site, only used for the helper function addQueryParamsToPath
 */
export type AllRoutes = ApiRoutePaths | RoutePaths | OktaApiRoutePaths;
