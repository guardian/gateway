export enum Routes {
  REGISTRATION = '/register',
  SIGN_IN = '/signin',
  SIGN_IN_CURRENT = '/signin/current',
  RESET = '/reset',
  RESET_SENT = '/reset/email-sent',
  RESEND = '/resend',
  CHANGE_PASSWORD = '/reset-password',
  CHANGE_PASSWORD_COMPLETE = '/password/reset-confirmation',
  VERIFY_EMAIL = '/verify-email',
  VERIFY_EMAIL_SENT = '/verify-email/email-sent',
  TOKEN_PARAM = '/:token',
  CONSENTS = '/consents',
  CONSENTS_DATA = '/data',
  CONSENTS_COMMUNICATION = '/communication',
  CONSENTS_NEWSLETTERS = '/newsletters',
  CONSENTS_REVIEW = '/review',
  // ABTEST: followupConsent : START
  CONSENTS_FOLLOW_UP_NEWSLETTERS = '/follow-up',
  CONSENTS_FOLLOW_UP_CONSENTS = '/follow-on',
  // ABTEST: followupConsent : END
  UNEXPECTED_ERROR = '/error',
  MAGIC_LINK = '/magic-link',
  MAGIC_LINK_SENT = '/magic-link/email-sent',
  WELCOME = '/welcome',
  WELCOME_SENT = '/welcome/email-sent',
}

export enum ApiRoutes {
  RESET_REQUEST_EMAIL = '/pwd-reset/send-password-reset-email',
  SIGN_IN = '/signin',
  CHANGE_PASSWORD_TOKEN_VALIDATION = '/pwd-reset/user-for-token',
  CHANGE_PASSWORD = '/pwd-reset/reset-pwd-for-user',
  VERIFY_EMAIL = '/user/validate-email',
  RESEND_VERIFY_EMAIL = '/user/send-validation-email',
}
