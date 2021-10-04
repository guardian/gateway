import { Request, Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from './logger';
import { getEmailFromPlaySessionCookie } from './playSessionCookie';

const { baseUri } = getConfiguration();

// We set this cookie so that the subsequent email sent page knows which email address was used
export const setGUEmailCookie = (res: Response, email: string) => {
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

// Read the users email from the GU_email cookie that was set when they posted the previous page
export const readGUEmailCookie = (req: Request): string | undefined => {
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

// this method reads from the two places in cookies where an email may be set
// either from the GU_email cookie, set by gateway, or PLAY_SESSION_2 cookie
// set by identity-frontend
// by default we first check for the gateway cookie, followed by the play cookie
export const readEmailCookie = (req: Request): string | undefined =>
  readGUEmailCookie(req) || getEmailFromPlaySessionCookie(req);
