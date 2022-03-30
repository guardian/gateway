import path from 'path';
import { existsSync, readFileSync } from 'fs';
import validateRateLimiterConfiguration from './rate-limit/configurationValidator';

const tryReadRateLimitConfigFile = () => {
  const readAndParseFile = (path: string) => {
    if (existsSync(path)) {
      const configJson = readFileSync(path, 'utf-8');
      if (configJson) {
        return JSON.parse(configJson);
      }
    }
    return undefined;
  };

  // Try relative to the source file first, fall back to current directory if not found.
  const primaryPath = path.resolve(__dirname, '.ratelimit.json');
  const fallbackPath = '.ratelimit.json';

  const parsedFile =
    readAndParseFile(primaryPath) ?? readAndParseFile(fallbackPath);

  return parsedFile;
};

const tryReadEnvironmentVariable = () => {
  const configJson = process.env.RATE_LIMITER_CONFIG || '';

  if (configJson) {
    return JSON.parse(configJson);
  }

  return undefined;
};

const loadRateLimiterConfiguration = () => {
  // Env var takes precedence over file system configuration file.
  const unvalidatedConfig =
    tryReadEnvironmentVariable() ?? tryReadRateLimitConfigFile();

  // We validate the loaded JSON object to ensure that it follows the rate limit config schema
  return validateRateLimiterConfiguration(unvalidatedConfig);
};

const validatedRateLimiterConfiguration = loadRateLimiterConfiguration();
export default validatedRateLimiterConfiguration;
