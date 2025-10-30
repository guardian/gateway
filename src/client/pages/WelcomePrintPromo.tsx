import { MinimalLayout } from '../layouts/MinimalLayout';
import { MainBodyText } from '../components/MainBodyText';
import { ExternalLinkButton } from '../components/ExternalLink';

export type WelcomePrintPromoProps = {
	shortRequestId?: string;
	continueLink?: string;
};

export const WelcomePrintPromo = ({
	shortRequestId,
	continueLink,
}: WelcomePrintPromoProps) => {
	return (
		<MinimalLayout
			pageHeader="You're signed in! Welcome to the Guardian"
			leadText={'Print Promo'}
			shortRequestId={shortRequestId}
		>
			<MainBodyText>Expect an email or discount code</MainBodyText>
			<ExternalLinkButton href={continueLink}>
				Return to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
