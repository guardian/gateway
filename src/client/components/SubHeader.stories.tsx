import React from 'react';
import { Meta } from '@storybook/react';

import { SubHeader } from '@/client/components/SubHeader';

export default {
	title: 'Components/SubHeader',
	component: SubHeader,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <SubHeader title="Sub Header Title" />;
Default.storyName = 'with simple title';
