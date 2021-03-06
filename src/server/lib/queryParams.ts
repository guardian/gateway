import { QueryParams } from '@/shared/model/QueryParams';
import { validateReturnUrl } from '@/server/lib/validateReturnUrl';
import { validateClientId } from '@/server/lib/validateClientId';

const validateEmailVerified = (emailVerified?: string): boolean | undefined => {
  if (!emailVerified) {
    return undefined;
  }

  if (emailVerified === 'true') {
    return true;
  }

  return false;
};

const validateCsrfError = (
  method: string,
  csrfError?: string,
): boolean | undefined => {
  // The csrfError parameter causes the CSRF error message to be rendered
  // Only render CSRF error message for GET pages
  // On POST CSRF error, we redirect to the GET URL of the form with the CSRF error parameter
  if (method === 'GET' && csrfError === 'true') {
    return true;
  }
};

export const parseExpressQueryParams = (
  method: string,
  {
    returnUrl,
    clientId,
    emailVerified,
    csrfError,
  }: {
    returnUrl?: string;
    clientId?: string;
    emailVerified?: string;
    csrfError?: string;
  },
): QueryParams => {
  return {
    returnUrl: validateReturnUrl(returnUrl),
    clientId: validateClientId(clientId),
    emailVerified: validateEmailVerified(emailVerified),
    csrfError: validateCsrfError(method, csrfError),
  };
};

export const addReturnUrlToPath = (path: string, returnUrl: string): string => {
  const divider = path.includes('?') ? '&' : '?';
  return `${path}${divider}returnUrl=${encodeURIComponent(returnUrl)}`;
};
