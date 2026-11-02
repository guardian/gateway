import React from 'react';
import { Meta } from '@storybook/preact';
import { OnboardingNewsletters } from './OnboardingNewsletters';

export default {
	title: 'Components/OnboardingNewsletters',
	component: OnboardingNewsletters,
} as Meta;

export const Default = () => <OnboardingNewsletters />;
Default.storyName = 'Default';
