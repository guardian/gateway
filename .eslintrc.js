module.exports = {
	extends: [
		'@guardian/eslint-config-typescript',
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

		// disabled @guardian/eslint-config-typescript rules
		'@typescript-eslint/no-unsafe-assignment': 0, // 148
		'eslint-comments/require-description': 0, // 112
		'import/no-default-export': 0, // 104
		'@typescript-eslint/no-unnecessary-condition': 0, // 89
		'@typescript-eslint/naming-convention': 0, // 84
		'@typescript-eslint/no-unsafe-member-access': 0, // 84
		'@typescript-eslint/no-unsafe-argument': 0, // 54
		'@typescript-eslint/prefer-nullish-coalescing': 0, // 46
		'@typescript-eslint/no-unsafe-call': 0, // 45
		'@typescript-eslint/no-unsafe-return': 0, // 26
		'import/no-named-as-default': 0, // 25
		'@typescript-eslint/no-unsafe-enum-comparison': 0, // 23
		'import/no-named-as-default-member': 0, // 19
		'import/no-cycle': 0, // 7
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
