import React from 'react';
import { OnboardingPage } from './OnboardingPage';

export default {
	title: 'Pages/OnboardingPage',
	component: OnboardingPage,
	chromatic: {
		modes: {
			'dark desktop': { disable: true },
			'dark mobile': { disable: true },
		},
	},
};

export const Defaults = () => <OnboardingPage />;
