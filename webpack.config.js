const path = require("path");
const nodeExternals = require("webpack-node-externals");

const mode =
  process.env.ENVIRONMENT === "production" ? "production" : "development";

const babel = {
  presets: [
    "@babel/typescript",
    "@babel/react",
    "@emotion/babel-preset-css-prop"
  ],
  plugins: ["@babel/plugin-proposal-optional-chaining", "@babel/plugin-transform-runtime"]
};

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
                ...babel.presets
              ],
              plugins: [...babel.plugins]
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
              name: '[name].[ext]',
              outputPath: 'static/',
              publicPath: '/gateway-static/'
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
              presets: ["@babel/env", ...babel.presets],
              plugins: [...babel.plugins]
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
