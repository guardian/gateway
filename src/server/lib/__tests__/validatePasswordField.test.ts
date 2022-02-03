import { validatePasswordField } from '@/server/lib/validatePasswordField';

describe('validatePasswordField', () => {
  test('should not return errors if the password is valid', () => {
    const password = 'passwordOfAnAppropriateLength';
    expect(validatePasswordField(password)).toBe(undefined);
  });

  test('should return an error if password is empty', () => {
    const blankPassword = '';
    expect(() => validatePasswordField(blankPassword)).toThrow(
      'Please make sure your password is at least 8 characters long.',
    );
  });

  test('should return an error if password is too short', () => {
    const shortPassword = 'short';
    expect(() => validatePasswordField(shortPassword)).toThrow(
      'Please make sure your password is at least 8 characters long.',
    );
  });

  test('should return an error if password is too long', () => {
    const longPassword =
      'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong';
    expect(() => validatePasswordField(longPassword)).toThrow(
      'Please make sure your password is not longer than 72 characters.',
    );
  });
});
