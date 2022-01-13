import { getConfiguration } from '@/server/lib/getConfiguration';

export const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export const authorizationHeader = () => {
  const { okta } = getConfiguration();
  return {
    Authorization: `SSWS ${okta.token}`,
  };
};
