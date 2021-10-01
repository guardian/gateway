import { IdapiErrorMessages, RegistrationErrors } from '@/shared/model/Errors';
import {
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
  idapiFetch,
} from '../IDAPIFetch';
import { logger } from '../logger';
import {
  addRefToPath,
  addRefViewIdToPath,
  addReturnUrlToPath,
} from '../queryParams';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.INVALID_EMAIL_ADDRESS:
        throw { message: RegistrationErrors.EMAIL_BLANK, status };
      default:
        break;
    }
  }

  throw { message: RegistrationErrors.GENERIC, status };
};

export const guest = async (
  email: string,
  ip: string,
  returnUrl?: string,
  refViewId?: string,
  ref?: string,
) => {
  const url = '/guest?accountVerificationEmail=true';
  const options = APIPostOptions({
    primaryEmailAddress: email,
  });

  let path = url;

  if (returnUrl) {
    path = addReturnUrlToPath(path, returnUrl);
  }

  if (refViewId) {
    path = addRefViewIdToPath(path, refViewId);
  }

  if (ref) {
    path = addRefToPath(path, ref);
  }

  try {
    return await idapiFetch(path, APIAddClientAccessToken(options, ip));
  } catch (error) {
    logger.error(`IDAPI Error: guest account creation ${url}`, error);
    return handleError(error as IDAPIError);
  }
};
