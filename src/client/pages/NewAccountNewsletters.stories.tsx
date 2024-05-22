import React from 'react';
import { Meta } from '@storybook/react';

import {
	NewAccountNewsletters,
	NewAccountNewslettersProps,
} from './NewAccountNewsletters';

export default {
	title: 'Pages/NewAccountNewsletters',
	component: NewAccountNewsletters,
	parameters: {
		layout: 'fullscreen',
	},
	args: {
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
	},
} as Meta<NewAccountNewslettersProps>;

export const WithNewslettersUs = (args: NewAccountNewslettersProps) => (
	<NewAccountNewsletters
		{...args}
		newsletters={[
			{
				id: '4152',
				nameId: 'headlines-us',
				description:
					"A digest of the morning's main US headlines emailed direct to you every day",
				frequency: 'Every day',
				name: 'Headlines US',
				subscribed: false,
			},
			{
				id: '6042',
				nameId: 'the-stakes-us-election-edition',
				description:
					'What’s really at risk in the 2024 election? Adam Gabbatt cuts through the clutter and guides you through the biggest stories, questions and curiosities in this hugely consequential election. We’ll focus on the stakes – not the odds.',
				frequency: 'At least once a week',
				name: 'The Stakes — US Election Edition',
				subscribed: false,
			},
			{
				id: '6039',
				nameId: 'well-actually',
				description:
					'Practical advice, expert insights and answers to your questions about how to live a good life',
				frequency: 'Weekly',
				name: 'Well Actually',
				subscribed: false,
			},
			{
				id: '6032',
				nameId: 'trump-on-trial',
				description:
					'Stay up to date on all of Donald Trump’s trials. Guardian staff will send weekly updates each Wednesday – and more frequent editions during trial.',
				frequency: 'Weekly, and more frequent editions during trial',
				name: 'Trump on Trial',
				subscribed: false,
			},
		]}
	/>
);
WithNewslettersUs.storyName = 'with newsletters (US)';

export const WithNewslettersAu = (args: NewAccountNewslettersProps) => (
	<NewAccountNewsletters
		{...args}
		newsletters={[
			{
				frequency: 'Every weekday',
				name: 'Morning Mail',
				description:
					'Start your day with our Australian curated news roundup, straight to your inbox',
				nameId: 'morning-mail',
				id: '4148',
			},
			{
				frequency: 'Every weekday',
				name: 'Afternoon Update',
				description:
					'Finish your day with Antoun Issa’s three-minute snapshot of Australia’s main news',
				nameId: 'afternoon-update',
				id: '6023',
			},
			{
				frequency: 'Every weekend',
				name: 'Saved for Later',
				description:
					'Catch up every Saturday morning on the fun stuff with Guardian Australia’s culture and lifestyle rundown.',
				nameId: 'saved-for-later',
				id: '6003',
			},
			{
				frequency: 'Fortnightly',
				name: 'The Crunch',
				description:
					'Our data journalists showcase the most important visualisations from the Guardian and around the web',
				nameId: 'the-crunch',
				id: '6034',
			},
		]}
	/>
);
WithNewslettersAu.storyName = 'with newsletters (AU)';

export const WithoutNewsletters = (args: NewAccountNewslettersProps) => (
	<NewAccountNewsletters {...args} newsletters={[]} />
);
WithoutNewsletters.storyName = 'without newsletters';
