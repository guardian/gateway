import { register } from '@/server/lib/okta/register';
import { mocked } from 'jest-mock';
import {
  createUser,
  getUser,
  activateUser,
  reactivateUser,
  dangerouslyResetPassword,
  getUserGroups,
} from '@/server/lib/okta/api/users';
import {
  UserResponse,
  Status,
  UserCreationRequest,
  TokenResponse,
  RegistrationLocation,
} from '@/server/models/okta/User';
import {
  validateRecoveryToken,
  resetPassword,
} from '@/server/lib/okta/api/authentication';
import { sendAccountExistsEmail } from '@/email/templates/AccountExists/sendAccountExistsEmail';
import { sendAccountWithoutPasswordExistsEmail } from '@/email/templates/AccountWithoutPasswordExists/sendAccountWithoutPasswordExists';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';
import { sendCompleteRegistration } from '@/email/templates/CompleteRegistration/sendCompleteRegistration';
import { ErrorCause, OktaError } from '@/server/models/okta/Error';
import { Group } from '@/server/models/okta/Group';
import { sendEmailToUnvalidatedUser } from '@/server/lib/unvalidatedEmail';
import { AuthenticationTransaction } from '@/server/models/okta/Authentication';

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
  getConfiguration: () => ({
    okta: {
      enabled: true,
      orgUrl: 'someOrgUrl',
      token: 'token',
      authServerId: 'authServerId',
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      groupIds: {
        GuardianUserAll: 'okta-guardian-users-group-id',
      },
    },
    aws: {
      instanceId: 'instanceId',
      kinesisStreamName: 'kinesisStreamName',
    },
  }),
}));

// mocked Okta Users API
jest.mock('@/server/lib/okta/api/users');
jest.mock('@/server/lib/okta/api/authentication');
jest.mock('@/email/templates/AccountExists/sendAccountExistsEmail');
jest.mock(
  '@/email/templates/AccountWithoutPasswordExists/sendAccountWithoutPasswordExists',
);
jest.mock('@/email/templates/ResetPassword/sendResetPasswordEmail');
jest.mock(
  '@/email/templates/UnvalidatedEmailResetPassword/sendUnvalidatedEmailResetPasswordEmail',
);
jest.mock('@/email/templates/CompleteRegistration/sendCompleteRegistration');
jest.mock('@/server/lib/unvalidatedEmail');

const mockedCreateOktaUser =
  mocked<(body: UserCreationRequest, ip: string) => Promise<UserResponse>>(
    createUser,
  );
const mockedFetchOktaUser =
  mocked<(id: string, ip: string) => Promise<UserResponse>>(getUser);
const mockedActivateOktaUser =
  mocked<
    (params: {
      id: string;
      sendEmail: boolean;
      ip: string;
    }) => Promise<TokenResponse | void>
  >(activateUser);
const mockedReactivateOktaUser =
  mocked<
    (params: {
      id: string;
      sendEmail: boolean;
      ip: string;
    }) => Promise<TokenResponse | void>
  >(reactivateUser);
const mockedDangerouslyResetPassword = mocked<
  (id: string, ip: string) => Promise<string | void>
>(dangerouslyResetPassword);
const mockedGetUserGroups =
  mocked<(id: string, ip: string) => Promise<Group[]>>(getUserGroups);
const mockedValidateRecoveryToken = mocked<
  (body: {
    recoveryToken: string;
    ip: string;
  }) => Promise<AuthenticationTransaction>
>(validateRecoveryToken);
const mockedResetPassword = mocked<
  (
    body: {
      stateToken: string;
      newPassword: string;
    },
    ip: string,
  ) => Promise<AuthenticationTransaction>
>(resetPassword);
const mockedSendAccountExistsEmail = mocked<
  (params: { to: string; activationToken: string }) => Promise<boolean>
>(sendAccountExistsEmail);
const mockedSendAccountWithoutPasswordExistsEmail = mocked<
  (params: { to: string; activationToken: string }) => Promise<boolean>
>(sendAccountWithoutPasswordExistsEmail);
const mockedSendResetPasswordEmail = mocked<
  (params: { to: string; resetPasswordToken: string }) => Promise<boolean>
>(sendResetPasswordEmail);
const mockedSendEmailToUnvalidatedUser = mocked<
  (params: {
    id: string;
    email: string;
    appClientId: string;
    request_id: string;
    ip: string;
  }) => Promise<void>
>(sendEmailToUnvalidatedUser);
const mockedSendCompleteRegistration = mocked<
  (params: { to: string; activationToken: string }) => Promise<boolean>
