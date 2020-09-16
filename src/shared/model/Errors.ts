export enum IdapiErrorMessages {
  NOT_FOUND = 'Not found',
  MISSING_FIELD = 'Required field missing',
  INVALID_TOKEN = 'Invalid token',
}

export enum ResetPasswordErrors {
  GENERIC = 'There was a problem resetting your password, please try again.',
  NO_ACCOUNT = 'There is no account for that email address, please check for typos or create an account.',
  NO_EMAIL = 'Email field must not be blank.',
}

export enum ChangePasswordErrors {
  GENERIC = 'There was a problem changing your password, please try again.',
  INVALID_TOKEN = 'The token that was supplied has expired, please try again.',
  PASSWORD_BLANK = 'Password field must not be blank',
  REPEAT_PASSWORD_BLANK = 'Repeat Password field must not be blank',
  PASSWORD_NO_MATCH = 'The passwords do not match, please try again',
  PASSWORD_LENGTH = 'Password must be between 6 and 72 characters',
}

export enum VerifyEmailErrors {
  GENERIC = 'There was problem verifying your email, please try again.',
}

export enum NewslettersErrors {
  GENERIC = 'There was a problem displaying newsletter options, please try again.',
}
