import React from 'react';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { Link, LinkButton } from '@guardian/source-react-components';
import { IsNativeApp } from '@/shared/model/ClientState';

interface Props {
	email: string;
	continueLink: string;
	signOutLink: string;
	isNativeApp?: IsNativeApp;
	pageError?: string;
}

export const SignedInAs = ({
	email,
	continueLink,
	signOutLink,
	isNativeApp,
	pageError,
}: Props) => (
	<MainLayout
		pageHeader={`Sign in to the Guardian${!!isNativeApp ? ' app' : ''}`}
		errorOverride={pageError}
		errorSmallMarginBottom={!!pageError}
	>
		<MainBodyText noMargin>
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
		<MainBodyText noMargin>
			<Link href={signOutLink}>Sign in</Link> with a different email.
		</MainBodyText>
	</MainLayout>
);
