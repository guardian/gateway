import { validatePasswordField } from '@/server/lib/validatePasswordField';

describe('validatePasswordField', () => {
  test('should not return errors if the password is valid', () => {
    const password = 'passwordOfAnAppropriateLength';

    const output = validatePasswordField(password);

    expect(output).toEqual([]);
  });

  test('should return an error if password is empty', () => {
    const password = '';

    const output = validatePasswordField(password);

    expect(output).toEqual([
      {
        field: 'password',
        message:
          'Please make sure your password is at least 8 characters long.',
      },
    ]);
  });

  test('should return an error if password is too short', () => {
    const password = 'short';

    const output = validatePasswordField(password);

    expect(output).toEqual([
      {
        field: 'password',
        message:
          'Please make sure your password is at least 8 characters long.',
      },
    ]);
  });

  test('should return an error if password is too long', () => {
    const password =
      'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong';

    const output = validatePasswordField(password);

    expect(output).toEqual([
      {
        field: 'password',
        message:
          'Please make sure your password is not longer than 72 characters.',
      },
    ]);
  });
});
