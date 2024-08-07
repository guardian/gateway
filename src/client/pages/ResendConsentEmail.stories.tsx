import React from 'react';
import { Meta } from '@storybook/react';

import { ResendConsentEmail } from '@/client/pages/ResendConsentEmail';

export default {
	title: 'Pages/ResendConsentEmail',
	component: ResendConsentEmail,
} as Meta;

export const Default = () => (
	<ResendConsentEmail
		queryParams={{ returnUrl: 'https://theguardian.com' }}
		token="sometoken"
	/>
);
Default.story = { name: 'with defaults' };
