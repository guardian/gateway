const dotenv = require('dotenv');

dotenv.config();

const define = {};

for (const k in process.env) {
  // eslint-disable-next-line functional/immutable-data
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

const watchMode = process.env['WATCH'];

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('esbuild').build({
  entryPoints: ['./src/server/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  external: ['fsevents', 'rollup', 'esbuild', 'react-refresh'],
  outfile: 'build/server.js',
  target: 'node10.4',
  loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.js': 'jsx' },
  jsxFactory: 'jsx',
  inject: ['./react-shim.js'],
  define,
  watch: watchMode
    ? {
        onRebuild(error, result) {
          if (error) console.error('watch build failed:', error);
          else console.log('watch build succeeded:', result);
        },
      }
    : false,
});
