export enum Metrics {
  SEND_PASSWORD_RESET_SUCCESS = 'SendPasswordReset::Success',
  SEND_PASSWORD_RESET_FAILURE = 'SendPasswordReset::Failure',
  AUTHENTICATION_SUCCESS = 'Authentication::Success',
  AUTHENTICATION_FAILURE = 'Authentication::Failure',
  AUTHORIZATION_SUCCESS = 'Authorization::Success',
  AUTHORIZATION_FAILURE = 'Authorization::Failure',
  AUTHORIZATION_ERROR = 'Authorization::Error',
  SEND_MAGIC_LINK_SUCCESS = 'SendMagicLink::Success',
  SEND_MAGIC_LINK_FAILURE = 'SendMagicLink::Failure',
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
