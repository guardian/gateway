/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const babelConfig = require('./babel.config');
const AssetsPlugin = require('assets-webpack-plugin');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

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
  watchOptions
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
            },
          },
        ],
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

const browser = ({ isLegacy }) => {

  const entry = ['./src/client/static/index.tsx']
  if (isLegacy) {
    entry.push('whatwg-fetch')
  }

  const filename = `[name]${isLegacy ? '.legacy' : ''}.[chunkhash].js`;

  return {
    entry,
    mode: 'production',
    module: {
      rules: [
        {
          exclude: {
            and: [/node_modules/],
            not: [/@guardian/]
          },
          test: /\.(m?)(j|t)s(x?)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  isLegacy ? [
                    '@babel/env',
                    {
                      bugfixes: true,
                      useBuiltIns: 'usage',
                      corejs: '3.9',
                      targets: {
                        ie: '11'
                      }
                    },
                  ] : [
                      '@babel/env',
                      {
                        bugfixes: true,
                        targets: {
                          esmodules: true
                        }
                    }
                  ]
                  ,
                  ...babelConfig.presets,
                ],
                plugins: [...babelConfig.plugins],
              },
            },
          ],
        },
        imageLoader('./')
      ]
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
    output: {
      filename,
      chunkFilename: filename,
      path: path.resolve(__dirname, 'build/static/'),
      publicPath: 'gateway-static/',
    },
    plugins: [new AssetsPlugin({
      path: path.resolve(__dirname, 'build'),
      filename: `${isLegacy ? 'legacy.' : ''}webpack-assets.json`
    })],
    target: ['web'],
  }
}

module.exports = [
  merge(
    common({ platform: 'server' }),
    server()
  ),
  merge(
    common({ platform: 'browser.legacy' }),
    browser({ isLegacy: true })
  ),
  merge(
    common({ platform: 'browser' }),
    browser({ isLegacy: false })
  )
]
