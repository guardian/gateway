/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const babelConfig = require('../../babel.config');


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
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [[
            '@babel/env',
            {
              bugfixes: true,
            },
          ], ...babelConfig.presets],
          plugins: [...babelConfig.plugins],
        }
      }]
    }]
  },
  output: {
    filename: 'okta-login.js',
    path: __dirname,
  },
  target: ['web', 'es5'],
}

