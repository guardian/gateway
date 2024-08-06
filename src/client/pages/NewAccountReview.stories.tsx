import type { Meta } from '@storybook/react';
import React from 'react';
import type { NewAccountReviewProps } from '@/client/pages/NewAccountReview';
import { NewAccountReview } from '@/client/pages/NewAccountReview';
import type { Consent } from '@/shared/model/Consent';

export default {
	title: 'Pages/NewAccountReview',
	component: NewAccountReview,
	args: {
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
	},
} as Meta<NewAccountReviewProps>;

const advertising: Consent = {
	id: 'personalised_advertising',
	name: 'Allow personalised advertising using this data - this supports the Guardian',
	consented: false,
};

const profiling: Consent = {
	id: 'profiling_optin',
	name: 'Allow the Guardian to analyse this data to improve marketing content',
	consented: true,
};

export const WithProfiling = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} profiling={profiling} />
);
WithProfiling.story = {
	name: 'with profiling consent',
};

export const WithAdvertising = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} advertising={advertising} />
);
WithAdvertising.story = {
	name: 'with advertising consent',
};

export const WithBothConsents = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} profiling={profiling} advertising={advertising} />
);
WithBothConsents.story = {
	name: 'with both consents',
};
