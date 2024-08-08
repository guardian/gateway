export const CONSENT_ERRORS = {
	GENERIC: 'There was a problem saving your choice, please try again.',
};

export const CONSENTS_ENDPOINT = '/consents';

export const allConsents = [
	{
		id: 'sms',
		isOptOut: false,
		isChannel: true,
		name: 'SMS',
		description:
			"I would like to receive updates about the Guardian products and services I've selected above by SMS (text messages).",
	},
	{
		id: 'holidays',
		isOptOut: false,
		isChannel: false,
		name: 'Holidays & Vacations',
		description:
			'Ideas and inspiration for your next trip away, as well as the latest offers from Guardian Holidays in the UK and Guardian Vacations in the US.',
	},
	{
		id: 'market_research_optout',
		isOptOut: true,
		isChannel: false,
		name: 'Allow the Guardian to contact me for market research purposes',
		description:
			'From time to time we may contact you for market research purposes inviting you to complete a survey, or take part in a group discussion. Normally, this invitation would be sent via email, but we may also contact you by phone.',
	},
	{
		id: 'offers',
		isOptOut: false,
		isChannel: false,
		name: 'Offers',
		description:
			'Offers and competitions from the Guardian and other carefully selected and trusted partners that we think you might like. Don’t worry, we won’t share your personal information with them. Available in the UK, Aus and US.',
	},
	{
		id: 'post_optout',
		isOptOut: true,
		isChannel: false,
		name: 'Allow the Guardian to send communications by post',
	},
	{
		id: 'profiling_optout',
		isOptOut: true,
		isChannel: false,
		name: 'Allow the Guardian to analyse this data to improve marketing content',
	},
	{
		id: 'phone_optout',
		isOptOut: true,
		isChannel: true,
		name: 'Allow the Guardian to send communications by telephone',
	},
	{
		id: 'supporter',
		isOptOut: false,
		isChannel: false,
		name: 'Supporting the Guardian',
		description:
			'News and offers from the Guardian, The Observer and Guardian Weekly, on the ways to read and support our journalism. Already a member, subscriber or contributor? Opt in here to receive your regular emails and updates.',
	},
	{
		id: 'jobs',
		isOptOut: false,
		isChannel: false,
		name: 'Jobs',
		description:
			'Receive tips, Job Match recommendations, and advice from Guardian Jobs on taking your next career step.',
	},
	{
		id: 'events',
		isOptOut: false,
		isChannel: false,
		name: 'Guardian Live events',
		description:
			'Receive weekly newsletters about our new livestreamed and interactive events that you can access from wherever you are in the world.',
	},
	{
		id: 'personalised_advertising',
		isOptOut: false,
		isChannel: false,
		name: 'Allow personalised advertising using this data - this supports the Guardian',
	},
	{
		id: 'similar_guardian_products',
		isOptOut: false,
		isChannel: false,
		name: 'Guardian products and support',
		description:
			'Information on our products and ways to support and enjoy our independent journalism.',
	},
];

export const defaultUserConsent = allConsents.map(({ id }) => ({
	id,
	consented: false,
}));

export const getUserConsents = (consented: string[]) => {
	if (!consented.length) {
		return defaultUserConsent;
	}
	return allConsents.map(({ id }) => {
		return {
			id,
			consented: consented.includes(id),
		};
	});
};

export const optedOutUserConsent = getUserConsents([
	'profiling_optout',
	'market_research_optout',
]);

export const optedIntoPersonalisedAdvertisingUserConsent = getUserConsents([
	'personalised_advertising',
]);
