import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { ResetPasswordErrors, IdapiErrorMessages } from '@/shared/model/Errors';
import { ApiRoutes } from '@/shared/model/Routes';

const PATH = ApiRoutes.RESET_REQUEST_EMAIL;

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
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

  return idapiFetch(PATH, APIAddClientAccessToken(options, ip)).catch(
    handleError,
  );
}
