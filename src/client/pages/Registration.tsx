import React from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainLayout } from '@/client/layouts/Main';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { GuardianTerms, JobsTerms } from '@/client/components/Terms';
import { Link } from '@guardian/source-react-components';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { MainBodyText } from '@/client/components/MainBodyText';
import { divider } from '@/client/styles/Shared';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { InformationBox } from '@/client/components/InformationBox';

export type RegistrationProps = {
	email?: string;
	recaptchaSiteKey?: string;
	queryParams: QueryParams;
	formError?: string;
};

const RegistrationTerms = ({ isJobs }: { isJobs: boolean }) => (
	<InformationBox withMarginTop>
		{!isJobs && <GuardianTerms />}
		{isJobs && <JobsTerms />}
	</InformationBox>
);

export const Registration = ({ queryParams }: RegistrationProps) => {
	const formTrackingName = 'register';

	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';

	usePageLoadOphanInteraction(formTrackingName);

	const tabs = generateSignInRegisterTabs({
		queryParams,
		isActive: 'register',
	});

	return (
		<MainLayout
			tabs={tabs}
			pageHeader="Register an account"
			pageSubText="One account to access all Guardian products."
		>
			<RegistrationTerms isJobs={isJobs} />
			<AuthProviderButtons
				queryParams={queryParams}
				marginTop={true}
				providers={['social', 'email']}
			/>
			{/* divider */}
			<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
			<MainBodyText>
				Already have an account?{' '}
				<Link href={buildUrlWithQueryParams('/signin', {}, queryParams)}>
					Sign in
				</Link>
			</MainBodyText>
		</MainLayout>
	);
};
