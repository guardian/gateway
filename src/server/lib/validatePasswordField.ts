import { FieldError } from '@/shared/model/ClientState';
import { PasswordFieldErrors } from '@/shared/model/Errors';

export const validatePasswordField = (password: string): Array<FieldError> => {
  const errors: Array<FieldError> = [];

  if (!password || password.length < 8) {
    errors.push({
      field: 'password',
      message: PasswordFieldErrors.AT_LEAST_8,
    });
  } else if (password.length > 72) {
    errors.push({
      field: 'password',
      message: PasswordFieldErrors.MAXIMUM_72,
    });
  }

  return errors;
};
