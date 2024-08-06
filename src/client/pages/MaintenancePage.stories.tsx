import type { Meta } from '@storybook/react';
import React from 'react';
import { MaintenancePage } from '@/client/pages/MaintenancePage';

export default {
	title: 'Pages/MaintenancePage',
	component: MaintenancePage,
} as Meta;

export const Default = () => <MaintenancePage />;
