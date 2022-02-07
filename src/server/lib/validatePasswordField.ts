import {
  ChangePasswordErrors,
  PasswordFieldErrors,
} from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { ErrorCause, OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';

export const validatePasswordField = (password: string): void => {
  if (!password || password.length < 8) {
    throw new ApiError({
      message: PasswordFieldErrors.AT_LEAST_8,
      status: 422,
      field: 'password',
    });
  } else if (password.length > 72) {
    throw new ApiError({
      message: PasswordFieldErrors.MAXIMUM_72,
      status: 422,
      field: 'password',
    });
  }
};

export const validatePasswordFieldForOkta = (password: string): void => {
  if (!password || password.length < 8) {
    throw new OktaError({
      message:
        'The password does not meet the complexity requirements of the current password policy.',
      code: 'E0000080',
      causes: [
        {
          errorSummary:
            'Password requirements were not met. Password requirements: at least 8 characters.',
        },
      ],
    });
  } else if (password.length > 72) {
    throw new OktaError({
      message:
        'The password does not meet the complexity requirements of the current password policy.',
      code: 'E0000080',
      causes: [
        {
          errorSummary:
            'Password requirements were not met. Password requirements: maximum 72 characters.',
        },
      ],
    });
  }
};

export const getErrorMessage = (error: OktaError) => {
  const fieldErrorMessage = (causes: Array<ErrorCause>) => {
    if (causesInclude(causes, 'Password requirements: at least')) {
      return PasswordFieldErrors.AT_LEAST_8;
    } else if (causesInclude(causes, 'Password requirements: maximum')) {
      return PasswordFieldErrors.MAXIMUM_72;
    } else if (causesInclude(causes, 'cannot be your current password')) {
      return PasswordFieldErrors.SAME_PASSWORD;
    } else {
      return 'Please use a password that is hard to guess.';
    }
  };

  if (error.name === 'PasswordPolicyViolationError') {
    return {
      fieldErrors: [
        {
          field: 'password',
          message: fieldErrorMessage(error.causes),
        },
      ],
    };
  } else {
    return {
      globalError: ChangePasswordErrors.GENERIC,
    };
  }
};
