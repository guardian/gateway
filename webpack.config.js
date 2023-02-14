/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const deepmerge = require('deepmerge');
const sharedLoader = require('./.swcrc.config');

const mode =
  process.env.ENVIRONMENT === 'production' ? 'production' : 'development';

process.stdout.write(`Building in ${mode} mode.\n`);

const analyzeBundle = process.env.WEBPACK_ANALYZE_BUNDLE === 'true';

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
          publicPath: '/static/',
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
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',     // Must be below test-utils
      'react/jsx-runtime': 'preact/jsx-runtime'
    },
  },
  watchOptions,
  plugins: [
    new Dotenv({
      // Required to ensure Dotenv doesn't override any existing env vars that have been set by the system
      systemvars: true,
    }),
  ],
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
          deepmerge(sharedLoader, {
            options: {
              env: {
                targets: {
                  node: process.versions.node,
                },
              },
            },
          }),
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
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/client/.well-known',
          to: '.well-known',
        },
      ],
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
    ],
  },
});

const browser = ({ isLegacy }) => {
  const entry = ['./src/client/static/index.tsx'];
  const target = ['web'];
  if (isLegacy) {
    target.push('es5');
  }

  const modernLoader = deepmerge(sharedLoader, {
    options: {
      env: {
        targets: {
          // browsers that support type="module" and dynamic import
          chrome: '66',
          edge: '79',
          firefox: '67',
          safari: '13',
        },
      },
    },
  });

  const legacyLoader = deepmerge(sharedLoader, {
    options: {
      env: {
        targets: {
          // min browser versions
          ie: '11',
        },
      },
    },
  });

  const filename = `[name]${isLegacy ? '.legacy' : ''}.[chunkhash].js`;

  const plugins = [
    new AssetsPlugin({
      path: path.resolve(__dirname, 'build'),
      filename: `${isLegacy ? 'legacy.' : ''}webpack-assets.json`,
    }),
    // Reduce Sentry bundle size
    new webpack.DefinePlugin({
      __SENTRY_DEBUG__: false,
      __SENTRY_TRACING__: false,
    }),
  ];

  if (analyzeBundle) {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: true,
        reportFilename: `../webpack-report-${
          isLegacy ? 'legacy' : 'modern'
        }.html`,
      }),
    );
  }

  return {
    entry,
    mode,
    module: {
      rules: [
        {
          test: /\.(m?)(j|t)s(x?)/,
          use: [isLegacy ? legacyLoader : modernLoader],
        },
        imageLoader('./'),
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.swcMinify,
          terserOptions: {
            mangle: {
              safari10: true,
            },
          },
        }),
      ],
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
      publicPath: 'static/',
    },
    plugins,
    target,
    performance: {
      maxEntrypointSize: isLegacy ? 768000 : 512000,
      maxAssetSize: isLegacy ? 512000 : 384000,
    },
    devtool: 'source-map',
  };
};

module.exports = [
  merge(
    common({
      platform: 'server',
    }),
    server(),
  ),
  merge(
    common({
      platform: 'browser.legacy',
    }),
    browser({
      isLegacy: true,
    }),
  ),
  merge(
    common({
      platform: 'browser',
    }),
    browser({
      isLegacy: false,
    }),
  ),
];
