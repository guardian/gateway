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
import { IdapiError } from '@/server/models/Error';
import { ApiRoutes } from '@/shared/model/Routes';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';

interface APIResponse {
  user: User;
}

/**
 * This enum maps to the type of user as defined in,
 * and returned by Identity API.
 * So these terms are specific to our existing system, and may
 * need to change when we move to Okta to better reflect that model
 *
 * `new` - New user that doesn't exist in Identity DB
 * `current` - Existing user, with a password set
 * `guest` - Existing user, with no password set
 */
export enum UserType {
  NEW = 'new',
  CURRENT = 'current',
  GUEST = 'guest',
}

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.EMAIL_IN_USE:
        throw new IdapiError({ message: RegistrationErrors.GENERIC, status });
      case IdapiErrorMessages.ACCESS_DENIED:
        throw new IdapiError({ message: ConsentsErrors.ACCESS_DENIED, status });
      case IdapiErrorMessages.NOT_FOUND:
        throw new IdapiError({
          message: ResetPasswordErrors.NO_ACCOUNT,
          status,
        });
      case IdapiErrorMessages.MISSING_FIELD:
        throw new IdapiError({ message: ResetPasswordErrors.NO_EMAIL, status });
      default:
        break;
    }
  }

  throw new IdapiError({ message: ConsentsErrors.USER, status });
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
  const url = `${ApiRoutes.USER}${ApiRoutes.ME}`;
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIGetOptions(), ip),
    sc_gu_u,
  );
  try {
    const response = (await idapiFetch(url, options)) as APIResponse;
    return responseToEntity(response);
  } catch (error) {
    logger.error(`IDAPI Error user read ${url}`, error);
    return handleError(error as IDAPIError);
  }
};

export const readUserType = async (
  email: string,
  ip: string,
): Promise<UserType> => {
  const url = `${ApiRoutes.USER}${ApiRoutes.TYPE}/${email}`;

  const options = APIAddClientAccessToken(APIGetOptions(), ip);

  try {
    const { userType } = await idapiFetch(url, options);

    switch (userType) {
      // new users without accounts
      case UserType.NEW:
        return UserType.NEW;
      // existing users with password
      case UserType.CURRENT:
        return UserType.CURRENT;
      // existing users without password
      case UserType.GUEST:
        return UserType.GUEST;
      // shouldn't reach this point, so we want to catch this
      // as an error
      default:
        throw new Error('Invalid UserType');
    }
  } catch (error) {
    logger.error(`IDAPI Error read user type ${url}`, error);
    return handleError(error as IDAPIError);
  }
};

export const sendAccountVerificationEmail = async (
  email: string,
  ip: string,
  returnUrl: string,
) => {
  const url = `${ApiRoutes.USER}${ApiRoutes.SEND_ACCOUNT_VERIFICATION_EMAIL}`;
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    await idapiFetch(
      addReturnUrlToPath(url, returnUrl),
      APIAddClientAccessToken(options, ip),
    );
    trackMetric(emailSendMetric('AccountVerification', 'Success'));
  } catch (error) {
    logger.error(`IDAPI Error send account verification email ${url}`, error);
    trackMetric(emailSendMetric('AccountVerification', 'Failure'));
    return handleError(error as IDAPIError);
  }
};

export const sendAccountExistsEmail = async (
  email: string,
  ip: string,
  returnUrl: string,
) => {
  const url = `${ApiRoutes.USER}${ApiRoutes.SEND_ACCOUNT_EXISTS_EMAIL}`;
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    await idapiFetch(
      addReturnUrlToPath(url, returnUrl),
      APIAddClientAccessToken(options, ip),
    );
    trackMetric(emailSendMetric('AccountExists', 'Success'));
  } catch (error) {
    logger.error(`IDAPI Error send account exists email ${url}`, error);
    trackMetric(emailSendMetric('AccountExists', 'Failure'));
    return handleError(error as IDAPIError);
  }
};

export const sendAccountWithoutPasswordExistsEmail = async (
  email: string,
  ip: string,
  returnUrl: string,
) => {
  const url = `${ApiRoutes.USER}${ApiRoutes.SEND_ACCOUNT_WITHOUT_PASSWORD_EXISTS_EMAIL}`;
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    await idapiFetch(
      addReturnUrlToPath(url, returnUrl),
      APIAddClientAccessToken(options, ip),
    );
    trackMetric(emailSendMetric('AccountExistsWithoutPassword', 'Success'));
  } catch (error) {
    logger.error(
      `IDAPI Error send account without password exists email ${url}`,
      error,
    );
    trackMetric(emailSendMetric('AccountExistsWithoutPassword', 'Failure'));
    return handleError(error as IDAPIError);
  }
};

export const sendCreatePasswordEmail = async (
  email: string,
  ip: string,
  returnUrl: string,
) => {
  const url = `${ApiRoutes.USER}${ApiRoutes.SEND_CREATE_PASSWORD_ACCOUNT_EXISTS_EMAIL}`;
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    await idapiFetch(
      addReturnUrlToPath(url, returnUrl),
      APIAddClientAccessToken(options, ip),
    );
    trackMetric(emailSendMetric('CreatePassword', 'Success'));
  } catch (error) {
    logger.error(`IDAPI Error send create password email ${url}`, error);
    trackMetric(emailSendMetric('CreatePassword', 'Failure'));
    return handleError(error as IDAPIError);
  }
};
