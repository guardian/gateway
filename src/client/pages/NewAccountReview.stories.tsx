import React from 'react';
import { Meta } from '@storybook/react';

import { Consent } from '@/shared/model/Consent';
import {
	NewAccountReview,
	NewAccountReviewProps,
} from '@/client/pages/NewAccountReview';

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
	name: 'Allow personalised advertising using this data',
	consented: false,
};

const profiling: Consent = {
	id: 'profiling_optin',
	name: 'Allow the Guardian to analyse this data to improve marketing content',
	consented: true,
};

export const WithProfiling = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} profiling={profiling} advertising={undefined} />
);
WithProfiling.story = {
	name: 'with profiling consent',
};

export const WithAdvertisingConsentSetToFalse = (
	args: NewAccountReviewProps,
) => <NewAccountReview {...args} advertising={advertising} />;
WithAdvertisingConsentSetToFalse.story = {
	name: 'with advertising consent set to false',
};

export const WithAdvertisingConsentSetToTrue = (
	args: NewAccountReviewProps,
) => (
	<NewAccountReview
		{...args}
		advertising={{ ...advertising, consented: true }}
	/>
);
WithAdvertisingConsentSetToTrue.story = {
	name: 'with advertising consent set to true',
};

export const WithBothConsents = (args: NewAccountReviewProps) => (
	<NewAccountReview {...args} profiling={profiling} advertising={advertising} />
);
WithBothConsents.story = {
	name: 'with both consents',
};
