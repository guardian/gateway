import React from 'react';
import { OnboardingPage } from './OnboardingPage';
import { Meta } from '@storybook/preact';

export default {
	title: 'Pages/OnboardingPage',
	component: OnboardingPage,
	parameters: {
		chromatic: {
			modes: {
				'dark desktop': { disable: true },
				'dark mobile': { disable: true },
			},
		},
	},
} as Meta;

export const Default = () => <OnboardingPage />;
Default.storyName = 'Onboarding Page';
