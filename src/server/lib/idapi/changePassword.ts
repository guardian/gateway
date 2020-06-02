import {
  idapiFetch,
  APIAddClientAccessToken,
  APIGetOptions,
} from '@/server/lib/APIFetch';
import { ResetPasswordErrors, IdapiErrorMessages } from '@/shared/model/Errors';
import { ApiRoutes } from '@/shared/model/Routes';

const PATH = ApiRoutes.CHANGE_PASSWORD_TOKEN_VALIDATION;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleError = (response: any) => {
  if (response.status === 'error' && response.errors?.length) {
    const error = response.errors[0];
    const message = error?.message;

    switch (message) {
      case IdapiErrorMessages.NOT_FOUND:
        throw ResetPasswordErrors.NO_ACCOUNT;
      case IdapiErrorMessages.MISSING_FIELD:
        throw ResetPasswordErrors.NO_EMAIL;
      default:
        break;
    }
  }

  throw ResetPasswordErrors.GENERIC;
};

export function get(token: string, ip: string) {
  const options = APIGetOptions();
  return idapiFetch(
    `${PATH}?token=${token}`,
    APIAddClientAccessToken(options, ip),
  ).catch(handleError);
}
