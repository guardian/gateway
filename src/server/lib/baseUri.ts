import { getConfiguration } from '@/server/lib/configuration';

const { stage, baseUri } = getConfiguration();

export const getProfileUrl = (): string => {
  switch (stage) {
    case 'CODE':
    case 'PROD':
      return `https://${baseUri}`;
    default:
      if (baseUri.includes('localhost')) {
        return `http://${baseUri}`;
      }
      return `https://${baseUri}`;
  }
};
