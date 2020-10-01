import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
} from '@/server/lib/APIFetch';

import { IdapiErrorMessages, VerifyEmailErrors } from '@/shared/model/Errors';
import { ApiRoutes } from '@/shared/model/Routes';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.TOKEN_EXPIRED:
        throw { message: VerifyEmailErrors.TOKEN_EXPIRED, status };
      case IdapiErrorMessages.INVALID_TOKEN:
        throw { message: VerifyEmailErrors.INVALID_TOKEN, status };
      default:
        break;
    }
  }
  throw { message: VerifyEmailErrors.GENERIC, status };
};

export async function verifyEmail(token: string, ip: string) {
  const options = APIPostOptions();

  try {
    const result = await idapiFetch(
      `${ApiRoutes.VERIFY_EMAIL}/${token}`,
      APIAddClientAccessToken(options, ip),
    );
    return result.cookies;
  } catch (error) {
    handleError(error);
  }
}
