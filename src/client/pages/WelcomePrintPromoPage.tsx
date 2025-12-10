import { WelcomePrintPromo } from './WelcomePrintPromo';
import useClientState from '@/client/lib/hooks/useClientState';

export const WelcomePrintPromoPage = () => {
	const clientState = useClientState();
	const {
		shortRequestId,
		pageData: { continueLink = '', isRegistering = false } = {},
	} = clientState;

	return (
		<WelcomePrintPromo
			shortRequestId={shortRequestId}
			continueLink={continueLink}
			isRegistering={isRegistering}
		/>
	);
};
