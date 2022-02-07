import { Response } from 'node-fetch';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';
import { RecoveryTransaction } from '@/server/models/okta/RecoveryTransaction';
import { OktaError } from '@/server/models/okta/Error';

export const handleVoidResponse = async (response: Response): Promise<void> => {
  if (response.ok) {
    return Promise.resolve();
  } else {
    return await handleErrorResponse(response);
  }
};

export const handleRecoveryTransactionResponse = async (
  response: Response,
): Promise<RecoveryTransaction> => {
  if (response.ok) {
    try {
      return await response.json().then((json) => {
        const response = json as RecoveryTransaction;
        const user = response._embedded.user;
        return {
          stateToken: response.stateToken,
          sessionToken: response.sessionToken,
          expiresAt: response.expiresAt,
          _embedded: {
            user: {
              id: user.id,
              profile: {
                login: user.profile.login,
              },
            },
          },
        };
      });
    } catch (error) {
      throw new OktaError({
        message: 'Could not parse recovery transaction response',
      });
    }
  } else {
    return await handleErrorResponse(response);
  }
};
