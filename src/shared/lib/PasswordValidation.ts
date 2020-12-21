import { ChangePasswordErrors } from '@/shared/model/Errors';

export enum PasswordValidationResult {
  AT_LEAST_8,
  MAXIMUM_72,
  COMMON_PASSWORD,
  VALID_PASSWORD,
}

export type LengthValidationResult =
  | PasswordValidationResult.AT_LEAST_8
  | PasswordValidationResult.MAXIMUM_72;

export type ErrorValidationResult =
  | LengthValidationResult
  | PasswordValidationResult.COMMON_PASSWORD;

export const PasswordValidationShortMessage = {
  [PasswordValidationResult.AT_LEAST_8]: ChangePasswordErrors.AT_LEAST_8_SHORT,
  [PasswordValidationResult.MAXIMUM_72]: ChangePasswordErrors.MAXIMUM_72_SHORT,
  [PasswordValidationResult.COMMON_PASSWORD]:
    ChangePasswordErrors.COMMON_PASSWORD_SHORT,
};

export const PasswordValidationLongMessage = {
  [PasswordValidationResult.AT_LEAST_8]: ChangePasswordErrors.AT_LEAST_8,
  [PasswordValidationResult.MAXIMUM_72]: ChangePasswordErrors.MAXIMUM_72,
  [PasswordValidationResult.COMMON_PASSWORD]:
    ChangePasswordErrors.COMMON_PASSWORD,
};

export const validatePasswordLength = (
  password: string,
): LengthValidationResult | PasswordValidationResult.VALID_PASSWORD => {
  if (password.length < 8) {
    return PasswordValidationResult.AT_LEAST_8;
  }

  if (password.length > 72) {
    return PasswordValidationResult.MAXIMUM_72;
  }

  return PasswordValidationResult.VALID_PASSWORD;
};
