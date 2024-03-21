import React from 'react';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';
import { css } from '@emotion/react';
import { remSpace } from '@guardian/source-foundations';
import { RegistrationMarketingConsentFormField } from './RegistrationMarketingConsentFormField';
import { RegistrationNewsletterFormField } from './RegistrationNewsletterFormField';
import { GeoLocation } from '@/shared/model/Geolocation';

interface RegistrationConsentsProps {
	geolocation?: string;
	useIdapi?: boolean;
	noMarginBottom?: boolean;
}

const consentToggleCss = css`
	display: flex;
	flex-direction: column;
	gap: ${remSpace[3]};
	margin-top: ${remSpace[3]};
`;

export const RegistrationConsents = ({
	geolocation,
	useIdapi,
}: RegistrationConsentsProps) => {
	// don't show the Saturday Edition newsletter option for US and AUS
	const showSaturdayEdition = !(['US', 'AU'] as GeoLocation[]).some(
		(location: GeoLocation) => location === geolocation,
	);

	if (useIdapi) {
		return <></>;
	}

	return (
		<div css={consentToggleCss}>
			{showSaturdayEdition && (
				<RegistrationNewsletterFormField
					id={RegistrationNewslettersFormFields.saturdayEdition.id}
					title={`${RegistrationNewslettersFormFields.saturdayEdition.label} newsletter`}
					description={
						RegistrationNewslettersFormFields.saturdayEdition.context
					}
				/>
			)}
			<RegistrationMarketingConsentFormField
				id={RegistrationConsentsFormFields.similarGuardianProducts.id}
				description={
					RegistrationConsentsFormFields.similarGuardianProducts.label
				}
			/>
		</div>
	);
};
