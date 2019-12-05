const path = require('path');

const babel = {
  presets: [
    "@babel/typescript",
    "@babel/react"
  ]
};

const watchOptions = {
  ignored: /node_modules/
};

const server = {
  entry: './src/server/index.ts',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
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
    extensions: ['.ts', '.js']
  },
  target: 'node',
  watchOptions
};

const client = {
  entry: './src/client/index.tsx',
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
              ...babel.presets,
              "@emotion/babel-preset-css-prop",
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
