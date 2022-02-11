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

const { baseUri } = getConfiguration();

export const setIDAPICookies = (res: Response, cookies: IdapiCookies) => {
  const { values, expiresAt } = cookies;

  values.forEach(({ key, value, sessionCookie = false }) => {
    res.cookie(key, value, {
      // base uri in format profile.theguardian.com, whereas we want cookie domain theguardian.com
      // so replace profile. string in baseUri with empty string, rather than having to set another variable
      domain: `${baseUri.replace('profile.', '')}`,
      expires: sessionCookie ? undefined : new Date(expiresAt),
      httpOnly: !['GU_U', 'GU_SO'].includes(key), // unless GU_U/GU_SO cookie, set to true
      secure: key !== 'GU_U', // unless GU_U cookie, set to true
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
  IDAPICookieList.forEach((key) => {
    // Web browsers and other compliant clients will only clear the cookie if the given options is identical to those given to res.cookie(), excluding expires and maxAge, so match to options in setIDAPICookies method.
    res.clearCookie(key, {
      // base uri in format profile.theguardian.com, whereas we want cookie domain theguardian.com
      // so replace profile. string in baseUri with empty string, rather than having to set another variable
      domain: `${baseUri.replace('profile.', '')}`,
      httpOnly: !['GU_U', 'GU_SO'].includes(key), // unless GU_U/GU_SO cookie, set to true
      secure: key !== 'GU_U', // unless GU_U cookie, set to true
      sameSite: 'lax',
      path: '/',
    });
  });
};
