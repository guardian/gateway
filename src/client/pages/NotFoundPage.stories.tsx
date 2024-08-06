import type { Meta } from '@storybook/react';
import React from 'react';
import { NotFoundPage } from '@/client/pages/NotFoundPage';

export default {
	title: 'Pages/NotFoundPage',
	component: NotFoundPage,
} as Meta;

export const Default = () => <NotFoundPage />;
