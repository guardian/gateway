import { Request, Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from './logger';
import { decrypt, encrypt } from './crypto';

interface EncryptedState {
  email?: string;
}

const { baseUri } = getConfiguration();

export const setEncryptedStateCookie = (
  res: Response,
  state: EncryptedState,
) => {
  return res.cookie(
    'GU_GATEWAY_STATE',
    encrypt(JSON.stringify(state)),
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
    return JSON.parse(decrypt(encryptedCookie));
  } catch (error) {
    console.log(error);
    logger.error(
      `Error parsing cookie with length ${
        encryptedCookie ? encryptedCookie.length : 'undefined'
      }`,
    );
  }
};
