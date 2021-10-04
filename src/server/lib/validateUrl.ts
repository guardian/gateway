import { getConfiguration } from '@/server/lib/getConfiguration';
import { Routes } from '@/shared/model/Routes';

const validHostnames = [
  '.theguardian.com',
  '.code.dev-theguardian.com',
  '.thegulocal.com',
];

const invalidPaths = [Routes.SIGN_IN, Routes.REGISTRATION];

const { defaultReturnUri } = getConfiguration();

export const validateReturnUrl = (returnUrl = ''): string => {
  try {
    // we decode the returnUrl as we cant know for sure if it's been encoded or not
    // so decode just to be safe
    const url = new URL(decodeURIComponent(returnUrl));

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
    // we decode the returnUrl as we cant know for sure if it's been encoded or not
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
