import React from 'react';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from '@/client/pages/Registration';
import { SocialProvider } from '@/shared/model/Social';
import { GeoLocation } from '@/shared/model/Geolocation';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { RegistrationConsents } from '@/client/components/RegistrationConsents';
import { AppName } from '@/shared/lib/appNameUtils';
import { newsletterAdditionalTerms } from '@/shared/model/Newsletter';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

const headerMessage = (socialProvider: SocialProvider) => {
	if (socialProvider === 'google') {
		return 'Google account verified';
	}
	if (socialProvider === 'apple') {
		return 'Apple account verified';
	}
	return '';
};

export type WelcomeSocialProps = RegistrationProps & {
	socialProvider: SocialProvider;
	geolocation?: GeoLocation;
	appName?: AppName;
};

export const WelcomeSocial = ({
	queryParams,
	formError,
	socialProvider,
	geolocation,
	appName,
}: WelcomeSocialProps) => {
	const formTrackingName = 'register';

	usePageLoadOphanInteraction(formTrackingName);

	const isJobs = queryParams.clientId === 'jobs';

	return (
		<MinimalLayout pageHeader={headerMessage(socialProvider)}>
			<MainForm
				formAction={buildUrlWithQueryParams('/welcome/social', {}, queryParams)}
				submitButtonText="Confirm"
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				largeFormMarginTop
				onSubmit={(e) => {
					registrationFormSubmitOphanTracking(e.target as HTMLFormElement);
					return undefined;
				}}
				additionalTerms={newsletterAdditionalTerms}
			>
				<RegistrationConsents
					geolocation={geolocation}
					appName={appName}
					isJobs={isJobs}
				/>
			</MainForm>
		</MinimalLayout>
	);
};
