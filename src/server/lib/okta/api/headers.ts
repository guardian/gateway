import { getConfiguration } from '@/server/lib/getConfiguration';

export const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/**
 * AuthorizationHeader
 *
 * @returns Authorization header with API token
 */
export const authorizationHeader = () => {
  const { okta } = getConfiguration();
  return {
    Authorization: `SSWS ${okta.token}`,
  };
};
