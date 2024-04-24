import React from 'react';
import { Meta } from '@storybook/react';

import { ReturnToApp } from '@/client/pages/ReturnToApp';

export default {
	title: 'Pages/ReturnToApp',
	component: ReturnToApp,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
	<ReturnToApp email="test@example.com" appName="Guardian" />
);

export const NoEmail = () => <ReturnToApp appName="Guardian" />;

export const NoApp = () => <ReturnToApp email="test@example.com" />;

export const NoEmailOrApp = () => <ReturnToApp />;
