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
  const target = ['web']
  if (isLegacy) {
    entry.unshift('whatwg-fetch')
    target.push('es5')
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
]

  const filename = `[name]${isLegacy ? '.legacy' : ''}.[chunkhash].js`;

  return {
    entry,
    mode: 'production',
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
    plugins: [
      new AssetsPlugin({
        path: path.resolve(__dirname, 'build'),
        filename: `${isLegacy ? 'legacy.' : ''}webpack-assets.json`
      })
    ],
    target,
    performance: {
      maxEntrypointSize: isLegacy ? 768000 : 512000,
      maxAssetSize: isLegacy ? 512000 : 384000
    }
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
