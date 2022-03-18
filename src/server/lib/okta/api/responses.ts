import { Response } from 'node-fetch';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';

/**
 * @name handleVoidResponse
 * @description Handles an empty okay response from Okta
 * @param response node-fetch response object
 * @returns Promise<void>
 */
export const handleVoidResponse = async (response: Response): Promise<void> => {
  if (response.ok) {
    return Promise.resolve();
  } else {
    return await handleErrorResponse(response);
  }
};
