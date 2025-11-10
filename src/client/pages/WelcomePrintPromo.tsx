import { MinimalLayout } from '../layouts/MinimalLayout';
import { MainBodyText } from '../components/MainBodyText';
import { ExternalLinkButton } from '../components/ExternalLink';

export type WelcomePrintPromoProps = {
	shortRequestId?: string;
	continueLink?: string;
	isRegistering?: boolean;
};

export const WelcomePrintPromo = ({
	shortRequestId,
	continueLink,
	isRegistering,
}: WelcomePrintPromoProps) => {
	return (
		<MinimalLayout
			pageHeader={
				isRegistering
					? 'Something special is on its way'
					: 'Drop us a line, something special is waiting for you'
			}
			leadText={'Thank you for verifying your account.'}
			shortRequestId={shortRequestId}
		>
			{isRegistering ? (
				<MainBodyText>
					An email with your reward will arrive in your inbox soon.
				</MainBodyText>
			) : (
				<MainBodyText>
					Send us an email with subject line “REWARD” to
					newspaper.reward@theguardian.com to receive your reward.
				</MainBodyText>
			)}
			<ExternalLinkButton href={continueLink}>
				Return to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
