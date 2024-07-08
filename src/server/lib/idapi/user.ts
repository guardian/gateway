import {
	idapiFetch,
	APIGetOptions,
	APIPostOptions,
	APIAddClientAccessToken,
	APIForwardSessionIdentifier,
	IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import {
	ConsentsErrors,
	IdapiErrorMessages,
	RegistrationErrors,
	ResetPasswordErrors,
} from '@/shared/model/Errors';
import User from '@/shared/model/User';
import { IdapiError } from '@/server/models/Error';
import { RegistrationLocation } from '@/shared/model/RegistrationLocation';
import { addApiQueryParamsToPath } from '@/shared/lib/queryParams';
import { ApiRoutePaths } from '@/shared/model/Routes';

interface APIResponse {
	user: User;
}

interface APIGroupResponse {
	status: string;
	groupCode: string;
}

/**
 * This enum maps to the type of user as defined in,
 * and returned by Identity API.
 * So these terms are specific to our existing system, and may
 * need to change when we move to Okta to better reflect that model
 *
 * `new` - New user that doesn't exist in Identity DB
 * `current` - Existing user, with a password set
 * `guest` - Existing user, with no password set
 */
export enum UserType {
	NEW = 'new',
	CURRENT = 'current',
	GUEST = 'guest',
}

export enum GroupCode {
	GRS = 'GRS',
}

const handleError = ({ error, status = 500 }: IDAPIError) => {
	if (error.status === 'error' && error.errors?.length) {
		const err = error.errors[0];
		const { message } = err;

		switch (message) {
			case IdapiErrorMessages.EMAIL_IN_USE:
				throw new IdapiError({ message: RegistrationErrors.GENERIC, status });
			case IdapiErrorMessages.ACCESS_DENIED:
				throw new IdapiError({ message: ConsentsErrors.ACCESS_DENIED, status });
			case IdapiErrorMessages.NOT_FOUND:
				throw new IdapiError({
					message: ResetPasswordErrors.NO_ACCOUNT,
					status,
				});
			case IdapiErrorMessages.MISSING_FIELD:
				throw new IdapiError({ message: ResetPasswordErrors.NO_EMAIL, status });
			default:
				break;
		}
	}

	throw new IdapiError({ message: ConsentsErrors.USER, status });
};

const responseToEntity = (response: APIResponse): User => {
	const consents = response.user.consents?.map(({ id, consented }) => ({
		id,
		consented,
	}));
	return {
		consents,
		primaryEmailAddress: response.user.primaryEmailAddress,
		id: response.user.id,
		statusFields: response.user.statusFields,
		userGroups: response.user.userGroups,
		privateFields: {
			firstName: response.user.privateFields?.firstName,
			secondName: response.user.privateFields?.secondName,
			registrationLocation: response.user.privateFields?.registrationLocation,
		},
	};
};

export const read = async (
	ip: string | undefined,
	sc_gu_u: string,
	request_id?: string,
): Promise<User> => {
	const options = APIForwardSessionIdentifier(
		APIAddClientAccessToken(APIGetOptions(), ip),
		sc_gu_u,
	);
	try {
		const response = (await idapiFetch({
			path: '/user/me',
			options,
		})) as APIResponse;
		return responseToEntity(response);
	} catch (error) {
		logger.error(`IDAPI Error user read '/user/me'`, error, {
			request_id,
		});
		return handleError(error as IDAPIError);
	}
};

export const updateName = async (
	firstName: string,
	secondName: string,
	ip: string | undefined,
	sc_gu_u: string,
	request_id?: string,
): Promise<User> => {
	const options = APIForwardSessionIdentifier(
		APIAddClientAccessToken(
			APIPostOptions({
				privateFields: {
					firstName,
					secondName,
				},
			}),
			ip,
		),
		sc_gu_u,
	);
	try {
		const response = (await idapiFetch({
			path: '/user/me',
			options,
		})) as APIResponse;
		return responseToEntity(response);
	} catch (error) {
		logger.error(`IDAPI error updating name for ${ip}`, error, {
			request_id,
		});
		return handleError(error as IDAPIError);
	}
};

/**
 * Until Gateway/Onboarding journey is migrated to Okta sessions, we don't have access to Okta User ID, only sc_gu_u cookie,
 * so we need to add reg location via idapi (which updates Okta immediately). When Okta sessions are available, this should be refactored
 * to use okta directly (Which is the source of truth for the user field)
 */
export const addRegistrationLocation = async (
	registrationLocation: RegistrationLocation,
	ip: string | undefined,
	sc_gu_u: string,
	request_id?: string,
): Promise<User> => {
	const options = APIForwardSessionIdentifier(
		APIAddClientAccessToken(
			APIPostOptions({
				privateFields: {
					registrationLocation,
				},
			}),
			ip,
		),
		sc_gu_u,
	);

	try {
		const response = (await idapiFetch({
			path: '/user/me',
			options,
		})) as APIResponse;
		return responseToEntity(response);
	} catch (error) {
		logger.error(
			`IDAPI error updating registration location for ${ip}`,
			error,
			{
				request_id,
			},
		);
		return handleError(error as IDAPIError);
	}
};

export const addToGroup = async (
	groupCode: GroupCode,
	ip: string | undefined,
	sc_gu_u: string,
	request_id?: string,
) => {
	const options = APIForwardSessionIdentifier(
		APIAddClientAccessToken(APIPostOptions(), ip),
		sc_gu_u,
	);
	try {
		const response = (await idapiFetch({
			path: '/user/me/group/:groupCode',
			options,
			tokenisationParam: { groupCode },
		})) as APIGroupResponse;
		return response;
	} catch (error) {
		logger.error(`IDAPI error assigning user to group: ${groupCode}`, error, {
			request_id,
		});
		return handleError(error as IDAPIError);
	}
};

export const changeEmail = async (
	token: string,
	ip: string | undefined,
	request_id?: string,
) => {
	const options = APIPostOptions({
		token,
	});
	try {
		await idapiFetch({
			path: '/user/change-email',
			options: APIAddClientAccessToken(options, ip),
		});
	} catch (error) {
		logger.error(`IDAPI Error change email '/user/change-email'`, error, {
			request_id,
		});
		return handleError(error as IDAPIError);
	}
};

export const getUserByEmailAddress = async (
	email: string,
	ip: string | undefined,
	request_id?: string,
): Promise<User> => {
	const options = APIAddClientAccessToken(APIGetOptions(), ip);
	try {
		const response = (await idapiFetch({
			path: addApiQueryParamsToPath('/user', {
				emailAddress: email,
			}) as ApiRoutePaths,
			options,
		})) as APIResponse;
		return responseToEntity(response);
	} catch (error) {
		logger.warn(`IDAPI Error user get '/user?emailAddress'`, error, {
			request_id,
		});
		return handleError(error as IDAPIError);
	}
};
