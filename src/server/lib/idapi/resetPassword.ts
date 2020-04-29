import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
} from '@/server/lib/APIFetch';
import { ResetPasswordErrors } from '@/shared/model/Errors';

const PATH = '/pwd-reset/send-password-reset-email';

const handleError = (response: any) => {
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
