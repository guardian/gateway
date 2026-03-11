import React from 'react';
import { Meta } from '@storybook/preact';

import {
	NewAccountReview,
	NewAccountReviewProps,
} from '@/client/pages/NewAccountReview';

export default {
	title: 'Pages/NewAccountReview',
	component: NewAccountReview,
	args: {
		nextPage: 'https://www.theguardian.com/uk',
	},
} as Meta<NewAccountReviewProps>;
export const Default = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} />
);
