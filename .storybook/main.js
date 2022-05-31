const path = require('path');
const { neutral } = require('@guardian/source-foundations');
const babelConfig = require('../babel.config');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    builder: 'webpack5',
  },
  babel: async (options) => {
    options.presets.push('@emotion/babel-preset-css-prop');
    return options;
  },
  previewHead: (head) => `
    ${head}
    <style>
      body {
        color: ${neutral[7]};
      }
    </style>
  `,
  webpackFinal: async (config) => {
    // Add the @client alias to prevent imports using it from failing
    // Nb. __dirname is the current working directory, so .storybook in this case
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, '../src'),
      mjml: 'mjml-browser',
    };

    // transpile certain modules so we can get them to work with ie11 storybook
    const transpileModules = {
      include: [
        /node_modules[\\\/]@guardian/,
        /node_modules[\\\/]strip-ansi/,
        // query string related transpilation start
        /node_modules[\\\/]query-string/,
        /node_modules[\\\/]ansi-regex/,
        /node_modules[\\\/]split-on-first/,
        /node_modules[\\\/]strict-uri-encode/,
        /node_modules[\\\/]react-element-to-jsx-string[\\\/]dist[\\\/]cjs/,
        // query string related transpilation end
      ],
      test: /\.(m?)(j|t)s(x?)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/env',
                {
                  bugfixes: true,
                  useBuiltIns: 'usage',
                  corejs: '3.14',
                  modules: 'amd',
                },
              ],
              ...babelConfig.presets,
            ],
            plugins: [...babelConfig.plugins],
          },
        },
      ],
    };

    // Return the altered config
    return {
      ...config,
      module: {
        ...config.module,
        rules: [...config.module.rules, transpileModules],
      },
      target: ['web', 'es5'],
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
          os: false,
          https: false,
          http: false,
        },
      },
    };
  },
};
