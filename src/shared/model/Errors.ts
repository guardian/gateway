export enum IdapiErrorMessages {
  NOT_FOUND = 'Not found',
  MISSING_FIELD = 'Required field missing',
  INVALID_TOKEN = 'Invalid token',
  TOKEN_EXPIRED = 'Token expired',
  ACCESS_DENIED = 'Access Denied',
  INVALID_EMAIL_PASSWORD = 'Invalid email or password',
  USER_ALREADY_VALIDATED = 'User Already Validated',
  BREACHED_PASSWORD = 'Breached password',
  EMAIL_IN_USE = 'Email in use',
}

export enum ResetPasswordErrors {
  GENERIC = 'There was a problem resetting your password, please try again.',
  NO_ACCOUNT = 'There is no account for that email address, please check for typos or create an account.',
  NO_EMAIL = 'Email field must not be blank.',
}

export enum SignInErrors {
  GENERIC = 'There was a problem signing in, please try again.',
  AUTHENTICATION_FAILED = 'This email and password combination is not valid.',
}

export enum RegistrationErrors {
  GENERIC = 'There was a problem registering, please try again.',
}

export enum ChangePasswordErrors {
  GENERIC = 'There was a problem changing your password, please try again.',
  INVALID_TOKEN = 'The token that was supplied has expired, please try again.',
  PASSWORD_BLANK = 'Password field must not be blank',
  PASSWORD_NO_MATCH = 'The passwords do not match, please try again',
  PASSWORD_LENGTH = 'Password must be between 8 and 72 characters',

  AT_LEAST_8 = 'Please make sure your password is at least 8 characters long.',
  MAXIMUM_72 = 'Please make sure your password is not longer than 72 characters.',
  COMMON_PASSWORD = 'This is a common password. Please use a password that is hard to guess.',
  PASSWORDS_NOT_MATCH = 'Passwords don’t match',
  PASSWORDS_MATCH = 'Passwords match',

  AT_LEAST_8_SHORT = 'At least 8 characters',
  MAXIMUM_72_SHORT = 'Maximum of 72 characters',
  COMMON_PASSWORD_SHORT = 'this is a common password. Please use a password that is hard to guess.',
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

export enum CsrfErrors {
  CSRF_ERROR = 'Sorry, something went wrong. If you made any changes these might have not been saved. Please try again.',
}
