import { QueryParams } from '@/server/models/QueryParams';
import { validateReturnUrl } from '@/server/lib/returnUrl';
import { validateClientId } from '@/server/lib/clientId';

export const parseExpressQueryParams = ({
  returnUrl,
  clientId,
}: {
  returnUrl?: string;
  clientId?: string;
}): QueryParams => {
  return {
    returnUrl: validateReturnUrl(returnUrl),
    clientId: validateClientId(clientId),
  };
};
