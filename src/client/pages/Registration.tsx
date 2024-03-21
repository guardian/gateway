import React from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { GuardianTerms, JobsTerms } from '@/client/components/Terms';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { MainBodyText } from '@/client/components/MainBodyText';
import { divider } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { InformationBox } from '@/client/components/InformationBox';
import Link from '../components/Link';
import { MinimalLayout } from '../layouts/MinimalLayout';

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
			pageSubText="One account to access all Guardian products."
		>
			<RegistrationTerms isJobs={isJobs} />
			<AuthProviderButtons
				queryParams={queryParams}
				providers={['social', 'email']}
			/>
			<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
			<MainBodyText>
				Already have an account?{' '}
				<Link href={buildUrlWithQueryParams('/signin', {}, queryParams)}>
					Sign in
				</Link>
			</MainBodyText>
		</MinimalLayout>
	);
};
