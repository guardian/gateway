import {
  idapiFetch,
  APIGetOptions,
  APIPatchOptions,
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
} from '@/server/lib/IDAPIFetch';
import { NewslettersErrors } from '@/shared/model/Errors';
import { NewsLetter, NewsletterPatch } from '@/shared/model/Newsletter';
import { logger } from '@/server/lib/winstonLogger';
import { IdapiError } from '@/server/models/Error';

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
  throw new IdapiError({ message: NewslettersErrors.GENERIC, status: 500 });
};

const responseToEntity = (newsletter: NewsletterAPIResponse): NewsLetter => {
  const { name, description, frequency, exactTargetListId, id } = newsletter;
  return {
    id: exactTargetListId.toString(),
    description,
    name,
    frequency,
    nameId: id,
  };
};

export const read = async (): Promise<NewsLetter[]> => {
  const options = APIGetOptions();
  try {
    return (
      (await idapiFetch({
        path: '/newsletters',
        options,
      })) as NewsletterAPIResponse[]
    ).map(responseToEntity);
  } catch (error) {
    logger.error(`IDAPI Error newsletters read '/newsletters'`, error);
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
    await idapiFetch({
      path: '/users/me/newsletters',
      options,
    });
    return;
  } catch (error) {
    logger.error(
      `IDAPI Error newsletters update '/users/me/newsletters'`,
      error,
    );
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
      await idapiFetch({
        path: '/users/me/newsletters',
        options,
      })
    ).result.subscriptions.map((s: Subscription) => s.listId.toString());
  } catch (error) {
    logger.error(
      `IDAPI Error readUserNewsletters '/users/me/newsletters'`,
      error,
    );
    return handleError();
  }
};
