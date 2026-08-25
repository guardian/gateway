import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { OnboardingNewsletters } from '../components/OnboardingNewsletters';
import { NewsLetter } from '@/shared/model/Newsletter';

export interface OnboardingProps {
	shortRequestId?: string;
}

const AU_NEWSLETTERS: NewsLetter[] = [
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
];

export const Onboarding = ({ shortRequestId }: OnboardingProps) => (
	<MinimalLayout
		shortRequestId={shortRequestId}
		pageHeader="Welcome to the Guardian"
		leadText="Thank you for signing up."
		imageId="welcome"
	>
		<OnboardingNewsletters newsletters={AU_NEWSLETTERS} />
	</MinimalLayout>
);
