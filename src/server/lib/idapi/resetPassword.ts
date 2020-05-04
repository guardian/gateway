import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
} from '@/server/lib/APIFetch';
import { ResetPasswordErrors, IdapiErrorMessages } from '@/shared/model/Errors';

const PATH = '/pwd-reset/send-password-reset-email';

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

export function create(email: string, ip: string) {
  const options = APIPostOptions({
    'email-address': email,
    returnUrl: '',
  });

  return idapiFetch(PATH, APIAddClientAccessToken(options, ip)).catch(
    handleError,
  );
}
