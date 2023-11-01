import React, { ReactNode, useEffect } from 'react';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { Link, LinkButton } from '@guardian/source-react-components';
import { IsNativeApp } from '@/shared/model/ClientState';
import { QueryParams } from '@/shared/model/QueryParams';
import { OpenIdErrors } from '@/shared/model/OpenIdErrors';
import { errorContextSpacing } from '@/client/styles/Shared';
import { space } from '@guardian/source-foundations';

interface Props {
	email: string;
	continueLink: string;
	signOutLink: string;
	isNativeApp?: IsNativeApp;
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
			<Link href="email:customer.help@theguardian.com">
				customer.help@theguardian.com
			</Link>
			.
		</p>
	</>
);

export const SignedInAs = ({
	email,
	continueLink,
	signOutLink,
	isNativeApp,
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
		<MainLayout
			pageHeader={`Sign in to the Guardian${!!isNativeApp ? ' app' : ''}`}
			errorOverride={pageError}
			errorSmallMarginBottom={!!pageError}
			errorContext={errorContext}
		>
			<MainBodyText noMarginBottom>
				You are signed in with <br />
				<b>{email}</b>.
			</MainBodyText>
			<LinkButton
				css={buttonStyles({
					halfWidth: true,
					halfWidthAtMobile: true,
					hasMarginBottom: true,
				})}
				href={continueLink}
			>
				Continue
			</LinkButton>
			<MainBodyText noMarginBottom>
				<Link href={signOutLink}>Sign in</Link> with a different email.
			</MainBodyText>
		</MainLayout>
	);
};
