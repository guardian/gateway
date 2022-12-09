import { Request } from 'express';
import { mocked } from 'jest-mock';
import { updateRegistrationLocationViaIDAPI } from '../updateRegistrationLocation';
import { read, addRegistrationLocation } from '@/server/lib/idapi/user';
import User from '@/shared/model/User';
import { RegistrationLocation } from '@/server/models/okta/User';

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
  getConfiguration: () => ({}),
}));

// mocked logger
jest.mock('@/server/lib/serverSideLogger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const getFakeRequest = (
  country: string | undefined,
  consent: string | undefined,
) => ({
  cookies: {
    GU_geo_country: country,
  },
  body: {
    _cmpConsentedState: consent,
  },
});

const user = (location: string | undefined) => {
  return {
    primaryEmailAddress: 'abc@gu.com',
    privateFields: {
      registrationLocation: location,
    },
  } as User;
};

jest.mock('@/server/lib/idapi/user');
const mockedReadUser =
  mocked<(ip: string, sc_gu_u: string) => Promise<User>>(read);
const mockedAddRegistrationLocation = mocked<
  (
    registrationLocation: RegistrationLocation,
    ip: string,
    sc_gu_u: string,
    request_id?: string,
  ) => Promise<User>
>(addRegistrationLocation);

describe('updateRegistrationLocation', () => {
  afterEach(() => jest.resetAllMocks());

  test(`makes no idapi calls if registrationLocation undefined `, async () => {
    await updateRegistrationLocationViaIDAPI(
      'ip',
      'cookie',
      getFakeRequest(undefined, 'true') as Request,
    );
    expect(mockedReadUser).not.toBeCalled();
    expect(mockedAddRegistrationLocation).not.toBeCalled();
  });

  test(`does not update location if user response already has location set `, async () => {
    mockedReadUser.mockResolvedValue(user('Canada'));
    await updateRegistrationLocationViaIDAPI(
      'ip',
      'cookie',
      getFakeRequest('FR', 'true') as Request,
    );

    expect(mockedReadUser).toBeCalled();
    expect(mockedAddRegistrationLocation).not.toBeCalled();
  });

  test(`updates location if user response does not have location set `, async () => {
    mockedReadUser.mockResolvedValueOnce(user(''));
    await updateRegistrationLocationViaIDAPI(
      'ip',
      'cookie',
      getFakeRequest('FR', 'true') as Request,
    );
    expect(mockedReadUser).toBeCalled();
    expect(mockedAddRegistrationLocation).toBeCalled();
  });
});
