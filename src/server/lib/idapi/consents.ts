import {
  idapiFetch,
  APIPatchOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  APIGetOptions,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/winstonLogger';
import { ConsentsErrors } from '@/shared/model/Errors';
import { Consent } from '@/shared/model/Consent';
import { UserConsent } from '@/shared/model/User';
import { IdapiError } from '@/server/models/Error';

const handleError = (): never => {
  throw new IdapiError({ message: ConsentsErrors.GENERIC, status: 500 });
};

interface ConsentAPIResponse {
  id: string;
  isOptOut: boolean;
  isChannel: boolean;
  name: string;
  description: string;
}

const responseToEntity = (consent: ConsentAPIResponse): Consent => {
  const { name, description, id } = consent;
  return {
    id,
    description,
    name,
  };
};

export const read = async (): Promise<Consent[]> => {
  const options = APIGetOptions();
  try {
    return (
      (await idapiFetch({
        path: '/consents',
        options,
      })) as ConsentAPIResponse[]
    ).map(responseToEntity);
  } catch (error) {
    logger.error(`IDAPI Error consents read '/consents'`, error);
    return handleError();
  }
};

export const update = async (
  ip: string,
  sc_gu_u: string,
  payload: UserConsent[],
) => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPatchOptions(payload), ip),
    sc_gu_u,
  );
  try {
    await idapiFetch({
      path: '/users/me/consents',
      options,
    });
    return;
  } catch (error) {
    logger.error(`IDAPI Error consents update  '/users/me/consents'`, error);
    return handleError();
  }
};
