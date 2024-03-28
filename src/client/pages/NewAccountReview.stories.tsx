import React from 'react';
import { Meta } from '@storybook/react';

import { Consent } from '@/shared/model/Consent';
import { NewAccountReview, NewAccountReviewProps } from './NewAccountReview';

export default {
	title: 'Pages/NewAccountReview',
	component: NewAccountReview,
	parameters: {
		layout: 'fullscreen',
	},
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

export const NoConsents = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} hasCmpConsent={true} />
);
NoConsents.story = {
	name: 'without consents',
};

export const WithProfiling = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} profiling={profiling} hasCmpConsent={true} />
);
WithProfiling.story = {
	name: 'with profiling consent',
};

export const WithAdvertising = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} advertising={advertising} hasCmpConsent={true} />
);
WithAdvertising.story = {
	name: 'with advertising consent',
};

export const WithBothConsents = (args: NewAccountReviewProps) => (
	<NewAccountReview
		{...args}
		profiling={profiling}
		advertising={advertising}
		hasCmpConsent={true}
	/>
);
WithBothConsents.story = {
	name: 'with both consents',
};