>(sendCompleteRegistration);

// mocked logger
jest.mock('@/server/lib/serverSideLogger');
// mocked trackMetric
jest.mock('@/server/lib/trackMetric', () => ({
  trackMetric: jest.fn(),
}));

const email = 'someemail';
const User = (
  status: Status,
  hasPassword = true,
  registrationLocation: RegistrationLocation | undefined = undefined,
): UserResponse => {
  return {
    id: 'someuserid',
    status: status,
    profile: {
      login: email,
      isGuardianUser: true,
      email: email,
      registrationLocation: registrationLocation,
    },
    credentials: {
      password: hasPassword ? {} : undefined,
      provider: {},
    },
  };
};
const userExistsError = {
  message: 'Api validation failed: login',
  code: 'E0000001',
  causes: [
    {
      errorSummary:
        'login: An object with this field already exists in the current organization',
    } as ErrorCause,
  ],
};

const existingUserGroups: Group[] = [
  {
    id: 'group-id-1',
    profile: {
      name: 'Everyone',
      description: 'All users in your organization',
    },
  },
  {
    id: 'group-id-2',
    profile: { name: 'GuardianUser-All', description: '' },
  },
  {
    id: 'group-id-2',
    profile: { name: 'GuardianUser-EmailValidated', description: '' },
  },
];

const existingUnvalidatedUserGroups: Group[] = existingUserGroups.filter(
  (group) => group.profile.name !== 'GuardianUser-EmailValidated',
);

