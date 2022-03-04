import { Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';

interface IdapiCookie {
  key: string;
  value: string;
  sessionCookie?: boolean;
}

export interface IdapiCookies {
  values: Array<IdapiCookie>;
  expiresAt: string;
}

const { baseUri, isHttps } = getConfiguration();

export const setIDAPICookies = (res: Response, cookies: IdapiCookies) => {
  const { values, expiresAt } = cookies;
  // the baseUri is profile.theguardian.com so we strip the 'profile' as the cookie domain should be .theguardian.com
  // we also remove the port after the ':' to make it work in localhost for development and testing
  const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;

  values.forEach(({ key, value, sessionCookie = false }) => {
    res.cookie(key, value, {
      domain,
      expires: sessionCookie ? undefined : new Date(expiresAt),
      httpOnly: !['GU_U', 'GU_SO'].includes(key), // unless GU_U/GU_SO cookie, set to true
      secure: isHttps && key !== 'GU_U', // unless GU_U cookie, set to isHttps (set to true, except in local dev)
      sameSite: 'lax',
      path: '/',
    });
  });
};

const IDAPICookieList: string[] = [
  'GU_U',
  'SC_GU_U',
  'SC_GU_LA',
  'SC_GU_RP',
  'GU_PROFILE_CSRF',
  'GU_ID_CSRF',
];

export const clearIDAPICookies = (res: Response) => {
  // the baseUri is profile.theguardian.com so we strip the 'profile' as the cookie domain should be .theguardian.com
  // we also remove the port after the ':' to make it work in localhost for development and testing
  const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;
  IDAPICookieList.forEach((key) => {
    // Web browsers and other compliant clients will only clear the cookie if the given options is identical to those given to res.cookie(), excluding expires and maxAge, so match to options in setIDAPICookies method.
    res.clearCookie(key, {
      domain,
      httpOnly: !['GU_U', 'GU_SO'].includes(key), // unless GU_U/GU_SO cookie, set to true
      secure: isHttps && key !== 'GU_U', // unless GU_U cookie, set to isHttps (set to true, except in local dev)
      sameSite: 'lax',
      path: '/',
    });
  });
};
