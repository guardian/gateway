import { passwordValidation } from '@/shared/lib/PasswordValidation';

describe('password validation', () => {
  it('should fail six or more constraint', () => {
    const result = passwordValidation('Abc12', 'Abc12');
    expect(result).toStrictEqual({
      sixOrMore: false,
      lessThan72: true,
      upperAndLowercase: true,
      symbolOrNumber: true,
      matching: true,
      failedMessage:
        "This password isn't valid. Please include at least 6 characters.",
    });
  });

  it('should fail less than 72 constraint', () => {
    const longPassword = `A1${'a'.repeat(71)}`;
    const result = passwordValidation(longPassword, longPassword);
    expect(result).toStrictEqual({
      sixOrMore: true,
      lessThan72: false,
      upperAndLowercase: true,
      symbolOrNumber: true,
      matching: true,
      failedMessage:
        "This password isn't valid. Please include up to 72 characters.",
    });
  });

  it('should fail upper and lowercase constraint', () => {
    const result = passwordValidation('abc123', 'abc123');

    expect(result).toStrictEqual({
      sixOrMore: true,
      lessThan72: true,
      upperAndLowercase: false,
      symbolOrNumber: true,
      matching: true,
      failedMessage:
        "This password isn't valid. Please include a mixture of lower and upper case letters.",
    });
  });

  it('should fail symbol or number constraint', () => {
    const result = passwordValidation('Abcaaa', 'Abcaaa');

    expect(result).toStrictEqual({
      sixOrMore: true,
      lessThan72: true,
      upperAndLowercase: true,
      symbolOrNumber: false,
      matching: true,
      failedMessage:
        "This password isn't valid. Please include a symbol or a number.",
    });
  });

  it('should fail matching constraint', () => {
    const result = passwordValidation('Abc123', 'Abc1234');

    expect(result).toStrictEqual({
      sixOrMore: true,
      lessThan72: true,
      upperAndLowercase: true,
      symbolOrNumber: true,
      matching: false,
      failedMessage:
        "This password isn't valid. Please include a matching repeated password.",
    });
  });

  it('should fail multiple constraints with a different error message', () => {
    const result = passwordValidation('abc12', 'Abc1234');

    expect(result).toStrictEqual({
      sixOrMore: false,
      lessThan72: true,
      upperAndLowercase: false,
      symbolOrNumber: true,
      matching: false,
      failedMessage:
        "This password isn't valid. Please make sure it matches the required criteria.",
    });
  });
});
