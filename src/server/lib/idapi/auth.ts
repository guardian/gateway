import {
  APIForwardSessionIdentifier,
  APIGetOptions,
  idapiFetch,
} from '../APIFetch';
import { logger } from '../logger';

const AUTH_URL = '/auth/redirect';

enum IDAPIAuthStatus {
  RECENT = 'signedInRecently',
  NOT_RECENT = 'signedInNotRecently',
  SIGNED_OUT = 'notSignedIn',
}

interface IDAPIAuthRedirect {
  status: IDAPIAuthStatus;
  redirect: {
    url: string;
  };
}

interface APIResponse {
  signInStatus: IDAPIAuthStatus;
  redirect: {
    url: string;
  };
}

const handleError = (): never => {
  throw 'Error retrieving authentication information.';
};

const responseToEntity = (response: APIResponse) => {
  const { signInStatus: status, redirect } = response;
  return {
    status,
    redirect,
  };
};

export const read = async (sc_gu_u: string): Promise<IDAPIAuthRedirect> => {
  const options = APIForwardSessionIdentifier(APIGetOptions(), sc_gu_u);
  try {
    return responseToEntity(
      (await idapiFetch(AUTH_URL, options)) as APIResponse,
    );
  } catch (e) {
    logger.error(e);
    return handleError();
  }
};
