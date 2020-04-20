import { Configuration } from '@/server/models/Configuration';

export const getConfiguration = (): Configuration => {
  const port = process.env.PORT;

  if (!port) {
    throw Error('Port configuration missing.');
  }

  return {
    port: +port,
  };
};
