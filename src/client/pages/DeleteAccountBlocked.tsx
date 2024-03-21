import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';
import { DeleteAccountReturnLink } from '@/client/components/DeleteAccountReturnLink';
import { UserAttributesResponse } from '@/shared/lib/members-data-api';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

interface Props {
	contentAccess?: Partial<UserAttributesResponse['contentAccess']>;
}

export const DeleteAccountBlocked = ({ contentAccess = {} }: Props) => {
	const hasSubscription =
		contentAccess.digitalPack ||
		contentAccess.paperSubscriber ||
		contentAccess.guardianWeeklySubscriber;

	return (
		<MinimalLayout pageHeader="Delete your Guardian account">
			<MainBodyText>
				We&apos;ve noticed you have an active membership, recurring contribution
				or subscription with the Guardian, so you won&apos;t be able to
				automatically delete your account online. Please follow the instructions
				below first and try again if you would still like delete your account.
			</MainBodyText>

			{(contentAccess.member || contentAccess.paidMember) && (
				<>
					<MainBodyText>
						<strong>You have an active membership</strong>
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
					<MainBodyText>
						<strong>You have a recurring contribution</strong>
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
							<MainBodyText>
								<strong>You have an active Digital Pack subscription</strong>
							</MainBodyText>
						</>
					)}

					{contentAccess.paperSubscriber && (
						<>
							<MainBodyText>
								<strong>
									You have an active print subscription to one of our newspapers
								</strong>
							</MainBodyText>
						</>
					)}
					{contentAccess.guardianWeeklySubscriber && (
						<>
							<MainBodyText>
								<strong>
									You have an active print subscription to the Guardian Weekly
								</strong>
							</MainBodyText>
						</>
					)}
					<MainBodyText>
						You cannot delete your account while you have an active
						subscription. If you would like to cancel your subscription, please
						email the Subscriptions Team at{' '}
						<ExternalLink href={locations.SUPPORT_EMAIL_MAILTO}>
							{SUPPORT_EMAIL}
						</ExternalLink>
					</MainBodyText>
				</>
			)}
			<DeleteAccountReturnLink />
		</MinimalLayout>
	);
};
