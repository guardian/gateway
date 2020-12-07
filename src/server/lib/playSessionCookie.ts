// For use during migration, the idea is to remove this functionality once all Play functionality has been
// moved.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { verify as verifyJWT } from 'jsonwebtoken';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/logger';

const { playSessionCookieSecret } = getConfiguration();

const getCookieFromPlaySession: (req: Request) => any = (req) => {
  if (req.cookies['PLAY_SESSION']) {
    try {
      const session: any = verifyJWT(
        req.cookies['PLAY_SESSION'],
        playSessionCookieSecret,
      );
      return session.data;
    } catch (error) {
      logger.warn(error);
    }
  }
};

export const getEmailFromPlaySessionCookie: (
  req: Request,
) => string | undefined = (req) => {
  const cookie = getCookieFromPlaySession(req);
  return cookie?.email;
};
