import React, { ReactNode, useEffect } from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { LinkButton } from '@guardian/source-react-components';
import { QueryParams } from '@/shared/model/QueryParams';
import { OpenIdErrors } from '@/shared/model/OpenIdErrors';
import {
	errorContextSpacing,
	primaryButtonStyles,
} from '@/client/styles/Shared';
import { space } from '@guardian/source-foundations';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import Link from '../components/Link';
import { MinimalLayout } from '../layouts/MinimalLayout';

interface Props {
	email: string;
	continueLink: string;
	signOutLink: string;
	appName?: string;
	pageError?: string;
	queryParams?: QueryParams;
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
				<Link href={signOutLink}>Sign out</Link> and attempt to sign in again
			</li>
			<li>Clear browser cookies and cache</li>
		</ul>
		<p css={[errorContextSpacing, { marginBottom: `${space[3]}px` }]}>
			For further help please contact our customer service team at{' '}
			<Link href={locations.SUPPORT_EMAIL_MAILTO}>{SUPPORT_EMAIL}</Link>
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
			pageHeader={`Sign in to the ${appName ? `${appName} app` : 'Guardian'}`}
			errorOverride={pageError}
			errorContext={errorContext}
		>
			<MainBodyText>
				You are signed in with <br />
				<strong>{email}</strong>
			</MainBodyText>
			<LinkButton css={primaryButtonStyles} href={continueLink}>
				Continue
			</LinkButton>
			<MainBodyText>
				<Link href={signOutLink}>Sign in</Link> with a different email.
			</MainBodyText>
		</MinimalLayout>
	);
};
