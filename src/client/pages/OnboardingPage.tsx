import useClientState from '@/client/lib/hooks/useClientState';
import { Onboarding } from '@/client/pages/Onboarding';

export const OnboardingPage = () => {
	const { shortRequestId } = useClientState();
	return <Onboarding shortRequestId={shortRequestId} />;
};
