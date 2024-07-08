import { Request } from 'express';
import { mocked } from 'jest-mock';
import {
	updateRegistrationLocationViaIDAPI,
	updateRegistrationLocationViaOkta,
} from '../updateRegistrationLocation';
import { read, addRegistrationLocation } from '@/server/lib/idapi/user';
import User from '@/shared/model/User';
import { UserResponse, UserUpdateRequest } from '@/server/models/okta/User';
import { Jwt } from '@okta/jwt-verifier';
import { getUser, updateUser } from '../okta/api/users';
import { RegistrationLocation } from '@/shared/model/RegistrationLocation';

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

const user = (location: string | undefined) => {
	return {
		primaryEmailAddress: 'abc@gu.com',
		privateFields: {
			registrationLocation: location,
		},
	} as User;
};

const oktaUser = (location: string | undefined) => {
	return {
		profile: {
			email: 'abc@gu.com',
			login: 'abc@gu.com',
			registrationLocation: location,
		},
	} as UserResponse;
};

jest.mock('@/server/lib/idapi/user');
const mockedReadUser =
	mocked<(ip: string | undefined, sc_gu_u: string) => Promise<User>>(read);
const mockedAddRegistrationLocation = mocked<
	(
		registrationLocation: RegistrationLocation,
		ip: string | undefined,
		sc_gu_u: string,
		request_id?: string,
	) => Promise<User>
>(addRegistrationLocation);

jest.mock('@/server/lib/okta/api/users');
const mockedGetUser = mocked<(id: string) => Promise<UserResponse>>(getUser);
const mockedUpdateUser =
	mocked<(id: string, user: UserUpdateRequest) => Promise<UserResponse>>(
		updateUser,
	);

describe('updateRegistrationLocationViaIDAPI', () => {
	afterEach(() => jest.resetAllMocks());

	test(`makes no idapi calls if registrationLocation undefined `, async () => {
		await updateRegistrationLocationViaIDAPI(
			'ip',
			'cookie',
			getFakeRequest(undefined),
		);
		expect(mockedReadUser).not.toBeCalled();
		expect(mockedAddRegistrationLocation).not.toBeCalled();
	});

	test(`does not update location if user response already has location set `, async () => {
		mockedReadUser.mockResolvedValue(user('Canada'));
		await updateRegistrationLocationViaIDAPI(
			'ip',
			'cookie',
			getFakeRequest('FR'),
		);

		expect(mockedReadUser).toBeCalled();
		expect(mockedAddRegistrationLocation).not.toBeCalled();
	});

	test(`updates location if user response does not have location set `, async () => {
		mockedReadUser.mockResolvedValueOnce(user(''));
		await updateRegistrationLocationViaIDAPI(
			'ip',
			'cookie',
			getFakeRequest('FR'),
		);
		expect(mockedReadUser).toBeCalled();
		expect(mockedAddRegistrationLocation).toBeCalled();
	});
});

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
