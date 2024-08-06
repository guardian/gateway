module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:prettier/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'prettier',
		'plugin:jsx-a11y/recommended',
		'plugin:functional/no-mutations',
		'plugin:react-hooks/recommended',
		'plugin:storybook/recommended',
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		project: [
			'./tsconfig.json',
			'./cypress/tsconfig.json',
			'./scripts/okta/tsconfig.json',
		],
	},
	plugins: ['functional'],
	rules: {
		// React Rules
		'react/prop-types': 0,
		'react/no-unknown-property': ['error', { ignore: ['css'] }],

		// Functional rules
		'functional/immutable-data': [
			'error',
			{
				ignoreImmediateMutation: true,
			},
		],
		'functional/prefer-immutable-types': 0,
		'functional/type-declaration-immutability': 0,

		// eslint rules
		'no-var': 'error',
		'no-param-reassign': 'error',
		'no-sequences': 'error',
		'no-console': 'error',
		'prefer-const': 'error',
	},
	overrides: [
		{
			files: ['*.stories.tsx'],
			rules: {
				'functional/immutable-data': 0,
			},
		},
	],
	settings: {
		react: {
			version: 'detect',
		},
	},
	ignorePatterns: ['cdk/'],
};
