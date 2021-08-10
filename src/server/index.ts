import { default as express, Express } from 'express';
import { logger } from '@/server/lib/logger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { applyMiddleware } from '@/server/lib/middleware';
import { createServer } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

async function createS() {
  const { port } = getConfiguration();
  const server: Express = express();

  const vite = await createServer({
    root: process.cwd(),
    server: {
      middlewareMode: 'ssr',
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100,
      },
    },
    resolve: { alias: [{ find: '@', replacement: '/src' }] },
    plugins: [reactRefresh()],
    esbuild: {
      jsxFactory: `jsx`,
      jsxInject: `import { jsx } from '@emotion/react'`,
    },
  });
  server.use(vite.middlewares);
  applyMiddleware(server);

  server.set('vite', vite);
  server.listen(port);
  logger.info(`server running on port ${port}`);
}

createS();
