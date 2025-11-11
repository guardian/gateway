import React from 'react';
import { Meta } from '@storybook/react';

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
