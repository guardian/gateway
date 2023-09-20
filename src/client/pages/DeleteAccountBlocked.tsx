import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';
import { DeleteAccountReturnLink } from '@/client/components/DeleteAccountReturnLink';
import { UserAttributesResponse } from '@/shared/lib/members-data-api';

interface Props {
	contentAccess?: Partial<UserAttributesResponse['contentAccess']>;
}

export const DeleteAccountBlocked = ({ contentAccess = {} }: Props) => {
	const hasSubscription =
		contentAccess.digitalPack ||
		contentAccess.paperSubscriber ||
		contentAccess.guardianWeeklySubscriber;

	return (
		<MainLayout pageHeader="Delete your Guardian account">
			<MainBodyText>
				We&apos;ve noticed you have an active membership, recurring contribution
				or subscription with the Guardian, so you won&apos;t be able to
				automatically delete your account online. Please follow the instructions
				below first and try again if you would still like delete your account.
			</MainBodyText>

			{(contentAccess.member || contentAccess.paidMember) && (
				<>
					<MainBodyText noMarginBottom>
						<b>You have an active membership</b>
					</MainBodyText>
					<MainBodyText>
						You must first cancel your membership before you can delete your
						account online. To cancel your membership please{' '}
						<ExternalLink href={locations.MEMBERSHIP_CANCEL}>
							click here
						</ExternalLink>
						.
					</MainBodyText>
				</>
			)}

			{contentAccess.recurringContributor && (
				<>
					<MainBodyText noMarginBottom>
						<b>You have a recurring contribution</b>
					</MainBodyText>
					<MainBodyText>
						You must first cancel your recurring contribution before you can
						delete your account online. To cancel this please{' '}
						<ExternalLink href={locations.CONTRIBUTION_CANCEL}>
							click here
						</ExternalLink>
						.
					</MainBodyText>
				</>
			)}

			{hasSubscription && (
				<>
					{contentAccess.digitalPack && (
						<>
							<MainBodyText noMarginBottom>
								<b>You have an active Digital Pack subscription</b>
							</MainBodyText>
						</>
					)}

					{contentAccess.paperSubscriber && (
						<>
							<MainBodyText noMarginBottom>
								<b>
									You have an active print subscription to one of our newspapers
								</b>
							</MainBodyText>
						</>
					)}
					{contentAccess.guardianWeeklySubscriber && (
						<>
							<MainBodyText noMarginBottom>
								<b>
									You have an active print subscription to the Guardian Weekly
								</b>
							</MainBodyText>
						</>
					)}
					<MainBodyText>
						You cannot delete your account while you have an active
						subscription. If you would like to cancel your subscription, please
						email the Subscriptions Team at{' '}
						<ExternalLink href="mailto:customer.help@theguardian.com">
							customer.help@theguardian.com
						</ExternalLink>
						.
					</MainBodyText>
				</>
			)}
			<DeleteAccountReturnLink />
		</MainLayout>
	);
};
