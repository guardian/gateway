import { Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';

interface IdapiCookie {
  key: string;
  value: string;
  sessionCookie?: boolean;
}

interface IdapiCookies {
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
      httpOnly: key !== 'GU_U', // unless GU_U cookie, set to true
      secure: key !== 'GU_U', // unless GU_U cookie, set to true
      sameSite: 'lax',
      path: '/',
    });
  });
};
