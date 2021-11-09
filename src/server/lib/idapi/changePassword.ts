import {
  idapiFetch,
  APIAddClientAccessToken,
  APIGetOptions,
  APIPostOptions,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { ApiRoutes } from '@/shared/model/Routes';
import { stringify } from 'querystring';
import {
  IdapiErrorMessages,
  ChangePasswordErrors,
} from '@/shared/model/Errors';
import { logger } from '@/server/lib/logger';
import { IdapiError } from '@/server/models/Error';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.INVALID_TOKEN:
        throw new IdapiError({
          message: ChangePasswordErrors.INVALID_TOKEN,
          status,
        });
      case IdapiErrorMessages.BREACHED_PASSWORD:
        throw new IdapiError({
          message: ChangePasswordErrors.COMMON_PASSWORD,
          status,
          field: 'password',
        });
      default:
        break;
    }
  }

  throw new IdapiError({
    message: ChangePasswordErrors.GENERIC,
    status,
  });
};

export async function validate(
  token: string,
  ip: string,
): Promise<{ email?: string; tokenExpiryTimestamp?: number }> {
  const options = APIGetOptions();

  const params = {
    token,
  };

  const qs = stringify(params);

  const url = `${ApiRoutes.CHANGE_PASSWORD_TOKEN_VALIDATION}?${qs}`;

  try {
    const result = await idapiFetch(url, APIAddClientAccessToken(options, ip));

    return {
      email: result.user?.primaryEmailAddress,
      tokenExpiryTimestamp: result.expiryTimestamp,
    };
  } catch (error) {
    logger.error(`IDAPI Error changePassword validate ${url}`, error);
    return handleError(error as IDAPIError);
  }
}

export async function change(password: string, token: string, ip: string) {
  const options = APIPostOptions({
    password,
    token,
    validateBreached: true,
  });

  try {
    const result = await idapiFetch(
      ApiRoutes.CHANGE_PASSWORD,
      APIAddClientAccessToken(options, ip),
    );
    return result.cookies;
  } catch (error) {
    logger.error(
      `IDAPI Error changePassword change ${ApiRoutes.CHANGE_PASSWORD}`,
      error,
    );
    handleError(error as IDAPIError);
  }
}
