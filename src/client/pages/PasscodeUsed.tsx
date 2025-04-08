import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { LinkButton } from '@guardian/source/react-components';
import { primaryButtonStyles } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { AllRoutes, PasswordRoutePath } from '@/shared/model/Routes';

type Props = {
	path: PasswordRoutePath;
	queryParams: QueryParams;
	shortRequestId?: string;
};

type Text = {
	title: string;
	leadText: string;
	buttonText: string;
};

const getText = (path: PasswordRoutePath): Text => {
	switch (path) {
		case '/welcome':
			return {
				title: 'Email verified',
				leadText:
					'Your email has already been verified. Continue to finish creating your account.',
				buttonText: 'Complete creating account',
			};
		default:
			return {
				title: 'Passcode verified',
				leadText:
					'Your passcode has already been verified. Continue to finish setting your password.',
				buttonText: 'Complete setting password',
			};
	}
};

export const PasscodeUsed = ({ path, queryParams, shortRequestId }: Props) => {
	const { title, leadText, buttonText } = getText(path);
	const { useSetPassword } = queryParams;

	// If its a passwordless new account, we want to redirect to the review page
	// instead of the password page.
	const hrefUrl: AllRoutes =
		!useSetPassword && path === '/welcome'
			? `/welcome/review`
			: `${path}/password`;
	return (
		<MinimalLayout
			pageHeader={title}
			imageId="email"
			leadText={leadText}
			shortRequestId={shortRequestId}
		>
			<LinkButton
				cssOverrides={primaryButtonStyles()}
				href={buildUrlWithQueryParams(hrefUrl, {}, queryParams)}
				priority="primary"
			>
				{buttonText}
			</LinkButton>
		</MinimalLayout>
	);
};
