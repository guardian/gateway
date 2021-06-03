import {
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  APIGetOptions,
  idapiFetch,
} from '@/server/lib/APIFetch';
import { logger } from '@/server/lib/logger';
import { IDAPIAuthRedirect, IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';

interface APIResponse {
  emailValidated: true;
  signInStatus: IDAPIAuthStatus;
  redirect?: {
    url: string;
  };
}

const handleError = (): never => {
  throw 'Error retrieving authentication information.';
};

const responseToEntity = (response: APIResponse) => {
  const { signInStatus: status, emailValidated, redirect } = response;
  return {
    emailValidated,
    status,
    redirect,
  };
};

export const read = async (
  sc_gu_u: string,
  sc_gu_la: string,
  ip: string,
): Promise<IDAPIAuthRedirect> => {
  const options = APIAddClientAccessToken(
    APIForwardSessionIdentifier(APIGetOptions(), sc_gu_u),
    ip,
  );
  const headers = {
    ...options.headers,
    cookie: `SC_GU_LA=${sc_gu_la}`,
  };
  try {
    return responseToEntity(
      (await idapiFetch('/auth/redirect', {
        ...options,
        headers: { ...headers },
      })) as APIResponse,
    );
  } catch (e) {
    logger.error(e);
    return handleError();
  }
};
