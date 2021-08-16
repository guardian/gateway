const dotenv = require('dotenv');

dotenv.config();

const define = {};

for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

require('esbuild').build({
  entryPoints: ['./src/server/index.ts'],
  bundle: true,
  platform: 'node',
  external: ['fsevents', 'rollup', 'esbuild', 'vite', 'react-refresh'],
  outdir: 'build',
  target: 'node10.4',
  loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.js': 'jsx' },
  jsxFactory: 'jsx',
  inject: ['./react-shim.js'],
  define,
  watch: {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded:', result);
    },
  },
});
