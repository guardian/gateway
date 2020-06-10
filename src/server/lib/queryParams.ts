import { getConfiguration } from '@/server/lib/configuration';
import { QueryParams } from '@/server/models/QueryParams';

const validHostnames = [
  '.theguardian.com',
  '.code.dev-theguardian.com',
  '.thegulocal.com',
];

const invalidPaths = ['/signin', '/register'];

const { defaultReturnUri } = getConfiguration();

const validateReturnUrl = (returnUrl = ''): string => {
  try {
    const url = new URL(returnUrl);

    // check the hostname is valid
    if (!validHostnames.some(hostname => url.hostname.endsWith(hostname))) {
      throw 'Invalid hostname';
    }

    // check the pathname is valid
    if (invalidPaths.some(path => url.pathname.startsWith(path))) {
      throw 'Invalid pathname';
    }

    return `https://${url.hostname}${url.pathname}`;
  } catch (error) {
    // error parsing url so return the default
    return defaultReturnUri;
  }
};

export const parseExpressQueryParams = ({
  returnUrl,
}: {
  returnUrl?: string;
}): QueryParams => {
  return {
    returnUrl: validateReturnUrl(returnUrl),
  };
};
