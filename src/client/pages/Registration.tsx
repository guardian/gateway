import React from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainLayout } from '@/client/layouts/Main';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import {
	GuardianTerms,
	JobsTerms,
	termsContainer,
} from '@/client/components/Terms';

export type RegistrationProps = {
	email?: string;
	recaptchaSiteKey?: string;
	queryParams: QueryParams;
	formError?: string;
};

const RegistrationTerms = ({ isJobs }: { isJobs: boolean }) => (
	<div css={termsContainer}>
		{!isJobs && <GuardianTerms />}
		{isJobs && <JobsTerms />}
	</div>
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
				context="Sign up"
				providers={['social', 'email']}
			/>
		</MainLayout>
	);
};
