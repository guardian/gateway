import {
  idapiFetch,
  APIGetOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  IDAPIError,
} from '@/server/lib/APIFetch';
import { logger } from '@/server/lib/logger';
import { ConsentsErrors, IdapiErrorMessages } from '@/shared/model/Errors';
import User from '@/shared/model/User';

interface APIResponse {
  user: User;
}

const API_ROUTE = '/user/me';

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
  const consents = response.user.consents.map(({ id, consented }) => ({
    id,
    consented,
  }));
  return {
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
    const response = (await idapiFetch(API_ROUTE, options)) as APIResponse;
    return responseToEntity(response);
  } catch (e) {
    logger.error(e);
    return handleError(e);
  }
};
