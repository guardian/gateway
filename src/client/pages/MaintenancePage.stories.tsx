import React from 'react';
import { Meta } from '@storybook/preact';

import { MaintenancePage } from '@/client/pages/MaintenancePage';

export default {
	title: 'Pages/MaintenancePage',
	component: MaintenancePage,
} as Meta;

export const Default = () => <MaintenancePage />;
