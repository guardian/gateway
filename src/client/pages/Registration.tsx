import React from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import {
	AuthButtonProvider,
	AuthProviderButtons,
} from '@/client/components/AuthProviderButtons';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { GuardianTerms } from '@/client/components/Terms';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { MainBodyText } from '@/client/components/MainBodyText';
import { divider } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { InformationBox } from '@/client/components/InformationBox';
import ThemedLink from '@/client/components/ThemedLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

import { GatewayError } from '@/shared/model/Errors';
import { CookiesInTheBrowser } from '../components/CookiesInTheBrowser';

export type RegistrationProps = {
	email?: string;
	recaptchaSiteKey?: string;
	queryParams: QueryParams;
	formError?: GatewayError;
	shortRequestId?: string;
};

const RegistrationTerms = () => (
	<InformationBox>
		<GuardianTerms />
	</InformationBox>
);

export const Registration = ({
	queryParams,
	shortRequestId,
}: RegistrationProps) => {
	const formTrackingName = 'register';

	const isPrintPromo = queryParams.clientId === 'printpromo';

	const providers = (): AuthButtonProvider[] => {
		if (isPrintPromo) {
			return ['email'];
		}
		return ['social', 'email'];
	};

	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={
				isPrintPromo ? 'Register for your reward' : 'Create a free account'
			}
			leadText={
				isPrintPromo
					? 'Create your account to receive your reward and access free Guardian newsletters.'
					: 'One account to access all Guardian products.'
			}
		>
			<RegistrationTerms />
			<AuthProviderButtons queryParams={queryParams} providers={providers()} />
			<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
			<MainBodyText>
				Already have an account?{' '}
				<ThemedLink href={buildUrlWithQueryParams('/signin', {}, queryParams)}>
					Sign in
				</ThemedLink>
			</MainBodyText>
			<CookiesInTheBrowser />
		</MinimalLayout>
	);
};
