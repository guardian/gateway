import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { DiscoverOurApps } from '@/client/pages/DiscoverOurApps';

export interface OnboardingProps {
	shortRequestId?: string;
}

export const Onboarding = ({ shortRequestId }: OnboardingProps) => (
	<MinimalLayout
		shortRequestId={shortRequestId}
		overrideTheme="onboarding-light"
	>
		<DiscoverOurApps />
	</MinimalLayout>
);
