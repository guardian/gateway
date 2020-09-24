export enum Routes {
  RESET = '/reset',
  RESET_SENT = '/reset/email-sent',
  RESET_RESEND = '/reset/resend',
  CHANGE_PASSWORD = '/reset-password',
  CHANGE_PASSWORD_TOKEN = '/:token',
  CHANGE_PASSWORD_COMPLETE = '/password/reset-confirmation',
  VERIFY_EMAIL = '/verify-email',
  VERIFY_EMAIL_TOKEN = '/:token',
  CONSENTS = '/consents',
  CONSENTS_DATA = '/data',
  CONSENTS_COMMUNICATION = '/communication',
  CONSENTS_NEWSLETTERS = '/newsletters',
  CONSENTS_REVIEW = '/review',
}

export enum ApiRoutes {
  RESET_REQUEST_EMAIL = '/pwd-reset/send-password-reset-email',
  CHANGE_PASSWORD_TOKEN_VALIDATION = '/pwd-reset/user-for-token',
  CHANGE_PASSWORD = '/pwd-reset/reset-pwd-for-user',
  VERIFY_EMAIL = '/user/validate-email',
}
