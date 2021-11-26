import {
  APIAddClientAccessToken,
  APIGetOptions,
  idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { ApiRoutes } from '@/shared/model/Routes';
import { logger } from '@/server/lib/logger';

export const decrypt = async (
  token: string,
  ip: string,
): Promise<string | undefined> => {
  const options = APIGetOptions();
  const path = `${ApiRoutes.DECRYPT_EMAIL_TOKEN}/${token}`;
  try {
    const { email } = await idapiFetch({
      path: `${ApiRoutes.DECRYPT_EMAIL_TOKEN}/:token`,
      options: APIAddClientAccessToken(options, ip),
      tokenisationParam: { token },
    });
    return email;
  } catch (error) {
    logger.error(`IDAPI Error decryptEmail decrypt ${path}`, error);
  }
};
