export enum Metrics {
  SEND_MAGIC_LINK_SUCCESS = 'SendMagicLink::Success',
  SEND_MAGIC_LINK_FAILURE = 'SendMagicLink::Failure',
  SIGN_IN_SUCCESS = 'SignIn::Success',
  SIGN_IN_FAILURE = 'SignIn::Failure',
  REGISTER_SUCCESS = 'Register::Success',
  REGISTER_FAILURE = 'Register::Failure',
  CHANGE_PASSWORD_SUCCESS = 'UpdatePassword::Success',
  CHANGE_PASSWORD_FAILURE = 'UpdatePassword::Failure',
  LOGIN_MIDDLEWARE_SUCCESS = 'LoginMiddleware::Success',
  LOGIN_MIDDLEWARE_FAILURE = 'LoginMiddleware::Failure',
  LOGIN_MIDDLEWARE_UNVERIFIED = 'LoginMiddlewareUnverified',
  LOGIN_MIDDLEWARE_NOT_RECENT = 'LoginMiddlewareNotRecent',
  LOGIN_MIDDLEWARE_NOT_SIGNED_IN = 'LoginMiddlewareNotSignedIn',
  SEND_VALIDATION_EMAIL_SUCCESS = 'SendValidationEmail::Success',
  SEND_VALIDATION_EMAIL_FAILURE = 'SendValidationEmail::Failure',
  EMAIL_VALIDATED_SUCCESS = 'EmailValidated::Success',
  EMAIL_VALIDATED_FAILURE = 'EmailValidated::Failure',
  ACCOUNT_VERIFICATION_SUCCESS = 'AccountVerification::Success',
  ACCOUNT_VERIFICATION_FAILURE = 'AccountVerification::Failure',
}

export const consentsPageMetric = (
  page: string,
  getOrPost: 'Get' | 'Post',
  isSuccess: boolean,
) => {
  if (isSuccess) {
    return `${getOrPost}ConsentsPage-${page}::Success`;
  } else {
    return `${getOrPost}ConsentsPage-${page}::Failure`;
  }
};

export const emailSendMetric = (
  email:
    | 'AccountVerification'
    | 'AccountExists'
    | 'AccountExistsWithoutPassword'
    | 'CreatePassword'
    | 'ResetPassword',
  isSuccess: boolean,
) => {
  if (isSuccess) {
    return `${email}EmailSend::Success`;
  } else {
    return `${email}EmailSend::Failure`;
  }
};
