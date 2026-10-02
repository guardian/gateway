import { WideHeaderLayout } from '../layouts/WideHeaderLayout';

export interface OnboardingProps {
	shortRequestId?: string;
}

export const Onboarding = ({ shortRequestId }: OnboardingProps) => (
	<WideHeaderLayout
		shortRequestId={shortRequestId}
		pageHeader="Welcome to the Guardian"
		leadText="Thank you for signing up."
		imageId="welcome"
		overrideTheme="onboarding-light"
	>
		<p> Newsletters</p>
	</WideHeaderLayout>
);
