import { PasswordFieldErrors } from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';

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
