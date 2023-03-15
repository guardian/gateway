import { getConfiguration } from '@/server/lib/getConfiguration';

export const defaultHeaders = (ip: string) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-Forwarded-For': ip,
});

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
