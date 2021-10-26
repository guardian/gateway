export const GUEST_ENDPOINT = '/guest';

export const GUEST_ERRORS = {
  GENERIC: 'There was a problem registering, please try again.',
  EMAIL_INVALID: 'Please enter a valid email address.',
};

export const invalidEmailAddress = {
  status: 'error',
  errors: [
    {
      message: 'Invalid emailAddress:',
      description: 'Please enter a valid email address',
      context: 'user.primaryEmailAddress',
    },
  ],
};

export const emailAddressInUse = {
  status: 'error',
  errors: [
    {
      message: 'Email in use',
      description: 'This email has already been taken',
      context: 'user.primaryEmailAddress',
    },
  ],
};
