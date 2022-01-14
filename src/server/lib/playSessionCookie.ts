// For use during migration, the idea is to remove this functionality once all Play functionality has been
// moved.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { verify as verifyJWT } from 'jsonwebtoken';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';

const { playSessionCookieSecret, stage } = getConfiguration();

const getCookieFromPlaySession: (req: Request) => any = (req) => {
  if (req.cookies['PLAY_SESSION_2']) {
    try {
      // Ignored expired jwt in DEV/CODE for tests which rely on a hardcoded value.
      const jwtOptions = {
        ignoreExpiration: stage === 'DEV' || stage === 'CODE',
      };

      const session: any = verifyJWT(
        req.cookies['PLAY_SESSION_2'],
        playSessionCookieSecret,
        jwtOptions,
      );
      return session.data;
    } catch (error) {
      logger.warn('getCookieFromPlaySession failed', error);
    }
  }
};

export const getEmailFromPlaySessionCookie: (
  req: Request,
) => string | undefined = (req) => {
  const cookie = getCookieFromPlaySession(req);
  return cookie?.email;
};
