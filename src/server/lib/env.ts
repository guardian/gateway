import { resolve } from 'path';
import { config } from 'dotenv';

// attach environment variables in development
// opens .env file only on development, and if not using docker-compose as
// docker-compose automatically injects the environment variables from .env
if (process.env.NODE_ENV === 'development' && !process.env.IS_DOCKER) {
  config({ path: resolve(__dirname, '../.env') });
}
