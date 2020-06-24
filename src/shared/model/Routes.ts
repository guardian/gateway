export enum Routes {
  RESET = '/reset',
  RESET_SENT = '/reset/email-sent',
  RESET_RESEND = '/reset/resend',
  CHANGE_PASSWORD = '/reset-password',
  CHANGE_PASSWORD_TOKEN = '/:token',
  CHANGE_PASSWORD_COMPLETE = '/password/reset-confirmation',
}

export enum ApiRoutes {
  RESET_REQUEST_EMAIL = '/pwd-reset/send-password-reset-email',
  CHANGE_PASSWORD_TOKEN_VALIDATION = '/pwd-reset/user-for-token',
  CHANGE_PASSWORD = '/pwd-reset/reset-pwd-for-user',
}
