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
			pageHeader={'Something special is on its way'}
			leadText={'Thank you for verifying your account.'}
			shortRequestId={shortRequestId}
		>
			<MainBodyText>
				An email with your reward will arrive in your inbox soon.
			</MainBodyText>
			<ExternalLinkButton href={continueLink}>
				Return to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
