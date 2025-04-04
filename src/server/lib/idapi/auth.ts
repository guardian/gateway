import {
	APIAddClientAccessToken,
	APIPostOptions,
	IDAPIError,
	idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
import { IdapiErrorMessages, SignInErrors } from '@/shared/model/Errors';
import { IdapiCookies } from '@/shared/model/IDAPIAuth';

const handleError = ({ error, status = 500 }: IDAPIError) => {
	if (error.status === 'error' && error.errors?.length) {
		const err = error.errors[0];
		const { message } = err;

		switch (message) {
			case IdapiErrorMessages.INVALID_EMAIL_PASSWORD:
				throw new IdapiError({
					message: SignInErrors.AUTHENTICATION_FAILED,
					status,
				});
			default:
				break;
		}
	}

	throw new IdapiError({ message: SignInErrors.GENERIC, status });
};

export const exchangeAccessTokenForCookies = async (
	token: string,
	ip: string | undefined,
) => {
	const options = APIPostOptions({
		token,
	});

	try {
		const response = await idapiFetch({
			path: `/auth/oauth-token`,
			options: APIAddClientAccessToken(options, ip),
			queryParams: { format: 'cookies' },
		});
		return response.cookies as IdapiCookies;
	} catch (error) {
		logger.error(
			`IDAPI Error auth exchangeAccessTokenForCookies '/auth/oauth-token'`,
			error,
		);
		handleError(error as IDAPIError);
	}
};
