import { Agent } from 'https';
import { getConfiguration } from './getConfiguration';

const { stage } = getConfiguration();

// An agent to use with node-fetch to disable ssl verification
// on fetch calls for domains with an invalid certificate
// e.g. for *.thegulocal.com
// for DEV environment only
// in CODE and PROD it behaves as expected, i.e reject invalid
// certificate
export const httpsAgent = new Agent({
  rejectUnauthorized: stage !== 'DEV',
});
