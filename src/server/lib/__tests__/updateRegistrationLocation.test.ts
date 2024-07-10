import { Request } from 'express';
import { mocked } from 'jest-mock';
import { updateRegistrationLocationViaOkta } from '../updateRegistrationLocation';
import { UserResponse, UserUpdateRequest } from '@/server/models/okta/User';
import { Jwt } from '@okta/jwt-verifier';
import { getUser, updateUser } from '../okta/api/users';

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

const getFakeRequest = (country: string | undefined): Request =>
	({
		headers: {
			'x-gu-geolocation': country,
		},
	}) as unknown as Request;

const oktaUser = (location: string | undefined) => {
	return {
		profile: {
			email: 'abc@gu.com',
			login: 'abc@gu.com',
			registrationLocation: location,
		},
	} as UserResponse;
};

jest.mock('@/server/lib/okta/api/users');
const mockedGetUser = mocked<(id: string) => Promise<UserResponse>>(getUser);
const mockedUpdateUser =
	mocked<(id: string, user: UserUpdateRequest) => Promise<UserResponse>>(
		updateUser,
	);

describe('updateRegistrationLocationViaOkta', () => {
	afterEach(() => jest.resetAllMocks());

	test(`makes no okta calls if registrationLocation undefined `, async () => {
		await updateRegistrationLocationViaOkta(getFakeRequest(undefined), {
			claims: { sub: '123' },
		} as Jwt);
		expect(mockedGetUser).not.toBeCalled();
		expect(mockedUpdateUser).not.toBeCalled();
	});

	test(`does not update location if user response already has location set `, async () => {
		mockedGetUser.mockResolvedValue(oktaUser('Canada'));
		await updateRegistrationLocationViaOkta(getFakeRequest('FR'), {
			claims: { sub: '123' },
		} as Jwt);

		expect(mockedGetUser).toBeCalled();
		expect(mockedUpdateUser).not.toBeCalled();
	});

	test(`updates location if user response does not have location set `, async () => {
		mockedGetUser.mockResolvedValueOnce(oktaUser(''));
		await updateRegistrationLocationViaOkta(
			getFakeRequest('FR') as Request,
			{ claims: { sub: '123' } } as Jwt,
		);
		expect(mockedGetUser).toBeCalled();
		expect(mockedUpdateUser).toBeCalled();
	});
});
