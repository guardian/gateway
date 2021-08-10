/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const babelConfig = require('./babel.config');
const AssetsPlugin = require('assets-webpack-plugin');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

const mode =
  process.env.ENVIRONMENT === 'production' ? 'production' : 'development';

const extensions = ['.ts', '.tsx', '.js'];

const watchOptions = {
  ignored: /node_modules/,
};

const imageLoader = (path) => {
  return {
    test: /\.(jpe?g|png|gif)$/i,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[hash].[ext]',
          outputPath: path,
          publicPath: '/gateway-static/',
        },
      },
      {
        loader: 'image-webpack-loader',
        options: {
          mozjpeg: {
            progressive: true,
            quality: 65,
          },
          optipng: {
            enabled: true,
          },
          pngquant: {
            quality: [0.65, 0.9],
            speed: 4,
          },
          gifsicle: {
            interlaced: false,
          },
        },
      },
    ],
  };
};

const common = ({ platform }) => ({
  name: platform,
  resolve: {
    extensions,
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  watchOptions,
  plugins: [new Dotenv({
    // Required to ensure Dotenv doesn't override any existing env vars that have been set by the system
    systemvars: true
  })],
  cache: {
    type: 'filesystem'
  }
});

const server = () => ({
  entry: './src/server/index.ts',
  mode,
  externals: [
    nodeExternals({
      allowlist: [/^@guardian/],
    }),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts(x?)$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
        }
      },
      imageLoader('static/'),
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  output: {
    filename: 'server.js',
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'commonjs2'
  },
  optimization: {
    minimize: false,
    runtimeChunk: false
  },
  target: 'node'
});

module.exports = merge(
  common({ platform: 'server' }),
  server()
);
