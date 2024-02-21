import React from 'react';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';
import { css } from '@emotion/react';
import { space } from '@guardian/source-foundations';
import { RegistrationMarketingConsentFormField } from './RegistrationMarketingConsentFormField';
import { RegistrationNewsletterFormField } from './RegistrationNewsletterFormField';
import { GeoLocation } from '@/shared/model/Geolocation';

interface RegistrationConsentsProps {
	geolocation?: string;
	useIdapi?: boolean;
	noMarginBottom?: boolean;
}

const consentToggleCss = (noMarginBottom = false) => css`
	display: flex;
	margin-top: ${space[6]}px;
	${noMarginBottom ? 'margin-bottom: 0;' : `margin-bottom: ${space[4]}px;`}
	flex-direction: column;
	gap: ${space[3]}px;
`;

export const RegistrationConsents = ({
	geolocation,
	useIdapi,
	noMarginBottom,
}: RegistrationConsentsProps) => {
	// don't show the Saturday Edition newsletter option for US and AUS
	const showSaturdayEdition = !(['US', 'AU'] as GeoLocation[]).some(
		(location: GeoLocation) => location === geolocation,
	);

	if (useIdapi) {
		return <></>;
	}

	return (
		<div css={consentToggleCss(noMarginBottom)}>
			{showSaturdayEdition && (
				<RegistrationNewsletterFormField
					id={RegistrationNewslettersFormFields.saturdayEdition.id}
					label={`${RegistrationNewslettersFormFields.saturdayEdition.label} newsletter`}
					context={RegistrationNewslettersFormFields.saturdayEdition.context}
				/>
			)}
			<RegistrationMarketingConsentFormField
				id={RegistrationConsentsFormFields.similarGuardianProducts.id}
				label={RegistrationConsentsFormFields.similarGuardianProducts.label}
			/>
		</div>
	);
};
