import { QueryParams } from '@/shared/model/QueryParams';
import { validateReturnUrl, validateRefUrl } from '@/server/lib/validateUrl';
import { validateClientId } from '@/server/lib/validateClientId';
import { FederationErrors } from '@/shared/model/Errors';

const isStringBoolean = (maybeBoolean?: string): boolean | undefined => {
  if (!maybeBoolean) {
    return undefined;
  }

  if (maybeBoolean === 'true') {
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

const validateError = (error?: string): string | undefined => {
  const validErrorCodes = [FederationErrors.SOCIAL_SIGNIN_BLOCKED];
  return validErrorCodes.find((code) => code === error);
};

export const parseExpressQueryParams = (
  method: string,
  {
    returnUrl,
    clientId,
    emailVerified,
    emailSentSuccess,
    csrfError,
    refViewId,
    ref,
    encryptedEmail,
    error,
  }: {
    returnUrl?: string;
    clientId?: string;
    emailVerified?: string;
    emailSentSuccess?: string;
    csrfError?: string;
    refViewId?: string;
    ref?: string;
    encryptedEmail?: string;
    error?: string;
  },
): QueryParams => {
  return {
    returnUrl: validateReturnUrl(returnUrl),
    clientId: validateClientId(clientId),
    emailVerified: isStringBoolean(emailVerified),
    emailSentSuccess: isStringBoolean(emailSentSuccess),
    csrfError: validateCsrfError(method, csrfError),
    refViewId,
    ref: ref && validateRefUrl(ref),
    encryptedEmail,
    error: validateError(error),
  };
};

export const addReturnUrlToPath = (path: string, returnUrl: string): string => {
  const divider = path.includes('?') ? '&' : '?';
  return `${path}${divider}returnUrl=${encodeURIComponent(returnUrl)}`;
};
