import {
  idapiFetch,
  APIGetOptions,
  APIPatchOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
} from '../APIFetch';
import { NewslettersErrors } from '@/shared/model/Errors';
import { NewsLetter, NewsletterPatch } from '@/shared/model/Newsletter';
import { logger } from '../logger';

const API_ROUTE = '/users/me/newsletters';

interface NewsletterAPIResponse {
  id: string;
  theme: string;
  name: string;
  description: string;
  frequency: string;
  subscribed: boolean;
  exactTargetListId: number;
}

const handleError = () => {
  throw { message: NewslettersErrors.GENERIC, status: 500 };
};

const responseToEntity = (newsletter: NewsletterAPIResponse): NewsLetter => {
  const { name, description, frequency, exactTargetListId } = newsletter;
  return {
    id: exactTargetListId.toString(),
    description,
    name,
    frequency,
  };
};

export const read = async (): Promise<NewsLetter[]> => {
  const options = APIGetOptions();
  try {
    return ((await idapiFetch(
      '/newsletters',
      options,
    )) as NewsletterAPIResponse[]).map(responseToEntity);
  } catch (e) {
    logger.error(e);
    return handleError();
  }
};

export const update = async (
  ip: string,
  sc_gu_u: string,
  payload: NewsletterPatch[],
) => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIPatchOptions(payload), ip),
    sc_gu_u,
  );

  try {
    await idapiFetch(API_ROUTE, options);
    return;
  } catch (e) {
    logger.error(e);
    return handleError();
  }
};

interface Subscription {
  listId: number;
}

export const readUserNewsletters = async (ip: string, sc_gu_u: string) => {
  const options = APIForwardSessionIdentifier(
    APIAddClientAccessToken(APIGetOptions(), ip),
    sc_gu_u,
  );

  try {
    return (
      await idapiFetch(API_ROUTE, options)
    ).result.subscriptions.map((s: Subscription) => s.listId.toString());
  } catch (e) {
    logger.error(e);
    return handleError();
  }
};
