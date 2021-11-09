import { Request } from 'express';
import { readEncryptedStateCookie } from './encryptedStateCookie';
import { getEmailFromPlaySessionCookie } from './playSessionCookie';

// this method reads from the two places in cookies where an email may be set
// either from the GU_email cookie, set by gateway, or PLAY_SESSION_2 cookie
// set by identity-frontend
// by default we first check for the gateway cookie, followed by the play cookie
export const readEmailCookie = (req: Request): string | undefined =>
  readEncryptedStateCookie(req)?.email || getEmailFromPlaySessionCookie(req);
