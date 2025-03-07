/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const deepmerge = require('deepmerge');
const sharedLoader = require('../../.swcrc.config');

class BannerPlugin {
  constructor(options) {
    this.banner = options.banner;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(filename => {
          const asset = compilation.assets[filename];
          asset._value = this.banner + asset._value;
        });
      });

      callback();
    });
  }
}

module.exports = {
  name: 'okta-login',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: path.resolve(__dirname, 'okta-login.ts'),
  mode: 'production',
  module: {
    rules: [{
      test: /\.ts$/,
      use: [
        deepmerge(sharedLoader, {
          options: {
            env: {
              targets: {
                // min browser versions
                ie: '11'
              }
            }
          }
        }),
      ]
    }]
  },
  output: {
    filename: 'okta-login.js',
    path: __dirname,
  },
  target: ['web', 'es5'],
  plugins: [
    new BannerPlugin({
      banner: '/* eslint-disable */\n// Do not edit this file directly. See okta-login.ts on how to edit.\n',
    }),
  ],
}

