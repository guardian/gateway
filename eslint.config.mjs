import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import functional from 'eslint-plugin-functional';
import guardian from '@guardian/eslint-config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

// this is a workaround for variables that are used in a way that eslint doesn't recognize
const noUnusedVarsPattern = '^_|React|req|res|next|error|idxPaths|Schema$';

const config = tseslint.config(
	{
		// ignore files we don't want to lint
		ignores: [
			'**/cdk/',
			'**/storybook-static/',
			'build/',
			'scripts/okta/okta-login.js',
		],
	},
	{
		extends: [
			...guardian.configs.javascript,
			eslint.configs.recommended,
			...guardian.configs.react,
			...tseslint.configs.recommendedTypeChecked,
			...guardian.configs.jest,
			...guardian.configs.storybook,
			functional.configs.noMutations,
			eslintPluginPrettierRecommended,
			...guardian.configs.comments,
		],

		plugins: {
			functional,
		},

		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',

			parserOptions: {
				projectService: {
					// lint additional files that are not part of the tsconfig
					allowDefaultProject: ['eslint.config.mjs', 'cypress.config.ts'],
				},

				ecmaFeatures: {
					jsx: true,
				},

				// list of all tsconfig files that should be used for type checking
				project: [
					'./tsconfig.json',
					'./cypress/tsconfig.json',
					'./scripts/okta/tsconfig.json',
				],
			},
		},

		settings: {
			react: {
				version: 'detect',
			},
		},

		rules: {
			// fix no-unused-vars errors based on `noUnusedVarsPattern`
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: noUnusedVarsPattern,
					caughtErrors: 'none',
					caughtErrorsIgnorePattern: noUnusedVarsPattern,
					destructuredArrayIgnorePattern: noUnusedVarsPattern,
					varsIgnorePattern: noUnusedVarsPattern,
					ignoreRestSiblings: true,
				},
			],

			// override functional rules
			'functional/immutable-data': [
				'error',
				{
					ignoreImmediateMutation: true,
				},
			],
			'functional/prefer-immutable-types': 'off',
			'functional/type-declaration-immutability': 'off',

			// eslint rules
			'no-var': 'error',
			'no-param-reassign': 'error',
			'no-sequences': 'error',
			'no-console': 'error',
			'prefer-const': 'error',

			// disabled @guardian/eslint-config rules, we should enable some of them later
			'import/order': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'eslint-comments/require-description': 'off',
			'import/no-default-export': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'sort-imports': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'import/no-named-as-default': 'off',
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'import/no-named-as-default-member': 'off',
			'import/no-cycle': 'off',
			'@typescript-eslint/only-throw-error': 'off',
		},
	},
	{
		// rules specific to storybook files
		files: ['**/*.stories.tsx'],

		rules: {
			'functional/immutable-data': 'off',
		},
	},
	{
		// rules specific to test files
		files: ['**/*.test.tsx', '**/*.test.ts'],

		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'@eslint-community/eslint-comments/require-description': 'off',
		},
	},
	{
		// rules specific to cypress test files
		files: ['**/*.cy.ts'],

		rules: {
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
	{
		// rules specific to files that are not part of the main codebase
		files: [
			'__mocks__/**/*',
			'.storybook/**/*',
			'cypress/**/*',
			'scripts/**/*',
			'util/**/*',
			'.swcrc.config.js',
			'babel.config.js',
			'cypress.config.ts',
			'jest.config.js',
			'webpack.config.js',
			'webpack.development.js',
		],

		rules: {
			'@eslint-community/eslint-comments/require-description': 'off',
		},
	},
);

export default config;
