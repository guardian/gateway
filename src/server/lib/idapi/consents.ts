import {
  idapiFetch,
  APIPatchOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  APIGetOptions,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { ConsentsErrors } from '@/shared/model/Errors';
import { Consent } from '@/shared/model/Consent';
import { UserConsent } from '@/shared/model/User';
import { IdapiError } from '@/server/models/Error';
import { read as getUser } from './user';

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

const read = async (): Promise<Consent[]> => {
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

export const getUserConsentsForPage = async (
  pageConsents: string[],
  ip: string,
  sc_gu_u: string,
): Promise<Consent[]> => {
  const allConsents = await read();
  const userConsents = (await getUser(ip, sc_gu_u)).consents;

  return pageConsents
    .map((id) => allConsents.find((consent) => consent.id === id))
    .map((consent) => {
      if (consent) {
        let updated = consent;
        const userConsent = userConsents.find((uc) => uc.id === consent.id);

        if (userConsent) {
          updated = {
            ...updated,
            consented: userConsent.consented,
          };
        }

        return updated;
      }
    })
    .filter(Boolean) as Consent[];
};

export const getConsentValueFromRequestBody = (
  key: string,
  body: { [key: string]: string },
): boolean => {
  if (body[key] === undefined || typeof body[key] !== 'string') {
    return false;
  }

  switch (body[key]) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return !!body[key];
  }
};
