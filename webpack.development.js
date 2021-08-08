/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const babelConfig = require('./babel.config');
const AssetsPlugin = require('assets-webpack-plugin');
const baseConfig = require('./webpack.config');

const imageLoader = (path) => {
  return {
    test: /\.(jpe?g|png|gif)$/i,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[contenthash].[ext]',
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
        exclude: /node_modules/,
        test: /\.ts(x?)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/env',
                  {
                    targets: {
                      node: 'current',
                    },
                    ignoreBrowserslistConfig: true,
                  },
                ],
                ...babelConfig.presets,
              ],
              plugins: [...babelConfig.plugins],
              cacheCompression: false,
              cacheDirectory: true,
            },
          },
        ],
      },
      imageLoader('static/'),
    ]
  }
}

const legacyBabelConfig = [
  '@babel/env',
  {
    bugfixes: true,
    useBuiltIns: 'usage',
    corejs: '3.14'
  },
]

const legacyBabelConfigNodeModules = [
  '@babel/env',
  {
    bugfixes: true,
    useBuiltIns: 'usage',
    corejs: '3.14',
    modules: 'amd'
  },
]

const modernBabelConfig = [
  '@babel/env',
  {
    bugfixes: true,
    targets: {
      esmodules: true
    }
  }
];

const browserConfig = (isLegacy) => ({
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(m?)(j|t)s(x?)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                isLegacy ? legacyBabelConfig : modernBabelConfig
                ,
                ...babelConfig.presets,
              ],
              plugins: [...babelConfig.plugins],
              cacheCompression: false,
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        include: /node_modules/,
        exclude: [
          /node_modules[\\\/]core-js/,
          /node_modules[\\\/]@babel/,
          /node_modules[\\\/]webpack[\\\/]buildin/,
        ],
        test: /\.(m?)(j|t)s(x?)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                isLegacy ? legacyBabelConfigNodeModules : modernBabelConfig
                ,
                ...babelConfig.presets,
              ],
              plugins: [...babelConfig.plugins],
              cacheCompression: false,
              cacheDirectory: true,
            },
          },
        ],
      },
      imageLoader('./')
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
    new AssetsPlugin({
      path: path.resolve(__dirname, 'build'),
      filename: `${isLegacy ? 'legacy.' : ''}webpack-assets.json`
    })
  ]
});

const baseServerConfig = baseConfig[0];
const baseBrowserLegacyConfig = baseConfig[1];
const baseBrowserConfig = baseConfig[2];

module.exports = [
  {
    ...baseServerConfig,
    ...common,
    ...serverConfig,
  },
  {
    ...baseBrowserLegacyConfig,
    ...common,
    ...browserConfig(true),
  },
  {
    ...baseBrowserConfig,
    ...common,
    ...browserConfig(false),
  }
]
