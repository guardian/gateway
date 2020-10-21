import { passwordValidation } from '@/shared/lib/PasswordValidation';

describe('password validation', () => {
  it('should pass with a valid password', () => {
    const result = passwordValidation('Abc123');
    expect(result).toStrictEqual({
      containsError: false,
      failedMessage: undefined,
      sixOrMore: true,
      lessThan72: true,
      upperAndLowercase: true,
      symbolOrNumber: true,
    });
  });

  it('should fail six or more constraint', () => {
    const result = passwordValidation('Abc12');
    expect(result).toStrictEqual({
      containsError: true,
      sixOrMore: false,
      lessThan72: true,
      upperAndLowercase: true,
      symbolOrNumber: true,
      failedMessage:
        "This password isn't valid. Please include at least 6 characters.",
    });
  });

  it('should fail less than 72 constraint', () => {
    const longPassword = `A1${'a'.repeat(71)}`;
    const result = passwordValidation(longPassword);
    expect(result).toStrictEqual({
      containsError: true,
      sixOrMore: true,
      lessThan72: false,
      upperAndLowercase: true,
      symbolOrNumber: true,
      failedMessage:
        "This password isn't valid. Please include up to 72 characters.",
    });
  });

  it('should fail upper and lowercase constraint', () => {
    const result = passwordValidation('abc123');

    expect(result).toStrictEqual({
      containsError: true,
      sixOrMore: true,
      lessThan72: true,
      upperAndLowercase: false,
      symbolOrNumber: true,
      failedMessage:
        "This password isn't valid. Please include a mixture of lower and upper case letters.",
    });
  });

  it('should fail symbol or number constraint', () => {
    const result = passwordValidation('Abcaaa');

    expect(result).toStrictEqual({
      containsError: true,
      sixOrMore: true,
      lessThan72: true,
      upperAndLowercase: true,
      symbolOrNumber: false,
      failedMessage:
        "This password isn't valid. Please include a symbol or a number.",
    });
  });

  it('should fail multiple constraints with a different error message', () => {
    const result = passwordValidation('abc12');

    expect(result).toStrictEqual({
      containsError: true,
      sixOrMore: false,
      lessThan72: true,
      upperAndLowercase: false,
      symbolOrNumber: true,
      failedMessage:
        "This password isn't valid. Please make sure it matches the required criteria.",
    });
  });
});
