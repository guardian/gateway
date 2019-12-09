const path = require('path');

const mode = process.env.ENVIRONMENT === 'production' ? 'production' : 'development';

const babel = {
  presets: [
    "@babel/typescript",
    "@babel/react",
    "@emotion/babel-preset-css-prop"
  ]
};

const watchOptions = {
  ignored: /node_modules/
};

const server = {
  entry: './src/server/index.ts',
  mode,
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts(x?)$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              [
                "@babel/env",
                {
                  targets: {
                    node: true,
                  },
                  ignoreBrowserslistConfig: true
                }
              ],
              ...babel.presets
            ]
          }
        }]
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  target: 'node',
  watchOptions
};

const client = {
  entry: './src/client/index.tsx',
  mode,
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts(x?)/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/env",
              ...babel.presets
            ]
          }
        }],
      }
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build/static/')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  target: 'web',
  watchOptions
};

module.exports = [
  client,
  server
];
