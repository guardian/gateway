import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { ResetPasswordErrors, IdapiErrorMessages } from '@/shared/model/Errors';
import { IdapiError } from '@/server/models/Error';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.MISSING_FIELD:
        throw new IdapiError({ message: ResetPasswordErrors.NO_EMAIL, status });
      default:
        break;
    }
  }

  throw new IdapiError({ message: ResetPasswordErrors.GENERIC, status });
};

export async function sendResetPasswordEmail(
  email: string,
  ip: string,
  returnUrl: string,
  ref?: string,
  refViewId?: string,
) {
  const options = APIPostOptions({
    'email-address': email,
    returnUrl,
  });

  return idapiFetch({
    path: '/pwd-reset/send-password-reset-email',
    options: APIAddClientAccessToken(options, ip),
    queryParams: { returnUrl, ref, refViewId },
  }).catch(handleError);
}
