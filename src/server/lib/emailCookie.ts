import { Request } from 'express';
import { readEncryptedStateCookie } from './encryptedStateCookie';

// this method reads from the two places in cookies where an email may be set
// either from the GU_email cookie or set by gateway
export const readEmailCookie = (req: Request): string | undefined =>
  readEncryptedStateCookie(req)?.email;
