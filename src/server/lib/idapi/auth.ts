import {
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  APIGetOptions,
  APIPostOptions,
  IDAPIError,
  idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
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
        throw new IdapiError({
          message: SignInErrors.AUTHENTICATION_FAILED,
          status,
        });
      default:
        break;
    }
  }

  throw new IdapiError({ message: SignInErrors.GENERIC, status });
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
      (await idapiFetch({
        path: '/auth/redirect',
        options: {
          ...options,
          headers: { ...headers },
        },
      })) as APIResponse,
    );
  } catch (error) {
    logger.error(`IDAPI Error auth read '/auth/redirect'`, error);
    return handleError(error as IDAPIError);
  }
};

export const authenticate = async (
  email: string,
  password: string,
  ip: string,
) => {
  const options = APIPostOptions({
    email,
    password,
  });

  try {
    const response = await idapiFetch({
      path: '/auth',
      options: APIAddClientAccessToken(options, ip),
      queryParams: { format: 'cookies' },
    });
    return response.cookies;
  } catch (error) {
    logger.error(`IDAPI Error auth authenticate '/auth?format=cookies'`, error);
    handleError(error as IDAPIError);
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
    const response = await idapiFetch({
      path: `/auth/oauth-token`,
      options: APIAddClientAccessToken(options, ip),
      queryParams: { format: 'cookies' },
    });
    return response.cookies;
  } catch (error) {
    handleError(error as IDAPIError);
  }
};
