import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { ResetPasswordErrors, IdapiErrorMessages } from '@/shared/model/Errors';
import { ApiRoutes } from '@/shared/model/Routes';
import { IdapiError } from '@/server/models/Error';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.NOT_FOUND:
        throw new IdapiError({
          message: ResetPasswordErrors.NO_ACCOUNT,
          status,
        });
      case IdapiErrorMessages.MISSING_FIELD:
        throw new IdapiError({ message: ResetPasswordErrors.NO_EMAIL, status });
      default:
        break;
    }
  }

  throw new IdapiError({ message: ResetPasswordErrors.GENERIC, status });
};

export async function create(email: string, ip: string, returnUrl: string) {
  const options = APIPostOptions({
    'email-address': email,
    returnUrl,
  });

  return idapiFetch({
    path: ApiRoutes.RESET_REQUEST_EMAIL,
    options: APIAddClientAccessToken(options, ip),
    queryParams: { returnUrl },
  }).catch(handleError);
}
