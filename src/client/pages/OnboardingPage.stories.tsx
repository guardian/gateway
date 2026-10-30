import React from 'react';
import { OnboardingPage } from './OnboardingPage';
import { Meta } from '@storybook/preact';

export default {
	title: 'Pages/OnboardingPage',
	component: OnboardingPage,
} as Meta;

export const Default = () => <OnboardingPage />;
Default.storyName = 'Onboarding Page';
