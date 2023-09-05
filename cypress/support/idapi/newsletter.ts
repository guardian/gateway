export const NEWSLETTER_ENDPOINT = '/newsletters';
export const NEWSLETTER_SUBSCRIPTION_ENDPOINT = '/users/me/newsletters';

export const NEWSLETTER_ERRORS = {
	GENERIC:
		'There was a problem displaying newsletter options, please try again.',
};

export const allNewsletters = [
	{
		id: 'morning-mail',
		name: "Guardian Australia's Morning Mail",
		description:
			'Our Australian morning briefing email breaks down the key national and international stories of the day and why they matter',
		frequency: 'Every weekday',
		exactTargetListId: 4148,
	},
	{
		id: 'afternoon-update',
		name: "Guardian Australia's Afternoon Update",
		description:
			'Our Australian afternoon update email breaks down the key national and international stories of the day and why they matter',
		frequency: 'Every weekday',
		exactTargetListId: 6023,
	},
	{
		id: 'five-great-reads',
		name: 'Five Great Reads',
		description:
			'Each week our editors select five of the most interesting, entertaining and thoughtful reads published by Guardian Australia and our international colleagues. Sign up to receive it in your inbox every Saturday morning',
		frequency: 'Weekly',
		exactTargetListId: 6019,
	},
	{
		id: 'saved-for-later',
		name: 'Saved for Later',
		description:
			"Catch up on the fun stuff with Guardian Australia's culture and lifestyle rundown of pop culture, trends and tips",
		frequency: 'Weekly',
		exactTargetListId: 6003,
	},
	{
		id: 'morning-briefing',
		name: 'First Edition',
		description:
			'Archie Bland and Nimo Omer take you through the top stories and what they mean, free every weekday morning',
		frequency: 'Every weekday',
		exactTargetListId: 4156,
	},
	{
		id: 'us-morning-newsletter',
		name: 'First Thing: the US morning briefing',
		description:
			"Stay informed with a summary of the top stories from the US and the day's must-reads from across the Guardian",
		frequency: 'Every weekday',
		exactTargetListId: 4300,
	},
	{
		id: 'today-us',
		name: 'The Guardian Headlines US',
		description:
			'For US readers, we offer a regional edition of our daily email, delivering the most important headlines every morning',
		frequency: 'Every day',
		exactTargetListId: 4152,
	},
	{
		id: 'soccer-with-jonathan-wilson',
		name: 'Soccer with Jonathan Wilson',
		description:
			'Jonathan Wilson brings expert analysis on the biggest stories from European soccer',
		frequency: 'Weekly',
		exactTargetListId: 6030,
	},
	{
		id: 'green-light',
		name: 'Green Light',
		description:
			'In each weekly edition our editors highlight the most important environment stories of the week including data, opinion pieces and background guides. We’ll also flag up our best video, picture galleries, podcasts, blogs and green living guides',
		frequency: 'Weekly',
		exactTargetListId: 4147,
	},
	{
		id: 'the-long-read',
		name: 'The Long Read',
		description:
			'Get lost in a great story. From politics to fashion, international investigations to new thinking, culture to crime - we’ll bring you the biggest ideas and the arguments that matter. Sign up to have the Guardian’s award-winning long reads emailed to you every Saturday morning',
		frequency: 'Every Saturday',
		exactTargetListId: 4165,
	},
	{
		id: 'tech-scape',
		description: "Alex Hern's looks at how technology is shaping our lives",
		name: 'TechScape',
		frequency: 'Weekly',
		nameId: 'tech-scape',
		exactTargetListId: 6013,
	},
	{
		id: 'this-is-europe',
		description:
			'The most pivotal stories and debates for Europeans – from identity to economics to the environment',
		name: 'This is Europe',
		frequency: 'Weekly',
		exactTargetListId: 4234,
	},
];

export const userNewsletters = (
	subscriptions: Array<{ listId: number }> = [],
) => {
	return {
		result: {
			htmlPreference: 'HTML',
			subscriptions,
			globalSubscriptionStatus: 'opted_in',
		},
		status: 'ok',
	};
};
