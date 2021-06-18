/* eslint-disable functional/immutable-data */
import { Issuer, Client, custom } from 'openid-client';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { Routes } from '@/shared/model/Routes';
import { httpsAgent } from '@/server/lib/devHttpsAgent';

// An agent to use with http calls to disable ssl verification in DEV only
// for *.thegulocal.com domains
custom.setHttpOptionsDefaults({
  agent: {
    https: httpsAgent,
  },
});

const { oktaDomain, oktaClientId, oktaClientSecret } = getConfiguration();

class OktaOIDC {
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

export default new OktaOIDC();
