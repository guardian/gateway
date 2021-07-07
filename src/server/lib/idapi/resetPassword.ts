import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { ResetPasswordErrors, IdapiErrorMessages } from '@/shared/model/Errors';
import { ApiRoutes } from '@/shared/model/Routes';
import { logger } from '@/server/lib/logger';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    logger.error(err);
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.NOT_FOUND:
        throw { message: ResetPasswordErrors.NO_ACCOUNT, status };
      case IdapiErrorMessages.MISSING_FIELD:
        throw { message: ResetPasswordErrors.NO_EMAIL, status };
      default:
        break;
    }
  }

  throw { message: ResetPasswordErrors.GENERIC, status: status };
};

export async function create(email: string, ip: string, returnUrl: string) {
  const options = APIPostOptions({
    'email-address': email,
    returnUrl,
  });

  return idapiFetch(
    ApiRoutes.RESET_REQUEST_EMAIL,
    APIAddClientAccessToken(options, ip),
  ).catch(handleError);
}

export async function getToken(email: string, ip: string) {
  const options = APIPostOptions({
    'email-address': email,
  });

  try {
    const response = await idapiFetch(
      '/pwd-reset/create-password-reset-token',
      APIAddClientAccessToken(options, ip),
    );
    return response?.token;
  } catch (error) {
    handleError(error);
  }
}
