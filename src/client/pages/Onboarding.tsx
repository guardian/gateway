import { OnboardingNewsletters } from '../components/OnboardingNewsletters';
import { QueryParams } from '@/shared/model/QueryParams';
import { WideHeaderLayout } from '../layouts/WideHeaderLayout';
import { DiscoverOurApps } from './DiscoverOurApps';

export interface OnboardingProps {
	shortRequestId?: string;
	queryParams: QueryParams;
}

export const Onboarding = ({
	shortRequestId,
	queryParams,
}: OnboardingProps) => (
	<WideHeaderLayout
		shortRequestId={shortRequestId}
		pageHeader="Welcome to the Guardian"
		leadText="Thank you for signing up."
		imageId="welcome"
	>
		<OnboardingNewsletters queryParams={queryParams} />
		<DiscoverOurApps />
	</WideHeaderLayout>
);
