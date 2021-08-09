/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const baseConfig = require('./webpack.config');
const { mergeWithRules } = require('webpack-merge');

/**
 * Adds caching to the production webpack config for faster dev builds.
 * ForkTsCheckerWebpackPlugin provides type checking on top of webpack watch.
 */
const common = {
  mode: 'development',
  cache: {
    type: 'filesystem',
    managedPaths: [], // ensures that we cache all of the node_modules packages too.
  },
};

const serverConfig = {
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheCompression: false,
              cacheDirectory: true,
            },
          },
        ],
      },
    ]
  }
}

const browserConfig = {
  module: {
    rules: [
      {
        test: /\.(m?)(j|t)s(x?)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheCompression: false,
              cacheDirectory: true,
            },
          },
        ],
      },
    ]
  },
  plugins: [
    ...isLegacy ? [] : [new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: {
        mode: 'write-references' // for better babel-loader perf.
      }
    })],
    new ForkTsCheckerNotifierWebpackPlugin({ excludeWarnings: true, skipFirstNotification: true }),
  ]
};

const baseServerConfig = baseConfig[0];
const baseBrowserLegacyConfig = baseConfig[1];
const baseBrowserConfig = baseConfig[2];

const merge = mergeWithRules({
  module: {
    rules: {
      test: "match",
      use: {
        loader: "match",
        options: "merge",
      },
    },
  },
}); 

module.exports = [
  merge(
    baseServerConfig,
    common,
    serverConfig,
  ),
  merge(
    baseBrowserLegacyConfig,
    common,
    browserConfig,
  ),
  merge(
    baseBrowserConfig,
    common,
    browserConfig,
  )
]
