import React from 'react';
import { Meta } from '@storybook/preact';
import { UnexpectedError } from '@/client/pages/UnexpectedError';

export default {
	title: 'Pages/UnexpectedError',
	component: UnexpectedError,
} as Meta;

export const Default = () => <UnexpectedError shortRequestId="123e4567" />;
