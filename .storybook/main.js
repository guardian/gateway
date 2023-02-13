const path = require('path');
const { neutral } = require('@guardian/source-foundations');
const deepmerge = require('deepmerge');
const sharedLoader = require('../.swcrc.config');

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
    // Add the @client alias to prevent imports using it from failing
    // Nb. __dirname is the current working directory, so .storybook in this case
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, '../src'),
      mjml: 'mjml-browser',
      // We stub these libraries required by mjml because Storybook cannot run these on the client side.
      'uglify-js': false,
      'clean-css': false,
    };

    // transpile certain modules so we can get them to work with ie11 storybook
    const transpileModules = {
      include: [/node_modules[\\\/]@guardian/],
      test: /\.(m?)(j|t)s(x?)/,
      use: [
        deepmerge(sharedLoader, {
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
        }),
      ],
    };

    // Return the altered config
    return {
      ...config,
      module: {
        ...config.module,
        rules: [...config.module.rules, transpileModules],
      },
      target: ['web'],
    };
  },
};
