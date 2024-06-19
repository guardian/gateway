import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { LinkButton } from '@guardian/source/react-components';
import { primaryButtonStyles } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';

type Props = {
	queryParams: QueryParams;
};

export const PasscodeUsed = ({ queryParams }: Props) => {
	return (
		<MinimalLayout
			pageHeader="Email verified"
			imageId="email"
			leadText="Your email has already been verified. Continue to finish creating your account."
		>
			<LinkButton
				css={primaryButtonStyles()}
				href={buildUrlWithQueryParams('/welcome/password', {}, queryParams)}
				priority="primary"
			>
				Complete creating account
			</LinkButton>
		</MinimalLayout>
	);
};
