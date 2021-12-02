import { IdapiError } from '@/server/models/Error';
import { EmailType } from '@/shared/model/EmailType';
import { IdapiErrorMessages, RegistrationErrors } from '@/shared/model/Errors';
import { getConfiguration } from '../getConfiguration';
import {
  APIAddClientAccessToken,
  APIPostOptions,
  IDAPIError,
  idapiFetch,
} from '../IDAPIFetch';
import { logger } from '../logger';
import { trackMetric } from '../trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';

const { defaultReturnUri } = getConfiguration();

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.INVALID_EMAIL_ADDRESS:
        throw new IdapiError({
          message: RegistrationErrors.EMAIL_INVALID,
          status,
        });
      default:
        break;
    }
  }

  throw new IdapiError({ message: RegistrationErrors.GENERIC, status });
};

export const guest = async (
  email: string,
  ip: string,
  returnUrl?: string,
  refViewId?: string,
  ref?: string,
): Promise<EmailType> => {
  const options = APIPostOptions({
    primaryEmailAddress: email,
  });

  try {
    await idapiFetch({
      path: '/guest',
      options: APIAddClientAccessToken(options, ip),
      queryParams: {
        accountVerificationEmail: true,
        returnUrl: returnUrl || defaultReturnUri,
        ref,
        refViewId,
      },
    });
    trackMetric(emailSendMetric('AccountVerification', 'Success'));
    return EmailType.ACCOUNT_VERIFICATION;
  } catch (error) {
    logger.error(
      `IDAPI Error: guest account creation '/guest?accountVerificationEmail=true'}`,
      error,
    );
    trackMetric(emailSendMetric('AccountVerification', 'Failure'));
    return handleError(error as IDAPIError);
  }
};
