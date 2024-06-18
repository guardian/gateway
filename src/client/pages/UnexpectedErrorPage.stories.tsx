/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { UnexpectedErrorPage } from '@/client/pages/UnexpectedErrorPage';

export default {
	title: 'Pages/UnexpectedErrorPage',
	component: UnexpectedErrorPage,
} as Meta;

export const Default = () => <UnexpectedErrorPage />;
