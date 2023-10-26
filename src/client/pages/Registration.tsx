import React from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainLayout } from '@/client/layouts/Main';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { SocialButtons } from '@/client/components/SocialButtons';
import { socialButtonDivider } from '@/client/styles/Shared';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import {
	GuardianTerms,
	JobsTerms,
	termsContainer,
} from '@/client/components/Terms';
import { LinkButton } from '@guardian/source-react-components';
import { css } from '@emotion/react';

const emailButton = css`
	width: 100%;
	justify-content: center;
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
			<SocialButtons queryParams={queryParams} marginTop={true} />
			<Divider
				spaceAbove="tight"
				displayText="or"
				cssOverrides={socialButtonDivider}
			/>
			<LinkButton
				cssOverrides={emailButton}
				href={buildUrlWithQueryParams('/register/email', {}, queryParams)}
			>
				Register with email
			</LinkButton>
		</MainLayout>
	);
};