describe('okta#register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user', async () => {
    const user = User(Status.PROVISIONED);

    mockedCreateOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedActivateOktaUser.mockReturnValueOnce(
      Promise.resolve({ token: 'sometoken' } as TokenResponse),
    );
    mockedSendCompleteRegistration.mockReturnValueOnce(Promise.resolve(true));
    const result = await register({ email, ip: '127.0.0.1' });
    expect(result).toEqual(user);
  });

  test('should register a new user with registration location', async () => {
    const user = User(Status.PROVISIONED, true, 'United Kingdom');

    mockedCreateOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedActivateOktaUser.mockReturnValueOnce(
      Promise.resolve({ token: 'sometoken' } as TokenResponse),
    );
    mockedSendCompleteRegistration.mockReturnValueOnce(Promise.resolve(true));
    const result = await register({
      email,
      registrationLocation: 'United Kingdom',
      ip: '127.0.0.1',
    });
    expect(result).toEqual(user);
  });

  test('should send an activation email to a STAGED user', async () => {
    /* Given I'm a STAGED user
     *    When I try to register
     *    Then Gateway should ask Okta for my activation token
     *    And I should be sent a set password email with the activation
     *    token through Gateway
     *    And my status should become PROVISIONED
     */
    const user = User(Status.STAGED);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedActivateOktaUser.mockReturnValueOnce(
      Promise.resolve({ token: 'sometoken' } as TokenResponse),
    );
    mockedSendAccountWithoutPasswordExistsEmail.mockReturnValueOnce(
      Promise.resolve(true),
    );

    await expect(register({ email, ip: '127.0.0.1' })).resolves.toEqual(user);
    expect(mockedActivateOktaUser).toHaveBeenCalled();
    expect(mockedSendAccountWithoutPasswordExistsEmail).toHaveBeenCalled();
    // Make sure the function from the other branch of the switch isn't called
    expect(mockedReactivateOktaUser).not.toHaveBeenCalled();
  });

  test('should send a reactivation email to a PROVISIONED user', async () => {
    /* Given I'm a PROVISIONED user
     *    When I try to register
     *    Then Gateway should ask Okta for my activation token
     *    And I should be sent a set password email with the activation
     *    token through Gateway
     *    And my status should remain PROVISIONED
     */
    const user = User(Status.PROVISIONED);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedReactivateOktaUser.mockReturnValueOnce(
      Promise.resolve({ token: 'sometoken' } as TokenResponse),
    );
    mockedSendAccountWithoutPasswordExistsEmail.mockReturnValueOnce(
      Promise.resolve(true),
    );

    await expect(register({ email, ip: '127.0.0.1' })).resolves.toEqual(user);
    expect(mockedReactivateOktaUser).toHaveBeenCalled();
    expect(mockedSendAccountWithoutPasswordExistsEmail).toHaveBeenCalled();
    // Make sure the function from the other branch of the switch isn't called
    expect(mockedActivateOktaUser).not.toHaveBeenCalled();
  });

  test('should send an activation email to an ACTIVE user', async () => {
    /* Given I'm an ACTIVE user
     *    When I try to register
     *    Then I should be sent an email with a link to the reset
     *    password form (with no token)
     *    And my status should remain ACTIVE
     */
    const user = User(Status.ACTIVE);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedGetUserGroups.mockReturnValueOnce(
      Promise.resolve(existingUserGroups),
    );
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedSendAccountExistsEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register({ email, ip: '127.0.0.1' })).resolves.toEqual(user);
    expect(mockedSendAccountExistsEmail).toHaveBeenCalled();
    // Make sure the function from the other branch of the switch isn't called
    expect(mockedActivateOktaUser).not.toHaveBeenCalled();
    expect(mockedReactivateOktaUser).not.toHaveBeenCalled();
  });

  test('should send a reset password email to a RECOVERY user', async () => {
    /* Given I'm a RECOVERY or PASSWORD_EXPIRED user
     *    When I try to register
     *    Then Gateway should ask Okta for my reset password token
     *    And I should be sent a reset password email with the activation
     *    token through Gateway
     *    And my status should become RECOVERY
     */
    const user = User(Status.RECOVERY);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedDangerouslyResetPassword.mockReturnValueOnce(
      Promise.resolve('sometoken'),
    );
    mockedSendResetPasswordEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register({ email, ip: '127.0.0.1' })).resolves.toEqual(user);
    expect(mockedDangerouslyResetPassword).toHaveBeenCalled();
    expect(mockedSendResetPasswordEmail).toHaveBeenCalled();
    // Make sure the function from the other branch of the switch isn't called
    expect(mockedActivateOktaUser).not.toHaveBeenCalled();
    expect(mockedReactivateOktaUser).not.toHaveBeenCalled();
  });

  test('should send a reset password email to a PASSWORD_EXPIRED user', async () => {
    /* Given I'm a RECOVERY or PASSWORD_EXPIRED user
     *    When I try to register
     *    Then Gateway should ask Okta for my reset password token
     *    And I should be sent a reset password email with the activation
     *    token through Gateway
     *    And my status should become RECOVERY
     */
    const user = User(Status.PASSWORD_EXPIRED);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedDangerouslyResetPassword.mockReturnValueOnce(
      Promise.resolve('sometoken'),
    );
    mockedSendResetPasswordEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register({ email, ip: '127.0.0.1' })).resolves.toEqual(user);
    expect(mockedDangerouslyResetPassword).toHaveBeenCalled();
    expect(mockedSendResetPasswordEmail).toHaveBeenCalled();
    // Make sure the function from the other branch of the switch isn't called
    expect(mockedActivateOktaUser).not.toHaveBeenCalled();
    expect(mockedReactivateOktaUser).not.toHaveBeenCalled();
  });

  test('should error for any other user status', async () => {
    const user = User(Status.SUSPENDED);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));

    await expect(register({ email, ip: '127.0.0.1' })).rejects.toThrow(
      OktaError,
    );
    expect(mockedActivateOktaUser).not.toHaveBeenCalled();
    expect(mockedReactivateOktaUser).not.toHaveBeenCalled();
  });

  test('should send an unvalidated user email to an unvalidated user with a password set', async () => {
    const user = User(Status.ACTIVE);
    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedGetUserGroups.mockReturnValueOnce(
      Promise.resolve(existingUnvalidatedUserGroups),
    );
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedSendEmailToUnvalidatedUser.mockReturnValueOnce(Promise.resolve());

    await expect(register({ email, ip: '127.0.0.1' })).resolves.toEqual(user);
    expect(mockedResetPassword).not.toHaveBeenCalled();
    expect(mockedSendEmailToUnvalidatedUser).toHaveBeenCalled();
  });
  test('should dangerously set password, create a new password, and then send a unvalidated user email to an unvalidated user without a password set', async () => {
    const user = User(Status.ACTIVE, false);
    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedGetUserGroups.mockReturnValueOnce(
      Promise.resolve(existingUnvalidatedUserGroups),
    );
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedSendEmailToUnvalidatedUser.mockReturnValueOnce(Promise.resolve());
    mockedDangerouslyResetPassword.mockReturnValueOnce(
      Promise.resolve('sometoken'),
    );
    mockedValidateRecoveryToken.mockReturnValueOnce(
      Promise.resolve({ stateToken: 'sometoken' }),
    );

    await expect(register({ email, ip: '127.0.0.1' })).resolves.toEqual(user);
    expect(dangerouslyResetPassword).toHaveBeenCalled();
    expect(mockedResetPassword).toHaveBeenCalled();
    expect(mockedSendEmailToUnvalidatedUser).toHaveBeenCalled();
  });
});
