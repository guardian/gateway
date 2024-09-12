import {
	APIAddClientAccessToken,
	APIPostOptions,
	idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
import { IdapiErrorMessages } from '@/shared/model/Errors';

const handleError = (): never => {
	throw new IdapiError({
		message: IdapiErrorMessages.INVALID_TOKEN,
		status: 500,
	});
};

export const validateConsentToken = async (
	ip: string | undefined,
	token: string,
) => {
	const options = APIAddClientAccessToken(APIPostOptions(), ip);
	try {
		await idapiFetch({
			path: '/consent-email/:token',
			options,
			tokenisationParam: { token },
		});
	} catch (error) {
		logger.error(
			`IDAPI Error validating consent token with route '/consent-email/:token'`,
			error,
		);
		return handleError();
	}
};

export const resendConsentEmail = async (
	ip: string | undefined,
	token: string,
) => {
	const options = APIAddClientAccessToken(APIPostOptions(), ip);
	try {
		await idapiFetch({
			path: '/consent-email/resend/:token',
			options,
			tokenisationParam: { token },
		});
	} catch (error) {
		logger.error(
			`IDAPI Error resending consent email with route '/consent-email/resend/:token'`,
			error,
		);
		return handleError();
	}
};
