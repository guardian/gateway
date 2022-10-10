import { getConfiguration } from '@/server/lib/getConfiguration';

// valid web hostnames
const validHostnames = [
  '.theguardian.com',
  '.code.dev-theguardian.com',
  '.thegulocal.com',
];

const invalidPaths = ['/signout'];

const { defaultReturnUri } = getConfiguration();

export const validateReturnUrl = (returnUrl = ''): string => {
  try {
    // we decode the returnUrl as we cant know for sure if it's been encoded or not
    // so decode just to be safe
    const url = new URL(decodeURIComponent(returnUrl));

    //This guards against invalid protocol, including app ones
    if (url.protocol !== 'https:') {
      throw 'Invalid protocol';
    }

    // check the hostname is valid
    if (!validHostnames.some((hostname) => url.hostname.endsWith(hostname))) {
      throw 'Invalid hostname';
    }

    // if the hostname is on the profile subdomain, we also want to check the pathname is valid
    // and keep any query params
    if (url.hostname.startsWith('profile.')) {
      // then check the pathname is valid
      if (invalidPaths.some((path) => url.pathname.startsWith(path))) {
        throw 'Invalid pathname';
      }

      // and return the url if so, which will have the query params
      return url.href;
    }

    return `https://${url.hostname}${url.pathname}`;
  } catch (error) {
    // error parsing url so return the default
    return defaultReturnUri;
  }
};

export const validateRefUrl = (ref = ''): string | undefined => {
  try {
    // we decode the ref as we cant know for sure if it's been encoded or not
    // so decode just to be safe
    const url = new URL(decodeURIComponent(ref));

    // check the hostname is valid
    if (!validHostnames.some((hostname) => url.hostname.endsWith(hostname))) {
      throw 'Invalid hostname';
    }

    return `https://${url.hostname}${url.pathname}`;
  } catch (error) {
    // error parsing url so return the default
    return;
  }
};
