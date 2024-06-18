import type { Parameters } from '@storybook/react';

export const allModes: Record<string, Parameters> = {
	'dark mobile': {
		theme: 'dark',
		viewport: 'mobile',
	},
	'dark desktop': {
		theme: 'dark',
		viewport: 'desktop',
	},
	'light mobile': {
		theme: 'light',
		viewport: 'mobile',
	},
	'light desktop': {
		theme: 'light',
		viewport: 'desktop',
	},
};

export const chromaticModes = { modes: allModes };
