import React, { useState } from 'react';
import { RadioGroup, Radio } from '@guardian/source-react-components';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';
import { PasswordInput } from '@/client/components/PasswordInput';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { DeleteAccountReturnLink } from '@/client/components/DeleteAccountReturnLink';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { FieldError } from '@/shared/model/ClientState';
import { divider } from '@/client/styles/Shared';
import { MinimalLayout } from '../layouts/MinimalLayout';
import { textSans } from '@guardian/source-foundations';
import { css } from '@emotion/react';

interface Props {
	queryParams: QueryParams;
	fieldErrors?: FieldError[];
	formError?: string;
	error?: string;
}

const radioGroupStyles = css`
	label div {
		${textSans.small()}
	}
	legend div {
		${textSans.small({ fontWeight: 'bold' })}
	}
`;

export const DeleteAccount = ({
	queryParams,
	fieldErrors = [],
	formError,
	error,
}: Props) => {
	const [passwordError] = useState<string | undefined>(
		fieldErrors.find((fieldError) => fieldError.field === 'password')?.message,
	);

	return (
		<MinimalLayout
			pageHeader="Delete your Guardian account"
			errorOverride={error}
		>
			{/* Help Text */}
			<MainBodyText>
				Please read the following paragraphs carefully to understand how account
				deletion affects any Guardian products you may have. If at any point you
				require further clarification please visit our{' '}
				<ExternalLink href={locations.REPORT_ISSUE}>help centre</ExternalLink>.
			</MainBodyText>

			{/* Identity Account */}
			<MainBodyText>
				<ExternalLink href={locations.HELP}>
					<strong>Account</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				Deleting your account removes your personal information from our
				database.
			</MainBodyText>

			{/* Comments */}
			<MainBodyText>
				<ExternalLink href={locations.COMMENTS_HELP}>
					<strong>Comments</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				If you have posted comments your comment profile will be removed,
				however the posted comments will remain underneath the articles.
				Comments are part of the historical record, but if want your comments to
				be removed please contact the{' '}
				<ExternalLink href="mailto:moderation@theguardian.com">
					Moderation Team
				</ExternalLink>
				. Please note that requests are considered on a case-by-case basis and
				your comments will not be automatically deleted.
			</MainBodyText>
			<MainBodyText>
				If you have previously been banned, watched or premoderated due to
				inappropriate commenting behaviour, these restrictions will still be in
				place if you create a new account with the same email address.
			</MainBodyText>

			{/* Membership */}
			<MainBodyText>
				<ExternalLink href={locations.MEMBERSHIP_HELP}>
					<strong>Membership</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				Deleting your account does not cancel paid Membership. If you would like
				to cancel your membership please{' '}
				<ExternalLink href={locations.MEMBERSHIP_CANCEL}>
					click here.
				</ExternalLink>
			</MainBodyText>

			{/* Subscriptions */}
			<MainBodyText>
				<ExternalLink href={locations.SUBSCRIPTION_HELP}>
					<strong>Digital/Paper Subscriptions</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				Deleting your account does not cancel paid Subscriptions. If you would
				like to cancel your subscription, please email the{' '}
				<ExternalLink href="mailto:subscriptions@theguardian.com">
					Subscriptions Team.
				</ExternalLink>
			</MainBodyText>

			{/* In-App Purchases */}
			<MainBodyText>
				<ExternalLink href={locations.IN_APP_PURCHASES_HELP}>
					<strong>Guardian in-app purchases via App Stores</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				Deleting your account does not cancel Guardian in-app purchases made
				through Google, Apple or Amazon app stores. For further queries please
				contact respective App Store.
			</MainBodyText>

			{/* Jobs */}
			<MainBodyText>
				<ExternalLink href={locations.JOBS_HELP}>
					<strong>Guardian Jobs</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				Deleting your account will remove submitted applications, your profile
				information, CV, and job alerts.
			</MainBodyText>

			{/* Email Subscriptions */}
			<MainBodyText>
				<ExternalLink href={locations.EMAIL_SUBSCRIPTIONS_HELP}>
					<strong>Email Subscriptions</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				Deleting your account will unsubscribe you from all mailing lists. This
				may take up to 24 hours to take effect.
			</MainBodyText>

			{/* Saved for Later */}
			<MainBodyText>
				<ExternalLink href={locations.SAVED_FOR_LATER_HELP}>
					<strong>Saved for Later Articles</strong>
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				Deleting your account will delete your saved articles.
			</MainBodyText>

			{/* divider */}
			<Divider spaceAbove="tight" size="full" cssOverrides={divider} />

			{/* delete form */}
			<MainForm
				formAction={buildUrlWithQueryParams('/delete', {}, queryParams)}
				submitButtonText="Delete your account"
				formErrorMessageFromParent={formError}
				disableOnSubmit
			>
				{/* reason select */}
				<RadioGroup
					label="Please take a moment to tell us why you wish to delete your account:"
					name="reason"
					orientation="vertical"
					cssOverrides={radioGroupStyles}
				>
					<Radio
						label="I have created an account by accident"
						value="accident"
					/>
					<Radio
						label="I accidentally entered my password as the username"
						value="password"
					/>
					<Radio label="I want to stop receiving emails" value="emails" />
					<Radio label="I no longer want to comment" value="comments" />
					<Radio
						label="I am concerned about my privacy online"
						value="privacy"
					/>
					<Radio
						label="I was asked to create an account in order to become member/subscriber"
						value="membership"
					/>
					<Radio label="Other" value="other" />
				</RadioGroup>

				{/* divider */}
				<Divider spaceAbove="tight" size="full" cssOverrides={divider} />

				{/* password confirmation */}
				<MainBodyText>
					<strong>Confirm account deletion</strong>
				</MainBodyText>
				<MainBodyText>
					Please re-enter password to confirm the you have understood the
					conditions and would like to proceed with account deletion.
				</MainBodyText>
				{/* password input */}
				<PasswordInput
					error={passwordError}
					label="Password"
					autoComplete="current-password"
				/>
			</MainForm>
			<DeleteAccountReturnLink />
		</MinimalLayout>
	);
};
