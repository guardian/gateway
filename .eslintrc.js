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
		'react/prop-types': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'functional/prefer-readonly-type': 0,
		'functional/no-method-signature': 0,
		'functional/immutable-data': [
			'error',
			{
				ignoreImmediateMutation: true,
			},
		],
		'functional/prefer-immutable-types': 0,
		'functional/type-declaration-immutability': 0,
		'no-var': 'error',
		'no-param-reassign': 'error',
		'prefer-const': 'error',
		'no-sequences': 'error',
		'no-console': 'error',
		'react/no-unknown-property': ['error', { ignore: ['css'] }],
		'require-await': 'error',
		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/no-floating-promises': 'error',
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
