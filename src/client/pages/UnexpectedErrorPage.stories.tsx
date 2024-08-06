import type { Meta } from '@storybook/react';
import React from 'react';
import { UnexpectedErrorPage } from '@/client/pages/UnexpectedErrorPage';

export default {
	title: 'Pages/UnexpectedErrorPage',
	component: UnexpectedErrorPage,
} as Meta;

export const Default = () => <UnexpectedErrorPage />;
