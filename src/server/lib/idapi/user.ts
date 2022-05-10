import {
  idapiFetch,
  APIGetOptions,
  APIPostOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import {
  ConsentsErrors,
  IdapiErrorMessages,
  RegistrationErrors,
  ResetPasswordErrors,
} from '@/shared/model/Errors';
import User from '@/shared/model/User';
import { IdapiError } from '@/server/models/Error';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';
import {
  OphanConfig,
  sendOphanInteractionEventServer,
} from '@/server/lib/ophan';
import { IdApiQueryParams } from '@/shared/model/IdapiQueryParams';

interface APIResponse {
  user: User;
}

interface APIGroupResponse {
  status: string;
  groupCode: string;
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

export enum GroupCode {
  GRS = 'GRS',
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
    userGroups: response.user.userGroups,
    privateFields: {
      firstName: response.user.privateFields?.firstName,
      secondName: response.user.privateFields?.secondName,
    },
  };
};

export const read = async (ip: string, sc_gu_u: string): Promise<User> => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIGetOptions(), ip),
    sc_gu_u,
  );
  try {
    const response = (await idapiFetch({
      path: '/user/me',
      options,
    })) as APIResponse;
    return responseToEntity(response);
  } catch (error) {
    logger.error(`IDAPI Error user read '/user/me'`, error);
    return handleError(error as IDAPIError);
  }
};

export const updateName = async (
  firstName: string,
  secondName: string,
  ip: string,
  sc_gu_u: string,
): Promise<User> => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(
      APIPostOptions({
        privateFields: {
          firstName,
          secondName,
        },
      }),
      ip,
    ),
    sc_gu_u,
  );
  try {
    const response = (await idapiFetch({
      path: '/user/me',
      options,
    })) as APIResponse;
    return responseToEntity(response);
  } catch (error) {
    logger.error(`IDAPI error updating name for ${ip}`, error);
    return handleError(error as IDAPIError);
  }
};

export const addToGroup = async (
  groupCode: GroupCode,
  ip: string,
  sc_gu_u: string,
) => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPostOptions(), ip),
    sc_gu_u,
  );
  try {
    const response = (await idapiFetch({
      path: '/user/me/group/:groupCode',
      options,
      tokenisationParam: { groupCode },
    })) as APIGroupResponse;
    return response;
  } catch (error) {
    logger.error(`IDAPI error assigning user to group: ${groupCode}`, error);
    return handleError(error as IDAPIError);
  }
};

export const readUserType = async (
  email: string,
  ip: string,
): Promise<UserType> => {
  const options = APIAddClientAccessToken(APIGetOptions(), ip);

  try {
    const { userType } = await idapiFetch({
      path: '/user/type/:email',
      options,
      tokenisationParam: { email },
    });

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
    logger.error(`IDAPI Error read user type '/user/type/:email'`, error);
    return handleError(error as IDAPIError);
  }
};

export const sendAccountVerificationEmail = async (
  email: string,
  ip: string,
  trackingParams: IdApiQueryParams,
  ophanTrackingConfig?: OphanConfig,
) => {
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    const { returnUrl, ref, refViewId, clientId, componentEventParams } =
      trackingParams;
    await idapiFetch({
      path: '/user/send-account-verification-email',
      options: APIAddClientAccessToken(options, ip),
      queryParams: {
        returnUrl,
        ref,
        refViewId,
        clientId,
        componentEventParams,
      },
    });
    sendOphanInteractionEventServer(
      {
        component: 'email-send',
        value: 'account-verification',
      },
      ophanTrackingConfig,
    );
    trackMetric(emailSendMetric('AccountVerification', 'Success'));
  } catch (error) {
    logger.error(
      `IDAPI Error send account verification email '/user/send-account-verification-email'`,
      error,
    );
    trackMetric(emailSendMetric('AccountVerification', 'Failure'));
    return handleError(error as IDAPIError);
  }
};

export const sendAccountExistsEmail = async (
  email: string,
  ip: string,
  trackingParams: IdApiQueryParams,
  ophanTrackingConfig?: OphanConfig,
) => {
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    const { returnUrl, ref, refViewId, componentEventParams } = trackingParams;
    await idapiFetch({
      path: '/user/send-account-exists-email',
      options: APIAddClientAccessToken(options, ip),
      queryParams: { returnUrl, ref, refViewId, componentEventParams },
    });
    sendOphanInteractionEventServer(
      {
        component: 'email-send',
        value: 'account-exists',
      },
      ophanTrackingConfig,
    );
    trackMetric(emailSendMetric('AccountExists', 'Success'));
  } catch (error) {
    logger.error(
      `IDAPI Error send account exists email '/user/send-account-exists-email'`,
      error,
    );
    trackMetric(emailSendMetric('AccountExists', 'Failure'));
    return handleError(error as IDAPIError);
  }
};

export const sendAccountWithoutPasswordExistsEmail = async (
  email: string,
  ip: string,
  trackingParams: IdApiQueryParams,
  ophanTrackingConfig?: OphanConfig,
) => {
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    const { returnUrl, ref, refViewId, componentEventParams } = trackingParams;
    await idapiFetch({
      path: '/user/send-account-without-password-exists-email',
      options: APIAddClientAccessToken(options, ip),
      queryParams: { returnUrl, ref, refViewId, componentEventParams },
    });
    sendOphanInteractionEventServer(
      {
        component: 'email-send',
        value: 'account-without-password-exists',
      },
      ophanTrackingConfig,
    );
    trackMetric(emailSendMetric('AccountExistsWithoutPassword', 'Success'));
  } catch (error) {
    logger.error(
      `IDAPI Error send account without password exists email '/user/send-account-without-password-exists-email'`,
      error,
    );
    trackMetric(emailSendMetric('AccountExistsWithoutPassword', 'Failure'));
    return handleError(error as IDAPIError);
  }
};

export const sendCreatePasswordEmail = async (
  email: string,
  ip: string,
  trackingParams: IdApiQueryParams,
  ophanTrackingConfig?: OphanConfig,
) => {
  const options = APIPostOptions({
    'email-address': email,
  });
  try {
    const { returnUrl, ref, refViewId, componentEventParams } = trackingParams;
    await idapiFetch({
      path: '/user/send-create-password-account-exists-email',
      options: APIAddClientAccessToken(options, ip),
      queryParams: { returnUrl, ref, refViewId, componentEventParams },
    });
    sendOphanInteractionEventServer(
      {
        component: 'email-send',
        value: 'create-password-account-exists',
      },
      ophanTrackingConfig,
    );
    trackMetric(emailSendMetric('CreatePassword', 'Success'));
  } catch (error) {
    logger.error(
      `IDAPI Error send create password email '/user/send-create-password-account-exists-email'`,
      error,
    );
    trackMetric(emailSendMetric('CreatePassword', 'Failure'));
    return handleError(error as IDAPIError);
  }
};
