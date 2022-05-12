import { register } from '@/server/lib/okta/register';
import { mocked } from 'jest-mock';
import {
  createUser,
  getUser,
  activateUser,
  reactivateUser,
  generateResetPasswordToken,
} from '@/server/lib/okta/api/users';
import {
  UserResponse,
  Status,
  UserCreationRequest,
  TokenResponse,
} from '@/server/models/okta/User';
import { sendAccountExistsEmail } from '@/email/templates/AccountExists/sendAccountExistsEmail';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';
import { ErrorCause, OktaError } from '@/server/models/okta/Error';

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
    },
  }),
}));

// mocked Okta Users API
jest.mock('@/server/lib/okta/api/users');
jest.mock('@/email/templates/AccountExists/sendAccountExistsEmail');
jest.mock('@/email/templates/ResetPassword/sendResetPasswordEmail');
const mockedCreateOktaUser =
  mocked<(body: UserCreationRequest) => Promise<UserResponse>>(createUser);
const mockedFetchOktaUser =
  mocked<(id: string) => Promise<UserResponse>>(getUser);
const mockedActivateOktaUser =
  mocked<(id: string, sendEmail: boolean) => Promise<TokenResponse | void>>(
    activateUser,
  );
const mockedReactivateOktaUser =
  mocked<(id: string, sendEmail: boolean) => Promise<TokenResponse | void>>(
    reactivateUser,
  );
const mockedGenerateResetPasswordToken = mocked<
  (id: string, sendEmail: boolean) => Promise<TokenResponse | void>
>(generateResetPasswordToken);
const mockedSendAccountExistsEmail = mocked<
  (params: { to: string; activationToken: string }) => Promise<boolean>
>(sendAccountExistsEmail);
const mockedSendResetPasswordEmail = mocked<
  (params: { to: string; resetPasswordToken: string }) => Promise<boolean>
>(sendResetPasswordEmail);

// mocked logger
jest.mock('@/server/lib/serverSideLogger');

const email = 'someemail';
const User = (status: Status): UserResponse => {
  return {
    id: 'someuserid',
    status: status,
    profile: {
      login: email,
      isGuardianUser: true,
      email: email,
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

describe('okta#register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user', async () => {
    const user = User(Status.PROVISIONED);

    mockedCreateOktaUser.mockReturnValueOnce(Promise.resolve(user));
    const result = await register(email);
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
    mockedSendAccountExistsEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register(email)).resolves.toEqual(user);
    expect(mockedActivateOktaUser).toHaveBeenCalled();
    expect(mockedSendAccountExistsEmail).toHaveBeenCalled();
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
    mockedSendAccountExistsEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register(email)).resolves.toEqual(user);
    expect(mockedReactivateOktaUser).toHaveBeenCalled();
    expect(mockedSendAccountExistsEmail).toHaveBeenCalled();
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
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedSendAccountExistsEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register(email)).resolves.toEqual(user);
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
    mockedGenerateResetPasswordToken.mockReturnValueOnce(
      Promise.resolve({ token: 'sometoken' } as TokenResponse),
    );
    mockedSendResetPasswordEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register(email)).resolves.toEqual(user);
    expect(mockedGenerateResetPasswordToken).toHaveBeenCalled();
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
    mockedGenerateResetPasswordToken.mockReturnValueOnce(
      Promise.resolve({ token: 'sometoken' } as TokenResponse),
    );
    mockedSendResetPasswordEmail.mockReturnValueOnce(Promise.resolve(true));

    await expect(register(email)).resolves.toEqual(user);
    expect(mockedGenerateResetPasswordToken).toHaveBeenCalled();
    expect(mockedSendResetPasswordEmail).toHaveBeenCalled();
    // Make sure the function from the other branch of the switch isn't called
    expect(mockedActivateOktaUser).not.toHaveBeenCalled();
    expect(mockedReactivateOktaUser).not.toHaveBeenCalled();
  });

  test('should error for any other user status', async () => {
    const user = User(Status.SUSPENDED);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));

    await expect(register(email)).rejects.toThrow(OktaError);
    expect(mockedActivateOktaUser).not.toHaveBeenCalled();
    expect(mockedReactivateOktaUser).not.toHaveBeenCalled();
  });
});
