import { idapiFetch, APIGetOptions } from '../APIFetch';
import { NewslettersErrors } from '@/shared/model/Errors';

const API_ROUTE = '/newsletters';

export interface NewsLetter {
  id: string;
  description: string;
  frequency?: string;
  name: string;
}

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
  throw NewslettersErrors.GENERIC;
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
    console.error(e);
    return handleError();
  }
};
