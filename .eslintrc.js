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
		'import/order': 0, // 1045
		'@typescript-eslint/consistent-type-imports': 0, // 446
		'@typescript-eslint/no-unsafe-assignment': 0, // 148
		'eslint-comments/require-description': 0, // 112
		'import/no-default-export': 0, // 104
		'@typescript-eslint/no-unnecessary-condition': 0, // 89
		'sort-imports': 0, // 85
		'@typescript-eslint/naming-convention': 0, // 84
		'@typescript-eslint/no-unsafe-member-access': 0, // 84
		'@typescript-eslint/no-unsafe-argument': 0, // 54
		'@typescript-eslint/prefer-nullish-coalescing': 0, // 46
		'@typescript-eslint/no-unsafe-call': 0, // 45
		'@typescript-eslint/no-unsafe-return': 0, // 26
		'import/no-named-as-default': 0, // 25
		'@typescript-eslint/no-unsafe-enum-comparison': 0, // 23
		'import/no-named-as-default-member': 0, // 19
		'@typescript-eslint/array-type': 0, // 18
		'eslint-comments/no-unused-disable': 0, // 16
		'@typescript-eslint/restrict-plus-operands': 0, // 14
		'@typescript-eslint/prefer-optional-chain': 0, // 8
		'import/no-cycle': 0, // 7
		'import/no-duplicates': 0, // 6
		'no-unsafe-finally': 0, // 6
		'@typescript-eslint/consistent-indexed-object-style': 0, // 5
		'no-extra-boolean-cast': 0, // 5
		'import/newline-after-import': 0, // 4
		'eslint-comments/disable-enable-pair': 0, // 4
		'@typescript-eslint/no-misused-promises': 0, // 4
		'@typescript-eslint/no-unnecessary-boolean-literal-compare': 0, // 3,
		'@typescript-eslint/no-unnecessary-type-assertion': 0, // 3
		'import/export': 0, // 2
		'no-fallthrough': 0, // 2
		'@typescript-eslint/unbound-method': 0, // 1
		'import/first': 0, // 1
		'no-empty-pattern': 0, // 1
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
