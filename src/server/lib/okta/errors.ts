import { Response } from 'node-fetch';
import { logger } from '@/server/lib/logger';

export const handleOktaErrors = async (response: Response) => {
  if (!response.ok) {
    response
      .text()
      .then((error) =>
        logger.error(`Okta API ${response.status} error: ${error}`),
      );
    throw new Error(`Okta API error`);
  } else {
    return response;
  }
};
