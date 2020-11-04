const path = require("path");
const nodeExternals = require("webpack-node-externals");
const babelConfig = require("./babel.config");
const AssetsPlugin = require('assets-webpack-plugin')

const mode =
  process.env.ENVIRONMENT === "production" ? "production" : "development";

const extensions = [".ts", ".tsx", ".js"];

const watchOptions = {
  ignored: /node_modules/
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
          publicPath: '/gateway-static/'
        }
      },
      {
        loader: 'image-webpack-loader',
        options: {
          mozjpeg: {
            progressive: true,
            quality: 65
          },
          optipng: {
            enabled: true,
          },
          pngquant: {
            quality: [0.65, 0.90],
            speed: 4
          },
          gifsicle: {
            interlaced: false,
          }
        }
      }
    ]
  };
};

const server = {
  entry: "./src/server/index.ts",
  externals: [
    nodeExternals({
      allowlist: [/^@guardian/]
    })
  ],
  mode,
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts(x?)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/env",
                  {
                    targets: {
                      node: "current"
                    },
                    ignoreBrowserslistConfig: true
                  }
                ],
                ...babelConfig.presets
              ],
              plugins: [...babelConfig.plugins]
            }
          }
        ]
      },
      imageLoader("static/")
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "build")
  },
  resolve: {
    extensions,
    alias: {
      "@": path.join(__dirname, "src"),
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    }
  },
  target: "node",
  watchOptions
};

const client = {
  entry: "./src/client/static/index.tsx",
  mode: "production",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(m?)(j|t)s(x?)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                  }
                ], ...babelConfig.presets],
              plugins: [...babelConfig.plugins]
            }
          }
        ]
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
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                    modules: "amd"
                  }
                ], ...babelConfig.presets],
              plugins: [...babelConfig.plugins]
            }
          }
        ]
      },
      imageLoader("./")
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },
  output: {
    filename: "[name].[contenthash].bundle.js",
    chunkFilename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, "build/static/"),
    publicPath: 'gateway-static/'
  },
  plugins: [new AssetsPlugin({ path: path.resolve(__dirname, "build") })],
  resolve: {
    extensions,
    alias: {
      "@": path.join(__dirname, "src"),
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    }
  },
  target: "web",
  watchOptions
};

module.exports = [client, server];
