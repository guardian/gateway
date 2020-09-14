import { idapiFetch, APIGetOptions } from '../APIFetch';
import { NewslettersErrors } from '@/shared/model/Errors';
import { logger } from '@/server/lib/logger';
import { NewsLetter } from '@/shared/model/Newsletter';

const API_ROUTE = '/newsletters';

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
      API_ROUTE,
      options,
    )) as NewsletterAPIResponse[]).map(responseToEntity);
  } catch (e) {
    logger.error(e.toString());
    return handleError();
  }
};
