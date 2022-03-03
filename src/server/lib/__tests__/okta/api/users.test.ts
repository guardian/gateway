import { mocked } from 'jest-mock';
import { fetch } from '@/server/lib/fetch';
import type { Response, RequestInfo, RequestInit } from 'node-fetch';
import {
  activateUser,
  clearUserSessions,
  createUser,
  getUser,
  reactivateUser,
} from '@/server/lib/okta/api/users';
import { OktaError } from '@/server/models/okta/Error';
import { UserCreationRequest } from '@/server/models/okta/User';

const userId = '12345';
const email = 'test@test.com';

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

// mocked fetch
jest.mock('@/server/lib/fetch');
const mockedFetch =
  mocked<(url: RequestInfo, init?: RequestInit) => Partial<Promise<Response>>>(
    fetch,
  );
/* eslint-disable @typescript-eslint/no-explicit-any */
const json = jest.fn() as jest.MockedFunction<any>;

// mocked logger
jest.mock('@/server/lib/serverSideLogger');

const userCreationRequest = (email: string): UserCreationRequest => {
  return {
    profile: {
      email,
      login: email,
      isGuardianUser: true,
      registrationPlatform: 'identity-gateway',
    },
  };
};

describe('okta#createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new user', async () => {
    const user = {
      id: userId,
      status: 'PROVISIONED',
      profile: { email: email, login: email, isGuardianUser: true },
    };

    json.mockResolvedValueOnce(user);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: true, json } as Response),
    );

    const response = await createUser(userCreationRequest(email));
    expect(response).toEqual(user);
  });

  test('should throw an error if user already exists', async () => {
    const userAlreadyExists = {
      errorCode: 'E0000001',
      errorSummary: 'Api validation failed: login',
      errorLink: 'E0000001',
      errorId: '123456',
      errorCauses: [
        {
          errorSummary:
            'login: An object with this field already exists in the current organization',
        },
      ],
    };

    json.mockResolvedValueOnce(userAlreadyExists);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 400, json } as Response),
    );

    await expect(createUser(userCreationRequest(userId))).rejects.toThrowError(
      new OktaError({ message: 'Api validation failed: login' }),
    );
  });

  test('should throw an error if email address is invalid', async () => {
    const causes = [
      {
        errorSummary: 'login: Username must be in the form of an email address',
      },
      {
        errorSummary: 'email: Does not match required pattern',
      },
    ];

    const emailAddressInvalid = {
      errorCode: 'E0000001',
      errorSummary: 'Api validation failed: login',
      errorLink: 'E0000001',
      errorId: '123456',
      errorCauses: causes,
    };

    json.mockResolvedValueOnce(emailAddressInvalid);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 400, json } as Response),
    );

    await expect(createUser(userCreationRequest(userId))).rejects.toThrowError(
      new OktaError({ message: 'Api validation failed: login', causes }),
    );
  });

  test('should throw an error if required field is missing', async () => {
    const causes = [
      {
        errorSummary: 'login: The field cannot be left blank',
      },
    ];
    const emailAddressMissing = {
      errorCode: 'E0000001',
      errorSummary: 'Api validation failed: login',
      errorLink: 'E0000001',
      errorId: '123456',
      errorCauses: causes,
    };

    json.mockResolvedValueOnce(emailAddressMissing);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 400, json } as Response),
    );

    await expect(createUser(userCreationRequest(userId))).rejects.toThrowError(
      new OktaError({ message: 'Api validation failed: login', causes }),
    );
  });
});

describe('okta#fetchUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return a user', async () => {
    const user = {
      id: userId,
      status: 'ACTIVE',
      profile: { email: email, login: email, isGuardianUser: true },
    };

    json.mockResolvedValueOnce(user);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: true, json } as Response),
    );

    const response = await getUser(userId);
    expect(response).toEqual(user);
  });

  test('should throw an error if user is not found', async () => {
    const userNotFound = {
      errorCode: 'E0000007',
      errorSummary: 'Not found: Resource not found: 12345 (User)',
      errorLink: 'E0000007',
      errorId: '123456',
    };

    json.mockResolvedValueOnce(userNotFound);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 404, json } as Response),
    );

    await expect(getUser(userId)).rejects.toThrowError(
      new OktaError({ message: 'Not found: Resource not found: 12345 (User)' }),
    );
  });
});

describe('okta#activateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should activate a user', async () => {
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: true, json } as Response),
    );

    await expect(activateUser(userId)).resolves.toEqual(undefined);
  });

  test('should throw an error when a user is already activated', async () => {
    const errorResponse = {
      errorCode: 'E0000016',
      errorSummary: 'Activation failed because the user is already active',
      errorLink: 'E0000016',
      errorId: '12345',
      errorCauses: [],
    };

    json.mockResolvedValueOnce(errorResponse);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 403, json } as Response),
    );

    await expect(activateUser(userId)).rejects.toThrowError(
      new OktaError({
        message: 'Activation failed because the user is already active',
      }),
    );
  });
});

describe('okta#reactivateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('reactivate a user', async () => {
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: true, json } as Response),
    );

    await expect(reactivateUser(userId)).resolves.toEqual(undefined);
  });

  test('throw a an error when a user cannot be reactivated', async () => {
    const errorResponse = {
      errorCode: 'E0000038',
      errorSummary:
        "This operation is not allowed in the user's current status.",
      errorLink: 'E0000038',
      errorId: '12345',
      errorCauses: [],
    };

    json.mockResolvedValueOnce(errorResponse);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 403, json } as Response),
    );

    await expect(reactivateUser(userId)).rejects.toThrow(
      new OktaError({
        message: "This operation is not allowed in the user's current status.",
      }),
    );
  });
});

describe('okta#clearUserSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should clear user sessions', async () => {
    mockedFetch.mockReturnValueOnce(Promise.resolve({ ok: true } as Response));

    await expect(clearUserSessions(userId)).resolves.toEqual(undefined);
  });

  test('should throw an error when a user session cannot be cleared', async () => {
    const errorResponse = {
      errorCode: 'E0000007',
      errorSummary: 'Not found: Resource not found: <userId> (User)',
      errorLink: 'E0000007',
      errorId: 'oaeZm9ypzgqQOq0n4PYgiFlZQ',
      errorCauses: [],
    };

    json.mockResolvedValueOnce(errorResponse);
    mockedFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 404, json } as Response),
    );

    await expect(clearUserSessions(userId)).rejects.toThrow(
      new OktaError({
        message: 'Not found: Resource not found: <userId> (User)',
      }),
    );
  });
});
