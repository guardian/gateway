/* eslint-disable functional/immutable-data */
import { Issuer, Client, custom } from 'openid-client';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { Routes } from '@/shared/model/Routes';
import { httpsAgent } from '@/server/lib/devHttpsAgent';
import { ResponseWithRequestState } from '@/server/models/Express';
import { logger } from '@/server/lib/logger';

interface AuthorizationState {
  nonce: string;
  returnUrl: string;
}

const { oktaDomain, oktaClientId, oktaClientSecret } = getConfiguration();

// An agent to use with http calls to disable ssl verification in DEV only
// for *.thegulocal.com domains
custom.setHttpOptionsDefaults({
  agent: {
    https: httpsAgent,
  },
});
class OktaOIDCHandler {
  private issuer!: Issuer<Client>;
  private client!: Client;

  get Issuer() {
    if (!this.issuer) {
      throw new Error(
        'Issuer not found. Did you call the `instantiate` method first?',
      );
    }
    return this.issuer;
  }

  get Client() {
    if (!this.client) {
      throw new Error(
        'Client not found. Did you call the `instantiate` method first?',
      );
    }
    return this.client;
  }

  async instantiate() {
    try {
      const issuer = await Issuer.discover(oktaDomain);
      const client = new issuer.Client({
        client_id: oktaClientId,
        client_secret: oktaClientSecret,
        redirect_uris: [`${getProfileUrl()}${Routes.OAUTH_CALLBACK}`],
      });

      this.issuer = issuer;
      this.client = client;
    } catch (error) {
      throw error;
    }
  }
}

export const OktaOIDC = new OktaOIDCHandler();

const generateNonce = (bytes = 16): string =>
  randomBytes(bytes).toString('hex');

export const generateAuthorizationState = (
  returnUrl: string,
): AuthorizationState => ({
  nonce: generateNonce(),
  returnUrl,
});

export const setAuthorizationStateCookie = (
  state: AuthorizationState,
  res: ResponseWithRequestState,
) => {
  try {
    res.cookie(
      'oidc_auth_state',
      Buffer.from(JSON.stringify(state)).toString('base64'),
      {
        httpOnly: true,
        secure: true,
        signed: true,
      },
    );
  } catch (error) {
    logger.warn(error);
  }
};

export const getAuthorizationStateCookie = (
  req: Request,
): AuthorizationState | null => {
  const stateCookie = req.signedCookies.oidc_auth_state;

  if (!stateCookie) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(stateCookie, 'base64').toString('utf-8'));
  } catch (error) {
    logger.warn(error);
    return null;
  }
};

export const checkAuthorizationStateNonce = (
  nonceFromResponse: string,
  authorizationState: AuthorizationState,
): boolean => nonceFromResponse === authorizationState.nonce;
