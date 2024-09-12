import {
	APIAddClientAccessToken,
	APIPostOptions,
	idapiFetch,
	IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { IdapiCookies } from '@/server/lib/idapi/IDAPICookies';

const handleError = ({ status = 500 }: IDAPIError) => {
	throw new IdapiError({ message: GenericErrors.DEFAULT, status });
};

export const logoutFromIDAPI = async (
	sc_gu_u: string,
	ip: string | undefined,
): Promise<IdapiCookies | undefined> => {
	const options = APIAddClientAccessToken(APIPostOptions(), ip);
	// eslint-disable-next-line functional/immutable-data
	options.headers = {
		...options.headers,
		'X-GU-ID-FOWARDED-SC-GU-U': sc_gu_u,
	};
	try {
		const response = await idapiFetch({
			path: '/unauth',
			options,
		});

		return response.cookies;
	} catch (error) {
		logger.error(`IDAPI Error auth logout '/unauth'`, error);
		return handleError(error as IDAPIError);
	}
};
