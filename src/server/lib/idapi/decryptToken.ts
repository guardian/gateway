import {
  APIAddClientAccessToken,
  APIGetOptions,
  idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';

export const decrypt = async (
  token: string,
  ip: string,
): Promise<string | undefined> => {
  const options = APIGetOptions();
  try {
    const { email } = await idapiFetch({
      path: '/signin-token/token/:token',
      options: APIAddClientAccessToken(options, ip),
      tokenisationParam: { token },
    });
    return email;
  } catch (error) {
    logger.error(
      `IDAPI Error decryptEmail decrypt '/signin-token/token/:token'`,
      error,
    );
  }
};
