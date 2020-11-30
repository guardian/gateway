/// <reference types="cypress" />

export const validationTokenExpired = {
  error: {
    status: 'error',
    errors: [
      {
        message: 'Token expired',
        description: 'The activation token is no longer valid',
      },
    ],
  },
  status: 403,
  level: 'error',
};

export const validationTokenInvalid = {
  error: {
    status: 'error',
    errors: [
      {
        message: 'Invalid token',
        description: 'The token you supplied could not be parsed',
      },
    ],
  },
  status: 403,
  level: 'error',
};
