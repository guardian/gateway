import React from 'react';
import { Meta } from '@storybook/react';
import { NotFound } from '@/client/pages/NotFound';

export default {
	title: 'Pages/NotFound',
	component: NotFound,
} as Meta;

export const Default = () => <NotFound shortRequestId="123e4567" />;
