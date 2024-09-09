import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { LinkButton } from '@guardian/source/react-components';
import { primaryButtonStyles } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { PasswordRoutePath } from '@/shared/model/Routes';

type Props = {
	path: PasswordRoutePath;
	queryParams: QueryParams;
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

export const PasscodeUsed = ({ path, queryParams }: Props) => {
	const { title, leadText, buttonText } = getText(path);
	return (
		<MinimalLayout pageHeader={title} imageId="email" leadText={leadText}>
			<LinkButton
				cssOverrides={primaryButtonStyles()}
				href={buildUrlWithQueryParams(`${path}/password`, {}, queryParams)}
				priority="primary"
			>
				{buttonText}
			</LinkButton>
		</MinimalLayout>
	);
};
