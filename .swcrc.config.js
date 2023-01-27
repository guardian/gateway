const mode =
  process.env.ENVIRONMENT === 'production' ? 'production' : 'development';

module.exports = {
  loader: 'swc-loader',
  options: {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: false,
        dynamicImport: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
          throwIfNamespace: true,
          importSource: '@emotion/react',
        },
      },
      experimental: {
        plugins: [
          [
            '@swc/plugin-emotion',
            {
              // only in development, as this increases bundle size in production
              sourceMap: mode === 'development',
            },
          ],
        ],
      },
    },
    sourceMaps: true,
  },
};
