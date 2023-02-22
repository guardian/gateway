import {
  APIAddClientAccessToken,
  APIPostOptions,
  idapiFetch,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
import { UnsubscribeErrors } from '@/shared/model/Errors';

type EmailType = 'newsletter' | 'marketing';

interface UnsubscribeData {
  emailId: string;
  userId: string;
  timestamp: number;
}

export const isValidEmailType = (emailType: string): emailType is EmailType => {
  return ['newsletter', 'marketing'].includes(emailType);
};

export const parseUnsubscribeData = (data: string): UnsubscribeData => {
  const [emailId, userId, timestamp] = data.split(':');

  if (!emailId || !userId || !timestamp) {
    throw new Error('Invalid unsubscribe data');
  }

  return {
    emailId,
    userId,
    timestamp: +timestamp,
  };
};

const handleError = ({ status = 500 }: IDAPIError) => {
  throw new IdapiError({ message: UnsubscribeErrors.GENERIC, status });
};

export const unsubscribe = async (
  emailType: EmailType,
  unsubscribeData: UnsubscribeData,
  token: string,
  ip: string,
  request_id?: string,
): Promise<unknown> => {
  const body = {
    emailType,
    ...unsubscribeData,
    token,
  };

  const options = APIAddClientAccessToken(APIPostOptions(body), ip);

  try {
    await idapiFetch({
      path: `/unsubscribe`,
      options,
    });
  } catch (error) {
    logger.error(`IDAPI Error unsubscribe '/unsubscribe'`, error, {
      request_id,
    });
    return handleError(error as IDAPIError);
  }
};
