import okta from '@okta/okta-sdk-nodejs';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { Client } from '@okta/okta-sdk-nodejs/src/types/client';

export const oktaClient = (): Client => {
  const { orgUrl, token } = getConfiguration().okta;
  return new okta.Client({ orgUrl, token });
};

export const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
