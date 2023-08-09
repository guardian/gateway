import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ConsentsOurContentAB } from './ConsentsOurContentAB';

export default {
	title: 'Pages/ConsentsOurContentAB',
	component: ConsentsOurContentAB,
	parameters: {
		layout: 'fullscreen',
		clientState: { pageData: { previousPage: 'fake_page' } },
	},
} as ComponentMeta<typeof ConsentsOurContentAB>;

const Template: ComponentStory<typeof ConsentsOurContentAB> = (props) => (
	<ConsentsOurContentAB {...props} isInAbSimplifyRegFlowTest={true} />
);

const newsletters = [
	{
		id: '4147',
		nameId: 'green-light',
		description:
			'Exclusive articles from our top environment correspondents and a round up of the planet’s most important stories of the week',
		name: 'Down to Earth',
		frequency: 'Weekly',
	},
	{
		id: '4165',
		nameId: 'the-long-read',
		description:
			'Lose yourself in a great story: from politics to psychology, food to technology, culture to crime',
		name: 'The Long Read',
		frequency: 'Weekly',
	},
	{
		id: '9001',
		nameId: 'over-nine-thousand',
		description: '',
		name: 'No image',
		frequency: 'Monthly',
	},
];
const supporterConsent = {
	id: 'supporter',
	name: 'Supporting the Guardian',
	description:
		'Stay up-to-date with our latest offers and the aims of the organisation, as well as the ways to enjoy and support our journalism.',
};

export const NoNewsLetters = Template.bind({});
NoNewsLetters.args = {
	consents: [
		{
			type: 'consent',
			consent: supporterConsent,
		},
	],
};
NoNewsLetters.storyName = 'with a single supporter consent and no newsletters';

export const SingleNewsletter = Template.bind({});
SingleNewsletter.args = {
	consents: [
		{
			type: 'consent',
			consent: supporterConsent,
		},
		{
			type: 'newsletter',
			consent: {
				id: '4147',
				nameId: 'green-light',
				description:
					'Exclusive articles from our top environment correspondents and a round up of the planet’s most important stories of the week',
				name: 'Down to Earth',
				frequency: 'Weekly',
			},
		},
	],
};
SingleNewsletter.storyName =
	'with a single supporter consent and one newsletter';

export const MultipleNewsletter = Template.bind({});
MultipleNewsletter.args = {
	consents: [
		{
			type: 'consent',
			consent: supporterConsent,
		},
		...newsletters.map((newsletter) => ({
			type: 'newsletter' as const,
			consent: newsletter,
		})),
	],
};
MultipleNewsletter.storyName = 'with multiple newsletters';

export const NewslettersAndEvents = Template.bind({});
NewslettersAndEvents.args = {
	consents: [
		{
			type: 'consent',
			consent: supporterConsent,
		},
		...newsletters.map((newsletter) => ({
			type: 'newsletter' as const,
			consent: newsletter,
		})),
		{
			type: 'consent' as const,
			consent: {
				id: 'events',
				name: 'Events & Masterclasses',
				description:
					'Receive weekly newsletters about our upcoming Live events and Masterclasses. Interact with leading minds and nourish your curiosity in our immersive online events, available worldwide.',
			},
		},
	],
};
NewslettersAndEvents.storyName = 'with newsletters and consent for events';

export const WithSuccessMessage = Template.bind({});
WithSuccessMessage.storyName = 'with success message';
WithSuccessMessage.parameters = {
	clientState: {
		globalMessage: { success: 'Some kind of success message' },
	},
};

export const WithErrorMessage = Template.bind({});
WithErrorMessage.storyName = 'with error message';
WithErrorMessage.parameters = {
	clientState: {
		globalMessage: { error: 'Some kind of error message' },
	},
};
