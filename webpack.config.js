const path = require('path');

module.exports = {
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
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node'
};
