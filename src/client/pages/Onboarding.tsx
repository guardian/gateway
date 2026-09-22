import { MinimalLayout } from '@/client/layouts/MinimalLayout';

export interface OnboardingProps {
	shortRequestId?: string;
}

export const Onboarding = ({ shortRequestId }: OnboardingProps) => (
	<MinimalLayout
		shortRequestId={shortRequestId}
		pageHeader="Welcome to the Guardian"
		leadText="Thank you for signing up."
		imageId="welcome"
		overrideTheme="onboarding-light"
	>
		<p> Newsletters</p>
	</MinimalLayout>
);
