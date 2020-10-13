export enum Metrics {
  SEND_PASSWORD_RESET_SUCCESS = 'SendPasswordReset::Success',
  SEND_PASSWORD_RESET_FAILURE = 'SendPasswordReset::Failure',
  CHANGE_PASSWORD_SUCCESS = 'UpdatePassword::Success',
  CHANGE_PASSWORD_FAILURE = 'UpdatePassword::Failure',
  LOGIN_MIDDLEWARE_SUCCESS = 'LoginMiddleware::Success',
  LOGIN_MIDDLEWARE_FAILURE = 'LoginMiddleware::Failure',
  LOGIN_MIDDLEWARE_UNVERIFIED = 'LoginMiddlewareUnverified',
  LOGIN_MIDDLEWARE_NOT_RECENT = 'LoginMiddlewareNotRecent',
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
