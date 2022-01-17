import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
  APIForwardSessionIdentifier,
} from '@/server/lib/IDAPIFetch';

import { IdapiErrorMessages, VerifyEmailErrors } from '@/shared/model/Errors';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.TOKEN_EXPIRED:
        throw new IdapiError({
          message: VerifyEmailErrors.TOKEN_EXPIRED,
          status,
        });
      case IdapiErrorMessages.INVALID_TOKEN:
        throw new IdapiError({
          message: VerifyEmailErrors.INVALID_TOKEN,
          status,
        });
      case IdapiErrorMessages.USER_ALREADY_VALIDATED:
        throw new IdapiError({
          message: VerifyEmailErrors.USER_ALREADY_VALIDATED,
          status,
        });
      default:
        break;
    }
  }
  throw new IdapiError({ message: VerifyEmailErrors.GENERIC, status });
};

export async function verifyEmail(token: string, ip: string) {
  const options = APIPostOptions();

  try {
    const result = await idapiFetch({
      path: '/user/validate-email/:token',
      options: APIAddClientAccessToken(options, ip),
      tokenisationParam: { token },
    });
    return result.cookies;
  } catch (error) {
    logger.error(
      `IDAPI Error verifyEmail '/user/validate-email/:token'`,
      error,
    );
    handleError(error as IDAPIError);
  }
}

export async function send(ip: string, sc_gu_u: string) {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPostOptions(), ip),
    sc_gu_u,
  );
  try {
    await idapiFetch({ path: '/user/send-validation-email', options });
  } catch (error) {
    logger.error(
      `IDAPI Error verifyEmail send '/user/send-validation-email'`,
      error,
    );
    return handleError(error as IDAPIError);
  }
}
