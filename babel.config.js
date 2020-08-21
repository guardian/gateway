// babel.config.js
module.exports = {
  presets: [
    '@babel/typescript',
    '@babel/react',
    '@emotion/babel-preset-css-prop',
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-runtime',
  ],
};
