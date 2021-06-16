import {
  idapiFetch,
  APIGetOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/logger';
import { ConsentsErrors, IdapiErrorMessages } from '@/shared/model/Errors';
import User from '@/shared/model/User';

interface APIResponse {
  user: User;
}

const API_ROUTE = '/user';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.ACCESS_DENIED:
        throw { message: ConsentsErrors.ACCESS_DENIED, status };
      default:
        break;
    }
  }

  throw { message: ConsentsErrors.USER, status };
};

const responseToEntity = (response: APIResponse): User => {
  const consents = response.user.consents
    ? response.user.consents.map(({ id, consented }) => ({
        id,
        consented,
      }))
    : [];
  return {
    id: response.user.id,
    consents,
    primaryEmailAddress: response.user.primaryEmailAddress,
    statusFields: response.user.statusFields,
  };
};

export const read = async (ip: string, sc_gu_u: string): Promise<User> => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIGetOptions(), ip),
    sc_gu_u,
  );
  try {
    const response = (await idapiFetch(
      `${API_ROUTE}/me`,
      options,
    )) as APIResponse;
    return responseToEntity(response);
  } catch (e) {
    logger.error(e);
    return handleError(e);
  }
};

export const readByEmail = async (ip: string, email: string): Promise<User> => {
  const options = APIAddClientAccessToken(APIGetOptions(), ip);

  try {
    const response = (await idapiFetch(
      `${API_ROUTE}?emailAddress=${email}`,
      options,
    )) as APIResponse;
    return responseToEntity(response);
  } catch (e) {
    logger.error(e);
    return handleError(e);
  }
};
