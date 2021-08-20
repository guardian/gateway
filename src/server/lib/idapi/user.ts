import {
  idapiFetch,
  APIGetOptions,
  APIPostOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/logger';
import {
  ConsentsErrors,
  IdapiErrorMessages,
  RegistrationErrors,
  ResetPasswordErrors,
} from '@/shared/model/Errors';
import User from '@/shared/model/User';
import { addReturnUrlToPath } from '@/server/lib/queryParams';

interface APIResponse {
  user: User;
}

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.EMAIL_IN_USE:
        throw { message: RegistrationErrors.GENERIC, status };
      case IdapiErrorMessages.ACCESS_DENIED:
        throw { message: ConsentsErrors.ACCESS_DENIED, status };
      case IdapiErrorMessages.NOT_FOUND:
        throw { message: ResetPasswordErrors.NO_ACCOUNT, status };
      case IdapiErrorMessages.MISSING_FIELD:
        throw { message: ResetPasswordErrors.NO_EMAIL, status };
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
  const url = '/user/me';
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIGetOptions(), ip),
    sc_gu_u,
  );
  try {
    const response = (await idapiFetch(url, options)) as APIResponse;
    return responseToEntity(response);
  } catch (e) {
    logger.error(`IDAPI Error user read ${url}`, e);
    return handleError(e);
  }
};

export const create = async (email: string, password: string, ip: string) => {
  const url = '/user';
  const options = APIPostOptions({
    primaryEmailAddress: email,
    password,
  });

  try {
    return await idapiFetch(url, APIAddClientAccessToken(options, ip));
  } catch (e) {
    logger.error(`IDAPI Error user create ${url}`, e);
    handleError(e);
  }
};

export const getType = async (email: string, ip: string) => {
  const options = APIGetOptions();

  try {
    const response = await idapiFetch(
      `/user/type/${email}`,
      APIAddClientAccessToken(options, ip),
    );
    return response?.userType;
  } catch (e) {
    logger.error(`IDAPI Error getting user type`, e);
    handleError(e);
  }
};

export const resendAccountVerificationEmail = async (
  email: string,
  ip: string,
  returnUrl: string,
) => {
  const url = '/user/send-account-verification-email';
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    await idapiFetch(
      addReturnUrlToPath(url, returnUrl),
      APIAddClientAccessToken(options, ip),
    );
  } catch (e) {
    logger.error(`IDAPI Error resend account verification email ${url}`, e);
    return handleError(e);
  }
};
