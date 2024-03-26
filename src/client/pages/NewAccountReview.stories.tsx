import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Consent } from '@/shared/model/Consent';
import { NewAccountReview } from './NewAccountReview';

export default {
	title: 'Pages/NewAccountReview',
	component: NewAccountReview,
	parameters: {
		layout: 'fullscreen',
	},
} as ComponentMeta<typeof NewAccountReview>;

const Template: ComponentStory<typeof NewAccountReview> = (props) => (
	<NewAccountReview {...props} />
);

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

export const NoDescription = Template.bind({});
NoDescription.storyName = 'with no description';

export const OnlyProfilingConsent = Template.bind({});
OnlyProfilingConsent.args = {
	profiling: profiling,
};
OnlyProfilingConsent.storyName = 'with profiling consent only';

export const BothConsents = Template.bind({});
BothConsents.args = {
	profiling: profiling,
	advertising: advertising,
};
BothConsents.storyName = 'with both consents';
