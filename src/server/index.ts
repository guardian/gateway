import { default as express, Express } from 'express';
import { logger } from '@/server/lib/logger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { applyMiddleware } from '@/server/lib/middleware';
import OktaOIDC from '@/server/lib/okta/oidc';

const { port } = getConfiguration();

// the app is wrapped as an async immediately invoked function expression
// so we can bootstrap any asynchronous configuration, for example for the
// Okta OIDC Issuer and Client
(async () => {
  // instantiate the okta oidc issuer/client
  await OktaOIDC.instantiate();

  const server: Express = express();

  applyMiddleware(server);

  server.listen(port);
  logger.info(`server running on port ${port}`);
})();
