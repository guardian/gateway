export enum IdapiErrorMessages {
  NOT_FOUND = 'Not found',
  MISSING_FIELD = 'Required field missing',
  INVALID_TOKEN = 'Invalid token',
  TOKEN_EXPIRED = 'Token expired',
  ACCESS_DENIED = 'Access Denied',
  USER_ALREADY_VALIDATED = 'User Already Validated',
}

export enum ResetPasswordErrors {
  GENERIC = 'There was a problem resetting your password, please try again.',
  NO_ACCOUNT = 'There is no account for that email address, please check for typos or create an account.',
  NO_EMAIL = 'Email field must not be blank.',
}

export enum ChangePasswordErrors {
  GENERIC = 'There was a problem changing your password, please try again.',
  INVALID_TOKEN = 'The token that was supplied has expired, please try again.',
}

export enum VerifyEmailErrors {
  GENERIC = 'There was problem verifying your email, please try again.',
  TOKEN_EXPIRED = 'The activation token is no longer valid.',
  INVALID_TOKEN = 'The token you supplied could not be parsed.',
  USER_ALREADY_VALIDATED = 'This user account has already been validated',
}

export enum NewslettersErrors {
  GENERIC = 'There was a problem displaying newsletter options, please try again.',
}

export enum ConsentsErrors {
  GENERIC = 'There was a problem saving your choice, please try again.',
  USER = 'There was a problem retrieving your details, please try again.',
  ACCESS_DENIED = 'Access Denied',
}
