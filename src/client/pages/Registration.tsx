import React from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainLayout } from '@/client/layouts/Main';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { SocialButtons } from '@/client/components/SocialButtons';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import {
	GuardianTerms,
	JobsTerms,
	termsContainer,
} from '@/client/components/Terms';
import { LinkButton, SvgEnvelope } from '@guardian/source-react-components';
import { css } from '@emotion/react';
import { space } from '@guardian/source-foundations';

const emailButton = css`
	width: 100%;
	justify-content: center;
`;

const registrationButtons = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: ${space[3]}px;
`;

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
		<MainLayout tabs={tabs}>
			<RegistrationTerms isJobs={isJobs} />
			<div css={registrationButtons}>
				<SocialButtons
					queryParams={queryParams}
					marginTop={true}
					context="Sign up"
				/>
				<LinkButton
					icon={<SvgEnvelope />}
					cssOverrides={emailButton}
					priority="tertiary"
					href={buildUrlWithQueryParams('/register/email', {}, queryParams)}
				>
					Sign up with email
				</LinkButton>
			</div>
		</MainLayout>
	);
};
