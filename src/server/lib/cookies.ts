import { Request, Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from './logger';

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

export const setGUEmailCookie = (res: Response, email: string) => {
  // We set this cookie so that the subsequent email sent page knows which email address was used
  res.cookie(
    'GU_email',
    Buffer.from(JSON.stringify(email)).toString('base64'),
    // We check if we're running locally here to make testing easier
    {
      httpOnly: !baseUri.includes('localhost'),
      secure: !baseUri.includes('localhost'),
      signed: !baseUri.includes('localhost'),
      sameSite: 'strict',
    },
  );
};

export const readGUEmailCookie = (req: Request): string | undefined => {
  // Read the users email from the GU_email cookie that was set when they posted the previous page
  const emailCookie = baseUri.includes('localhost')
    ? req.cookies['GU_email']
    : req.signedCookies['GU_email'];

  try {
    return JSON.parse(Buffer.from(emailCookie, 'base64').toString('utf-8'));
  } catch (error) {
    logger.error(
      `Error parsing cookie with length ${
        emailCookie ? emailCookie.length : 'undefined'
      }`,
    );
  }
};
