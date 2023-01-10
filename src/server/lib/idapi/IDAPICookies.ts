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

export const setIDAPICookies = (
  res: Response,
  cookies: IdapiCookies,
  /* The last access cookie should only be updated when the user actively signs in
     as opposed to having their session refreshed automatically by browser.
  */
  doNotSetLastAccessCookie?: boolean,
) => {
  const { values, expiresAt } = cookies;
  // the baseUri is profile.theguardian.com so we strip the 'profile' as the cookie domain should be .theguardian.com
  // we also remove the port after the ':' to make it work in localhost for development and testing
  const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;

  values
    .filter(({ key }) => {
      // filter out last access cookie when doNotSetLastAccessCookie is true
      if (doNotSetLastAccessCookie && key == 'SC_GU_LA') {
        return false;
      } else {
        return true;
      }
    })
    .forEach(({ key, value, sessionCookie = false }) => {
      const expires: Date | undefined = (() => {
        if (key === 'SC_GU_LA') {
          // have SC_GU_LA cookie expire in 30 mins, despite the fact that it is a session cookie
          // this is to support the Native App logging in with an in-app browser, so the cookie
          // isn't immediately deleted when the in app browser is closed
          return new Date(Date.now() + 30 * 60 * 1000);
        }
        if (sessionCookie) {
          return undefined;
        }
        return new Date(expiresAt);
      })();

      res.cookie(key, value, {
        domain,
        expires,
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
