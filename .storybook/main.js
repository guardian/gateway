const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config) => {
    // Add the @client alias to prevent imports using it from failing
    // Nb. __dirname is the current working directory, so .storybook in this case
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, '../src'),
    };

    // Return the altered config
    return config;
  },
};
