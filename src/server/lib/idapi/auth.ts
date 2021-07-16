import {
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  APIGetOptions,
  APIPostOptions,
  IDAPIError,
  idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/logger';
import { IdapiErrorMessages, SignInErrors } from '@/shared/model/Errors';
import { IDAPIAuthRedirect, IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';

interface APIResponse {
  emailValidated: true;
  signInStatus: IDAPIAuthStatus;
  redirect?: {
    url: string;
  };
}

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    logger.error(message);

    switch (message) {
      case IdapiErrorMessages.INVALID_EMAIL_PASSWORD:
        throw { message: SignInErrors.AUTHENTICATION_FAILED, status };
      default:
        break;
    }
  }

  throw { message: SignInErrors.GENERIC, status: status };
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
  const url = '/auth/redirect';
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
      (await idapiFetch(url, {
        ...options,
        headers: { ...headers },
      })) as APIResponse,
    );
  } catch (e) {
    logger.error(`IDAPI Error auth read ${url}`, e);
    return handleError(e);
  }
};

export const authenticate = async (
  email: string,
  password: string,
  ip: string,
) => {
  const url = '/auth?format=cookies';
  const options = APIPostOptions({
    email,
    password,
  });

  try {
    const response = await idapiFetch(
      url,
      APIAddClientAccessToken(options, ip),
    );
    return response.cookies;
  } catch (e) {
    logger.error(`IDAPI Error auth authenticate ${url}`, e);
    handleError(e);
  }
};

export const exchangeAccessTokenForCookies = async (
  token: string,
  ip: string,
) => {
  const options = APIPostOptions({
    token,
  });

  try {
    const response = await idapiFetch(
      '/auth/oauth-token?format=cookies',
      APIAddClientAccessToken(options, ip),
    );
    return response.cookies;
  } catch (e) {
    handleError(e);
  }
};
