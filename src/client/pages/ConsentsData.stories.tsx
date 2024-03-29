import React from 'react';
import { Meta, StoryFn } from '@storybook/react';

import { Consent } from '@/shared/model/Consent';
import { ConsentsData } from './ConsentsData';

export default {
	title: 'Pages/ConsentsData',
	component: ConsentsData,
	parameters: {
		layout: 'fullscreen',
		clientState: { pageData: { previousPage: 'fake_page' } },
	},
} as Meta<typeof ConsentsData>;

const Template: StoryFn<typeof ConsentsData> = (props) => (
	<ConsentsData {...props} />
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
