import {
  idapiFetch,
  APIPatchOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  APIGetOptions,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/logger';
import { ConsentsErrors } from '@/shared/model/Errors';
import { Consent } from '@/shared/model/Consent';
import { UserConsent } from '@/shared/model/User';
import { IdapiError } from '@/server/models/Error';
import { ApiRoutes } from '@/shared/model/Routes';

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
  const url = `${ApiRoutes.CONSENTS}`;
  const options = APIGetOptions();
  try {
    return ((await idapiFetch(url, options)) as ConsentAPIResponse[]).map(
      responseToEntity,
    );
  } catch (error) {
    logger.error(`IDAPI Error consents read ${url}`, error);
    return handleError();
  }
};

export const update = async (
  ip: string,
  sc_gu_u: string,
  payload: UserConsent[],
) => {
  const url = `${ApiRoutes.USERS}${ApiRoutes.ME}${ApiRoutes.CONSENTS}`;
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPatchOptions(payload), ip),
    sc_gu_u,
  );
  try {
    await idapiFetch(url, options);
    return;
  } catch (error) {
    logger.error(`IDAPI Error consents update ${url}`, error);
    return handleError();
  }
};
