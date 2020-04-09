const path = require("path");
const nodeExternals = require("webpack-node-externals");

const mode =
  process.env.ENVIRONMENT === "production" ? "production" : "development";

const babel = {
  presets: [
    "@babel/typescript",
    "@babel/react",
    "@emotion/babel-preset-css-prop"
  ]
};

const extensions = [".ts", ".tsx", ".js"];

const watchOptions = {
  ignored: /node_modules/
};

const server = {
  entry: "./src/server/index.ts",
  externals: [nodeExternals()],
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
                      node: true
                    },
                    ignoreBrowserslistConfig: true
                  }
                ],
                ...babel.presets
              ]
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
      lib: path.join(__dirname, "src/server/lib")
    }
  },
  target: "node",
  watchOptions
};

const client = {
  entry: "./src/client/index.tsx",
  mode,
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts(x?)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/env", ...babel.presets]
            }
          }
        ]
      }
    ]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build/static/")
  },
  resolve: {
    extensions,
    alias: {
      lib: path.join(__dirname, "src/client/lib")
    }
  },
  target: "web",
  watchOptions
};

module.exports = [client, server];
