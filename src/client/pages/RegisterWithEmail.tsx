import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { CmpConsentedStateHiddenInput } from '@/client/components/CmpConsentStateHiddenInput';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';
import { RegistrationProps } from './Registration';
import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import { MainBodyText } from '@/client/components/MainBodyText';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { divider } from '@/client/styles/Shared';
import { generateSignInRegisterTabs } from '@/client/components/Nav';

const { neutral } = palette;

const switchRow = css`
	border: 0;
	padding: 0;
	margin: ${space[2]}px 0 0 0;
	${textSans.medium()}
`;

const labelStyles = css`
	font-weight: bold;
	justify-content: space-between;
`;

const bottomDividerStyles = css`
	margin-top: ${space[4]}px;
	margin-bottom: ${space[6]}px;
`;

const supportingText = css`
	font-size: 15px;
	color: ${neutral[46]};
	margin-right: 54px;
`;

export const RegisterWithEmail = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
}: RegistrationProps) => {
	const formTrackingName = 'register';

	usePageLoadOphanInteraction(formTrackingName);

	const hasCmpConsent = useCmpConsent();

	const tabs = generateSignInRegisterTabs({
		queryParams,
		isActive: 'register',
	});

	return (
		<MainLayout tabs={tabs}>
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

				<Divider spaceAbove="tight" cssOverrides={divider} />
				<fieldset css={switchRow}>
					<ToggleSwitchInput
						id="marketing"
						label="Stay up-to-date"
						defaultChecked={true}
						cssOverrides={labelStyles}
					/>
				</fieldset>
				<MainBodyText noMarginBottom cssOverrides={supportingText}>
					Supporting the Guardian Information on our products and ways to enjoy
					and support our independent journalism
				</MainBodyText>
				<Divider
					spaceAbove="tight"
					cssOverrides={[divider, bottomDividerStyles]}
				/>
			</MainForm>
		</MainLayout>
	);
};
