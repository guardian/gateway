const path = require('path');
const babelConfig = require('../babel.config');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config) => {
    // Add the @client alias to prevent imports using it from failing
    // Nb. __dirname is the current working directory, so .storybook in this case
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, '../src'),
      mjml: 'mjml-browser',
    };

    // We need to transpile the Guardian and strip-ansi modules so that our vendors bundle will run in IE11.
    const transpileGuardianModules = {
      include: [/node_modules[\\\/]@guardian/, /node_modules[\\\/]strip-ansi/],
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
        rules: [...config.module.rules, transpileGuardianModules],
      },
    };
  },
};
