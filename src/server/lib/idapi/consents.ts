import {
  idapiFetch,
  APIPatchOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
} from '../APIFetch';
import { logger } from '../logger';
import { ConsentsErrors } from '@/shared/model/Errors';
import { Consent } from '@/shared/model/Consent';

const API_ROUTE = '/users/me/consents';

const handleError = () => {
  throw ConsentsErrors.GENERIC;
};

export const update = async (
  ip: string,
  sc_gu_u: string,
  payload: Consent[],
) => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPatchOptions(payload), ip),
    sc_gu_u,
  );
  try {
    await idapiFetch(API_ROUTE, options);
    return;
  } catch (e) {
    logger.error(e.toString());
    return handleError();
  }
};
