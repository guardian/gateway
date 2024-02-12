import React from 'react';
import { MainLayout, buttonStyles } from '../layouts/Main';
import { ExternalLinkButton } from '../components/ExternalLink';
import { QueryParams } from '@/shared/model/QueryParams';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

export type PasswordlessRegistrationCompleteProps = {
	queryParams: QueryParams;
};

export const PasswordlessRegistrationComplete = ({
	queryParams,
}: PasswordlessRegistrationCompleteProps) => {
	return (
		<MainLayout pageHeader="Registration Complete">
			<ExternalLinkButton
				css={buttonStyles({ halfWidth: true })}
				href={buildUrlWithQueryParams(
					'/register/passwordless/skip',
					{},
					queryParams,
				)}
			>
				Return to the Guardian
			</ExternalLinkButton>
			<ExternalLinkButton
				priority="subdued"
				css={buttonStyles({ halfWidth: true })}
				href={queryParams.returnUrl}
			>
				Or set a password
			</ExternalLinkButton>
		</MainLayout>
	);
};
