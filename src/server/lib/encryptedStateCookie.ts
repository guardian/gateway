import { Request, Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from './serverSideLogger';
import { decrypt, encrypt } from './crypto';
import { EncryptedState } from '@/shared/model/EncryptedState';

const { baseUri } = getConfiguration();

export const setEncryptedStateCookie = (
  res: Response,
  state: EncryptedState,
) => {
  const encrypted = encrypt(JSON.stringify(state));

  return res.cookie(
    'GU_GATEWAY_STATE',
    encrypted,
    // We check if we're running locally here to make testing easier
    {
      httpOnly: !baseUri.includes('localhost'),
      secure: !baseUri.includes('localhost'),
      signed: !baseUri.includes('localhost'),
      sameSite: 'strict',
    },
  );
};

export const readEncryptedStateCookie = (
  req: Request,
): EncryptedState | undefined => {
  const encryptedCookie = baseUri.includes('localhost')
    ? req.cookies['GU_GATEWAY_STATE']
    : req.signedCookies['GU_GATEWAY_STATE'];

  try {
    if (encryptedCookie) {
      const decrypted = decrypt(encryptedCookie);
      return JSON.parse(decrypted);
    }
  } catch (error) {
    logger.error(
      `Error parsing cookie with length ${
        encryptedCookie ? encryptedCookie.length : 'undefined'
      }`,
    );
  }
};
