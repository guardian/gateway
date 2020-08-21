const path = require("path");
const nodeExternals = require("webpack-node-externals");
const babelConfig = require("./babel.config");

const mode =
  process.env.ENVIRONMENT === "production" ? "production" : "development";

const extensions = [".ts", ".tsx", ".js"];

const watchOptions = {
  ignored: /node_modules/
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
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[hash].[ext]',
              outputPath: 'static/',
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
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          }
        ]
      }
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
      "@": path.join(__dirname, "src")
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
        test: /\.(j|t)s(x?)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/env", ...babelConfig.presets],
              plugins: [...babelConfig.plugins]
            }
          }
        ]
      }
    ]
  },
  output: {
    filename: "bundle.js",
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, "build/static/"),
    publicPath: 'gateway-static/'
  },
  resolve: {
    extensions,
    alias: {
      "@": path.join(__dirname, "src")
    }
  },
  target: "web",
  watchOptions
};

module.exports = [client, server];
