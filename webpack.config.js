const path = require('path');

const server = {
  entry: './src/server/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            onlyCompileBundledFiles: true
          }
        }],
        exclude: /node_modules/
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
  target: 'node'
};

const client = {
  entry: './src/client/index.tsx',
  module: {
    rules: [
      {
        test: /\.ts(x?)/,
        use: [{
          loader: 'ts-loader',
          options: {
            onlyCompileBundledFiles: true
          }
        }],
        exclude: /node_modules/
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
  target: 'web'
};

module.exports = [
  client,
  server
];
