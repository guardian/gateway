import { WelcomePrintPromo } from './WelcomePrintPromo';
import useClientState from '@/client/lib/hooks/useClientState';

export const WelcomePrintPromoPage = () => {
	const clientState = useClientState();
	const { shortRequestId } = clientState;

	return <WelcomePrintPromo shortRequestId={shortRequestId} />;
};
