import {
  APIAddClientAccessToken,
  APIGetOptions,
  idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { ApiRoutes } from '@/shared/model/Routes';
import { logger } from '@/server/lib/logger';

export async function decrypt(
  token: string,
  ip: string,
): Promise<{ email?: string }> {
  const options = APIGetOptions();
  const path = `${ApiRoutes.DECRYPT_EMAIL_TOKEN}/${token}`;

  try {
    const result = await idapiFetch(path, APIAddClientAccessToken(options, ip));
    return {
      email: result.user?.primaryEmailAddress,
    };
  } catch (error) {
    logger.error(`IDAPI Error decryptEmail decrypt ${path}`, error);
    return {};
  }
}
