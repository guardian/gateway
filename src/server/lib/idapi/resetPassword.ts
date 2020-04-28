import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
} from '@/server/lib/APIFetch';

const PATH = '/pwd-reset/send-password-reset-email';

export function create(email: string, ip: string) {
  const options = APIPostOptions({
    'email-address': email,
    returnUrl: '',
  });

  return idapiFetch(PATH, APIAddClientAccessToken(options, ip));
}
