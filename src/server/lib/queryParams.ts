import { QueryParams } from '@/shared/model/QueryParams';
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
