import {
  idapiFetch,
  APIGetOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
} from '../APIFetch';
import { logger } from '../logger';
import { ConsentsErrors } from '@/shared/model/Errors';
import User from '@/shared/model/User';

interface APIResponse {
  user: User;
}

const API_ROUTE = '/user/me';

const handleError = (): never => {
  throw { message: ConsentsErrors.USER, status: 500 };
};

const responseToEntity = (response: APIResponse): User => {
  const consents = response.user.consents.map(({ id, consented }) => ({
    id,
    consented,
  }));
  return {
    consents,
  };
};

export const read = async (ip: string, sc_gu_u: string): Promise<User> => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIGetOptions(), ip),
    sc_gu_u,
  );
  try {
    const response = (await idapiFetch(API_ROUTE, options)) as APIResponse;
    return responseToEntity(response);
  } catch (e) {
    logger.error(e);
    return handleError();
  }
};
