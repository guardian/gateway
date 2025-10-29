import { MinimalLayout } from '../layouts/MinimalLayout';
import { MainBodyText } from '../components/MainBodyText';

export type WelcomePrintPromoProps = {
	shortRequestId?: string;
};

export const WelcomePrintPromo = ({
	shortRequestId,
}: WelcomePrintPromoProps) => {
	return (
		<MinimalLayout
			pageHeader="You're signed in! Welcome to the Guardian"
			leadText={'Print Promo'}
			shortRequestId={shortRequestId}
		>
			<MainBodyText>Expect an email or discount code</MainBodyText>
		</MinimalLayout>
	);
};
