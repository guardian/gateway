import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import {
	GuardianTerms,
	JobsTerms,
	termsContainer,
} from '@/client/components/Terms';
import { CmpConsentedStateHiddenInput } from '@/client/components/CmpConsentStateHiddenInput';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';
import { MarketingToggle } from '@/client/components/MarketingToggle';
import { RegistrationProps } from './Registration';

const RegistrationTerms = ({ isJobs }: { isJobs: boolean }) => (
	<div css={termsContainer}>
		{!isJobs && <GuardianTerms />}
		{isJobs && <JobsTerms />}
	</div>
);

export const RegisterWithEmail = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
}: RegistrationProps) => {
	const formTrackingName = 'register';
	// Marketing is opt-out, so we default to true
	const [marketing, setMarketing] = React.useState(true);

	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';

	usePageLoadOphanInteraction(formTrackingName);
	const hasCmpConsent = useCmpConsent();

	const tabs = generateSignInRegisterTabs({
		queryParams,
		isActive: 'register',
	});

	return (
		<MainLayout tabs={tabs}>
			<RegistrationTerms isJobs={isJobs} />
			<MainForm
				formAction={buildUrlWithQueryParams('/register', {}, queryParams)}
				submitButtonText="Register"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
			>
				<EmailInput defaultValue={email} autoComplete="off" />
				<CmpConsentedStateHiddenInput cmpConsentedState={hasCmpConsent} />

				{/* Hidden input to store the marketing preference, as the Toggle component is a <button> */}
				<input
					type="hidden"
					name="marketing"
					value={marketing ? 'true' : 'false'}
				/>

				<MarketingToggle
					id="marketing"
					title="Stay up-to-date"
					description="Receive information on further ways to read and support our journalism"
					labelBorder
					selected={marketing}
					onClick={() => setMarketing(!marketing)}
				/>
			</MainForm>
		</MainLayout>
	);
};
