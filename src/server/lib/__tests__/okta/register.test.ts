import { register } from '@/server/lib/okta/register';
import { mocked } from 'jest-mock';
import {
  createUser,
  fetchUser,
  activateUser,
  reactivateUser,
} from '@/server/lib/okta/api/users';
import { User, Status } from '@/server/models/okta/User';
import { ErrorCause, ErrorCode, OktaError } from '@/server/models/okta/Error';

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
  getConfiguration: () => ({
    okta: {
      registrationEnabled: true,
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
const mockedCreateOktaUser =
  mocked<(email: string) => Promise<User>>(createUser);
const mockedFetchOktaUser = mocked<(id: string) => Promise<User>>(fetchUser);
const mockedActivateOktaUser =
  mocked<(id: string) => Promise<void>>(activateUser);
const mockedReactivateOktaUser =
  mocked<(id: string) => Promise<void>>(reactivateUser);

// mocked logger
jest.mock('@/server/lib/serverSideLogger');

const email = 'someemail';
const User = (status: Status) => {
  return {
    id: 'someuserid',
    status: status,
    profile: {
      login: email,
      isGuardianUser: true,
      email: email,
    },
  } as User;
};
const userExistsError = {
  message: 'Api validation failed: login',
  code: 'E0000001' as ErrorCode,
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

  test('should activate a STAGED user', async () => {
    const user = User(Status.STAGED);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedActivateOktaUser.mockReturnValueOnce(Promise.resolve());

    await expect(register(email)).resolves.toEqual(user);
  });

  test('should reactivate a PROVISIONED user', async () => {
    const user = User(Status.PROVISIONED);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));
    mockedReactivateOktaUser.mockReturnValueOnce(Promise.resolve());

    await expect(register(email)).resolves.toEqual(user);
  });

  test('should error for any other user status', async () => {
    const user = User(Status.ACTIVE);

    mockedCreateOktaUser.mockRejectedValueOnce(new OktaError(userExistsError));
    mockedFetchOktaUser.mockReturnValueOnce(Promise.resolve(user));

    await expect(register(email)).rejects.toThrow(OktaError);
  });
});
