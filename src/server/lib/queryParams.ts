import { QueryParams } from '@/shared/model/QueryParams';
import { validateReturnUrl } from '@/server/lib/returnUrl';
import { validateClientId } from '@/server/lib/clientId';

const validateEmailVerified = (emailVerified?: string): boolean | undefined => {
  if (!emailVerified) {
    return undefined;
  }

  if (emailVerified === 'true') {
    return true;
  }

  return false;
};

export const parseExpressQueryParams = ({
  returnUrl,
  clientId,
  emailVerified,
}: {
  returnUrl?: string;
  clientId?: string;
  emailVerified?: string;
}): QueryParams => {
  return {
    returnUrl: validateReturnUrl(returnUrl),
    clientId: validateClientId(clientId),
    emailVerified: validateEmailVerified(emailVerified),
  };
};

export const addReturnUrlToPath = (path: string, returnUrl: string): string => {
  const divider = path.includes('?') ? '&' : '?';
  return `${path}${divider}returnUrl=${encodeURIComponent(returnUrl)}`;
};
