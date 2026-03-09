import { Meta } from '@storybook/preact';
import React from 'react';

import MinimalHeader from '@/client/components/MinimalHeader';

export default {
	title: 'Components/MinimalHeader',
	component: MinimalHeader,
} as Meta;

export const Default = () => <MinimalHeader />;
