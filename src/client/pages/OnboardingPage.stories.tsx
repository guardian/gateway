import React from 'react';
import { OnboardingPage } from './OnboardingPage';
import { Meta } from '@storybook/preact';

export default {
	title: 'Pages/OnboardingPage',
	component: OnboardingPage,
	parameters: {
		chromatic: {
			modes: {
				'light tablet': { theme: 'light', viewport: 'tablet' },
				// Once we have dark mode designs for the new onboarding flow
				// we can remove this config. The current onboarding flow has dark mode
				// so we will do the same for the new flow.
				'dark desktop': { disable: true },
				'dark mobile': { disable: true },
			},
		},
	},
} as Meta;

export const Default = () => <OnboardingPage />;
Default.storyName = 'Onboarding Page';
