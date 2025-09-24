import {
	idapiFetch,
	APIGetOptions,
	APIPostOptions,
	APIAddClientAccessToken,
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
import { addApiQueryParamsToPath } from '@/shared/lib/queryParams';
import { ApiRoutePaths } from '@/shared/model/Routes';

interface APIResponse {
	user: User;
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

export const changeEmail = async (token: string, ip: string | undefined) => {
	const options = APIPostOptions({
		token,
	});
	try {
		await idapiFetch({
			path: '/user/change-email',
			options: APIAddClientAccessToken(options, ip),
		});
	} catch (error) {
		logger.error(`IDAPI Error change email '/user/change-email'`, error);
		return handleError(error as IDAPIError);
	}
};

export const getUserType = async (
	email: string,
): Promise<'sign-in' | 'register' | undefined> => {
	try {
		const response: { userType: 'guest' | 'current' | 'new' } =
			await idapiFetch({
				path: `/user/type/:email`,
				tokenisationParam: { email },
				options: APIAddClientAccessToken(APIGetOptions(), undefined),
			});

		if (response.userType === 'current') {
			return 'sign-in';
		} else {
			return 'register';
		}
	} catch (error) {
		logger.warn(`IDAPI Error user exists '/user/type/${email}'`, error);
		return undefined;
	}
};

export const getUserByEmailAddress = async (
	email: string,
	ip: string | undefined,
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
		logger.warn(`IDAPI Error user get '/user?emailAddress'`, error);
		return handleError(error as IDAPIError);
	}
};
