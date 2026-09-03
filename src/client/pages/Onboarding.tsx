import { MinimalLayout } from '@/client/layouts/MinimalLayout';

export interface OnboardingProps {
	shortRequestId?: string;
}

export const Onboarding = ({ shortRequestId }: OnboardingProps) => (
	<MinimalLayout
		shortRequestId={shortRequestId}
		pageHeader="Welcome to the Guardian"
		overrideTheme="onboarding-light"
	/>
);
