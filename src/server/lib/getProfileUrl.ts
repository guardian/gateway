import { getConfiguration } from '@/server/lib/getConfiguration';

const { stage, baseUri } = getConfiguration();

export const getProfileUrl = (): string => {
  switch (stage) {
    case 'CODE':
    case 'PROD':
      if (baseUri.includes('localhost')) {
        return `http://${baseUri}`;
      }
      return `https://${baseUri}`;
    default:
      if (baseUri.includes('localhost')) {
        return `http://${baseUri}`;
      }
      return `https://${baseUri}`;
  }
};
