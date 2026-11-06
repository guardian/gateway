import useClientState from '@/client/lib/hooks/useClientState';
import { Onboarding } from '@/client/pages/Onboarding';

export const OnboardingPage = () => {
	const { shortRequestId, queryParams } = useClientState();
	return (
		<Onboarding shortRequestId={shortRequestId} queryParams={queryParams} />
	);
};
