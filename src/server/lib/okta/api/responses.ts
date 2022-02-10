import { Response } from 'node-fetch';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';

export const handleVoidResponse = async (response: Response): Promise<void> => {
  if (response.ok) {
    return Promise.resolve();
  } else {
    return await handleErrorResponse(response);
  }
};
