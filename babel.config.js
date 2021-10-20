// babel.config.js
module.exports = {
  presets: [
    '@babel/typescript',
    '@babel/react',
    '@emotion/babel-preset-css-prop',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-object-rest-spread',
  ],
};
