import path from 'path';
import fs from 'fs';
import { logger } from '@/server/lib/serverSideLogger';

interface AssetsFile {
  runtime: {
    js: string;
  };
  main: {
    js: string;
  };
  vendors: {
    js: string;
  };
}

interface Assets {
  runtime: string;
  main: string;
  vendors: string;
}

export const getAssets = (isLegacy = false): Assets => {
  try {
    const assetsFilePath = `${path.resolve(__dirname)}/${
      isLegacy ? 'legacy.' : ''
    }webpack-assets.json`;
    if (!fs.existsSync(assetsFilePath)) {
      throw new Error('Assets file does not exist');
    }

    const assetsFile = fs.readFileSync(assetsFilePath, 'utf-8');
    const parsedAssetsFile = JSON.parse(assetsFile) as AssetsFile;

    const main = parsedAssetsFile.main?.js;
    const vendors = parsedAssetsFile.vendors?.js;
    const runtime = parsedAssetsFile.runtime?.js;

    if (!main || !vendors || !runtime) {
      throw new Error('Missing field from assets file');
    }

    return {
      main,
      vendors,
      runtime,
    };
  } catch (e) {
    logger.error('Error retrieving assets', e);
    throw new Error('Invalid assets file');
  }
};
