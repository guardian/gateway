import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { QueryParams } from '@/shared/model/QueryParams';
import {
	primaryButtonStyles,
	secondaryButtonStyles,
} from '@/client/styles/Shared';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MainBodyText } from '../components/MainBodyText';

export interface WelcomeExistingProps {
	queryParams: QueryParams;
	accountManagementUrl?: string;
	email?: string;
}

export const WelcomeExisting = ({
	queryParams,
	email,
	accountManagementUrl = 'https://manage.theguardian.com',
}: WelcomeExistingProps) => {
	return (
		<MinimalLayout pageHeader="Welcome back. You're signed in!" centered={true}>
			<MainBodyText>
				We noticed you already have a Guardian account
				{email && (
					<>
						{' '}
						with <b>{email}</b>
					</>
				)}
				.
			</MainBodyText>
			<MainBodyText>
				You're now signed in and can access all the benefits of your Guardian
				account.
			</MainBodyText>
			<ExternalLinkButton
				cssOverrides={primaryButtonStyles()}
				href={queryParams.returnUrl}
			>
				Return to the Guardian
			</ExternalLinkButton>
			<ExternalLinkButton
				priority="tertiary"
				cssOverrides={secondaryButtonStyles()}
				href={accountManagementUrl}
			>
				Manage my Guardian account
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
