import React from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { GuardianTerms, JobsTerms } from '@/client/components/Terms';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { MainBodyText } from '@/client/components/MainBodyText';
import { divider } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { InformationBox } from '@/client/components/InformationBox';
import ThemedLink from '@/client/components/ThemedLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

export type RegistrationProps = {
	email?: string;
	recaptchaSiteKey?: string;
	queryParams: QueryParams;
	formError?: string;
};

const RegistrationTerms = ({ isJobs }: { isJobs: boolean }) => (
	<InformationBox>
		{!isJobs && <GuardianTerms />}
		{isJobs && <JobsTerms />}
	</InformationBox>
);

export const Registration = ({ queryParams }: RegistrationProps) => {
	const formTrackingName = 'register';

	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';

	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			pageHeader="Create a free account"
			leadText="One account to access all Guardian products."
		>
			<RegistrationTerms isJobs={isJobs} />
			<AuthProviderButtons
				queryParams={queryParams}
				providers={['social', 'email']}
			/>
			<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
			<MainBodyText>
				Already have an account?{' '}
				<ThemedLink href={buildUrlWithQueryParams('/signin', {}, queryParams)}>
					Sign in
				</ThemedLink>
			</MainBodyText>
		</MinimalLayout>
	);
};
