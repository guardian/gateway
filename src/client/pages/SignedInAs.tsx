import React, { ReactNode, useEffect } from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { LinkButton } from '@guardian/source/react-components';
import { QueryParams } from '@/shared/model/QueryParams';
import { OpenIdErrors } from '@/shared/model/OpenIdErrors';
import {
	errorContextLastTypeSpacing,
	errorContextSpacing,
	primaryButtonStyles,
	secondaryButtonStyles,
} from '@/client/styles/Shared';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import ThemedLink from '@/client/components/ThemedLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

interface Props {
	email: string;
	continueLink: string;
	signOutLink: string;
	appName?: string;
	pageError?: string;
	queryParams?: QueryParams;
	shortRequestId?: string;
}

const DetailedLoginRequiredError = ({
	signOutLink,
}: {
	signOutLink: string;
}) => (
	<>
		<p css={errorContextSpacing}>
			If the problem persists please try the following:
		</p>
		<ul css={errorContextSpacing}>
			<li>
				<ThemedLink href={signOutLink}>Sign out</ThemedLink> and attempt to sign
				in again
			</li>
			<li>Clear browser cookies and cache</li>
		</ul>
		<p css={[errorContextSpacing, errorContextLastTypeSpacing]}>
			For further help please contact our customer service team at{' '}
			<ThemedLink href={locations.SUPPORT_EMAIL_MAILTO}>
				{SUPPORT_EMAIL}
			</ThemedLink>
		</p>
	</>
);

export const SignedInAs = ({
	email,
	continueLink,
	signOutLink,
	appName,
	pageError,
	queryParams,
	shortRequestId,
}: Props) => {
	const [errorContext, setErrorContext] = React.useState<
		ReactNode | undefined
	>();
	const { error: errorFromQueryParams } = queryParams || {};

	useEffect(() => {
		if (errorFromQueryParams === OpenIdErrors.LOGIN_REQUIRED) {
			setErrorContext(<DetailedLoginRequiredError signOutLink={signOutLink} />);
		}
	}, [errorFromQueryParams, signOutLink]);

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={`Sign in to the ${appName ? `${appName} app` : 'Guardian'}`}
			errorOverride={pageError}
			errorContext={errorContext}
			leadText={
				<MainBodyText>
					You are signed in with <strong>{email}</strong>
				</MainBodyText>
			}
		>
			<LinkButton cssOverrides={primaryButtonStyles()} href={continueLink}>
				Continue
			</LinkButton>
			<LinkButton
				cssOverrides={secondaryButtonStyles()}
				href={signOutLink}
				priority="tertiary"
			>
				Sign in with a different email
			</LinkButton>
		</MinimalLayout>
	);
};
