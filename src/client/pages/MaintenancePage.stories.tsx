import React from 'react';
import { Meta } from '@storybook/react';

import { MaintenancePage } from '@/client/pages/MaintenancePage';

export default {
	title: 'Pages/MaintenancePage',
	component: MaintenancePage,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <MaintenancePage />;
