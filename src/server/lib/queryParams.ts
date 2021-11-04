import {
  QueryParams,
  SafeQueryParams,
  UnsafeQueryParams,
} from '@/shared/model/QueryParams';
import { validateReturnUrl, validateRefUrl } from '@/server/lib/validateUrl';
import { validateClientId } from '@/server/lib/validateClientId';
import { FederationErrors } from '@/shared/model/Errors';
import { stringify } from 'query-string';

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
    csrfError,
    refViewId,
    ref,
    encryptedEmail,
    error,
  }: {
    returnUrl?: string;
    clientId?: string;
    emailVerified?: string;
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
    emailVerified: validateEmailVerified(emailVerified),
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

export const addRefViewIdToPath = (path: string, refViewId: string) => {
  const divider = path.includes('?') ? '&' : '?';
  return `${path}${divider}refViewId=${encodeURIComponent(refViewId)}`;
};

export const addRefToPath = (path: string, ref: string) => {
  const divider = path.includes('?') ? '&' : '?';
  return `${path}${divider}ref=${encodeURIComponent(ref)}`;
};

export const getSafeQueryParams = (params: QueryParams): SafeQueryParams => ({
  returnUrl: params.returnUrl,
  clientId: params.clientId,
  ref: params.ref,
  refViewId: params.refViewId,
});

export const addQueryParamsToPath = (
  path: string,
  params: QueryParams,
  unsafeParams?: UnsafeQueryParams,
): string => {
  const divider = path.includes('?') ? '&' : '?';
  const safeQueryString = stringify(getSafeQueryParams(params), {
    skipNull: true,
    skipEmptyString: true,
  });
  const unsafeQueryString = stringify(unsafeParams || {}, {
    skipNull: true,
    skipEmptyString: true,
  });
  return `${path}${divider}${safeQueryString}${
    unsafeQueryString ? `&${unsafeQueryString}` : ''
  }`;
};
