import React from 'react';
import { Meta } from '@storybook/react';

import { NoFacebookSupport } from './NoFacebookSupport';

export default {
	title: 'Components/NoFacebookSupport',
	component: NoFacebookSupport,
} as Meta;

export const Default = () => {
	return <NoFacebookSupport queryParams={{ returnUrl: '#' }} />;
};
Default.storyName = 'default';
