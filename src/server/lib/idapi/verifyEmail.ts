import {
  idapiFetch,
  APIAddClientAccessToken,
  APIPostOptions,
} from '@/server/lib/APIFetch';

import { VerifyEmailErrors } from '@/shared/model/Errors';
import { ApiRoutes } from '@/shared/model/Routes';

const handleError = () => {
  throw VerifyEmailErrors.GENERIC;
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
    handleError();
  }
}
