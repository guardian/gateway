import { getConfiguration } from '@/server/lib/getConfiguration';

// valid web hostnames
const validHostnames = [
  '.theguardian.com',
  '.code.dev-theguardian.com',
  '.thegulocal.com',
  'profile.theguardian.com',
];

// valid app custom url schemes
// TODO: update documentation on how to add new app clients
export const validAppProtocols = [
  // android live app
  'com.guardian:',
  // android live app debug
  'com.guardian.debug:',
  // iOS live app
  'uk.co.guardian.iphone2:',
  // iOS live app debug
  'uk.co.guardian.iphone2.debug:',
];

// valid app custom pathnames
const validAppPathnames = ['/authentication/callback'];

const invalidPaths = ['/signin', '/register'];

const { defaultReturnUri } = getConfiguration();

export const validateReturnUrl = (returnUrl = ''): string => {
  try {
    // we decode the returnUrl as we cant know for sure if it's been encoded or not
    // so decode just to be safe
    const url = new URL(decodeURIComponent(returnUrl));

    // we first want to check for an app redirect using the x-gu: custom protocol
    // and identity hostname, with the callback path
    if (
      validAppProtocols.includes(url.protocol) &&
      validAppPathnames.includes(url.pathname) &&
      validHostnames.includes(url.hostname)
    ) {
      // return the uri without query params
      return `${url.protocol}//${url.hostname}${url.pathname}`;
    }

    //This guards against invalid protocol, including app ones
    if (url.protocol !== 'https:') {
      throw 'Invalid protocol';
    }

    // check the hostname is valid
    if (!validHostnames.some((hostname) => url.hostname.endsWith(hostname))) {
      throw 'Invalid hostname';
    }

    // check the pathname is valid
    if (invalidPaths.some((path) => url.pathname.startsWith(path))) {
      throw 'Invalid pathname';
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
