export enum Routes {
  REGISTRATION = '/register',
  SIGN_IN = '/signin',
  RESET = '/reset',
  RESEND = '/resend',
  CHANGE_PASSWORD = '/reset-password',
  PASSWORD = '/password',
  RESET_CONFIRMATION = '/reset-confirmation',
  SET_PASSWORD = '/set-password',
  VERIFY_EMAIL = '/verify-email',
  TOKEN_PARAM = '/:token',
  CONSENTS = '/consents',
  CONSENTS_DATA = '/data',
  CONSENTS_COMMUNICATION = '/communication',
  CONSENTS_NEWSLETTERS = '/newsletters',
  CONSENTS_REVIEW = '/review',
  UNEXPECTED_ERROR = '/error',
  MAGIC_LINK = '/magic-link',
  WELCOME = '/welcome',
  EXPIRED = '/expired',
  EMAIL_SENT = '/email-sent',
  COMPLETE = '/complete',
}

export enum ApiRoutes {
  RESET_REQUEST_EMAIL = '/pwd-reset/send-password-reset-email',
  CHANGE_PASSWORD_TOKEN_VALIDATION = '/pwd-reset/user-for-token',
  CHANGE_PASSWORD = '/pwd-reset/reset-pwd-for-user',
  VERIFY_EMAIL = '/user/validate-email',
  RESEND_VERIFY_EMAIL = '/user/send-validation-email',
  DECRYPT_EMAIL_TOKEN = '/signin-token/token',
  AUTH = '/auth',
  REDIRECT = '/redirect',
  CONSENTS = '/consents',
  USER = '/user',
  USERS = '/users',
  ME = '/me',
  TYPE = '/type',
  GUEST = '/guest',
  NEWSLETTERS = '/newsletters',
  SEND_ACCOUNT_VERIFICATION_EMAIL = '/send-account-verification-email',
  SEND_ACCOUNT_EXISTS_EMAIL = '/send-account-exists-email',
  SEND_ACCOUNT_WITHOUT_PASSWORD_EXISTS_EMAIL = '/send-account-without-password-exists-email',
  SEND_CREATE_PASSWORD_ACCOUNT_EXISTS_EMAIL = '/send-create-password-account-exists-email',
  SEND_OKTA_ACTIVATION_EMAIL = '/send-okta-activation-email',
}
