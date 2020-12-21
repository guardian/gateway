import {
  PasswordValidationResult,
  validatePasswordLength,
} from '@/shared/lib/PasswordValidation';

describe('validatePasswordLength', () => {
  test('it validates a password is beneath 8 characters', () => {
    expect(validatePasswordLength('')).toEqual(
      PasswordValidationResult.AT_LEAST_8,
    );
    expect(validatePasswordLength('1')).toEqual(
      PasswordValidationResult.AT_LEAST_8,
    );
    expect(validatePasswordLength('1234567')).toEqual(
      PasswordValidationResult.AT_LEAST_8,
    );
    expect(validatePasswordLength('12345678')).toEqual(
      PasswordValidationResult.VALID_PASSWORD,
    );
  });

  test('it validates a password is above 72 characters', () => {
    expect(validatePasswordLength('1'.repeat(73))).toEqual(
      PasswordValidationResult.MAXIMUM_72,
    );
    expect(validatePasswordLength('1'.repeat(74))).toEqual(
      PasswordValidationResult.MAXIMUM_72,
    );
    expect(validatePasswordLength('1'.repeat(72))).toEqual(
      PasswordValidationResult.VALID_PASSWORD,
    );
  });
});
