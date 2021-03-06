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

const handleError = (): never => {
  throw { message: ConsentsErrors.GENERIC, status: 500 };
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
  const url = '/consents';
  const options = APIGetOptions();
  try {
    return ((await idapiFetch(url, options)) as ConsentAPIResponse[]).map(
      responseToEntity,
    );
  } catch (e) {
    logger.error(`IDAPI Error consents read ${url}`, e);
    return handleError();
  }
};

export const update = async (
  ip: string,
  sc_gu_u: string,
  payload: UserConsent[],
) => {
  const url = '/users/me/consents';
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPatchOptions(payload), ip),
    sc_gu_u,
  );
  try {
    await idapiFetch(url, options);
    return;
  } catch (e) {
    logger.error(`IDAPI Error consents update ${url}`, e);
    return handleError();
  }
};
