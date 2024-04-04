import React from 'react';
import { Meta } from '@storybook/react';

import { GlobalSuccess } from '@/client/components/GlobalSuccess';

export default {
	title: 'Components/GlobalSuccess',
	component: GlobalSuccess,
} as Meta;

export const Default = () => (
	<GlobalSuccess success="A postive message of success" />
);
Default.storyName = 'default';
