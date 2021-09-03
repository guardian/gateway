import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
  APIForwardSessionIdentifier,
} from '@/server/lib/IDAPIFetch';

import { IdapiErrorMessages, VerifyEmailErrors } from '@/shared/model/Errors';
import { ApiRoutes } from '@/shared/model/Routes';
import { logger } from '@/server/lib/logger';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.TOKEN_EXPIRED:
        throw { message: VerifyEmailErrors.TOKEN_EXPIRED, status };
      case IdapiErrorMessages.INVALID_TOKEN:
        throw { message: VerifyEmailErrors.INVALID_TOKEN, status };
      case IdapiErrorMessages.USER_ALREADY_VALIDATED:
        throw {
          message: VerifyEmailErrors.USER_ALREADY_VALIDATED,
          status,
        };
      default:
        break;
    }
  }
  throw { message: VerifyEmailErrors.GENERIC, status };
};

export async function verifyEmail(token: string, ip: string) {
  const url = `${ApiRoutes.VERIFY_EMAIL}/${token}`;
  const options = APIPostOptions();

  try {
    const result = await idapiFetch(url, APIAddClientAccessToken(options, ip));
    return result.cookies;
  } catch (error) {
    logger.error(`IDAPI Error verifyEmail ${url}`, error);
    handleError(error as IDAPIError);
  }
}

export async function send(ip: string, sc_gu_u: string) {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPostOptions(), ip),
    sc_gu_u,
  );
  try {
    await idapiFetch(ApiRoutes.RESEND_VERIFY_EMAIL, options);
  } catch (error) {
    logger.error(
      `IDAPI Error verifyEmail send ${ApiRoutes.RESEND_VERIFY_EMAIL}`,
      error,
    );
    return handleError(error as IDAPIError);
  }
}
