import React from 'react';
import { Meta } from '@storybook/preact';
import { Onboarding } from './Onboarding';

export default {
	title: 'Pages/Onboarding',
	component: Onboarding,
} as Meta;

export const Default = () => <Onboarding />;

Default.storyName = 'Default';
