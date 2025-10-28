import React from 'react';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from '@/client/pages/Registration';
import { GeoLocation } from '@/shared/model/Geolocation';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import {
	marketingConsentTerms,
	RegistrationConsents,
} from '@/client/components/RegistrationConsents';
import { AppName } from '@/shared/lib/appNameUtils';
import { newsletterAdditionalTerms } from '@/shared/model/Newsletter';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

export type WelcomeSocialProps = RegistrationProps & {
	geolocation?: GeoLocation;
	appName?: AppName;
	shortRequestId?: string;
};

export const WelcomeSocial = ({
	queryParams,
	formError,
	geolocation,
	appName,
	shortRequestId,
}: WelcomeSocialProps) => {
	const formTrackingName = 'register';

	usePageLoadOphanInteraction(formTrackingName);

	const isJobs = queryParams.clientId === 'jobs';

	return (
		<MinimalLayout
			pageHeader="You're signed in! Welcome to the Guardian."
			shortRequestId={shortRequestId}
			imageId="welcome"
		>
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
				additionalTerms={[
					newsletterAdditionalTerms,
					isJobs === false && marketingConsentTerms,
				].filter(Boolean)}
				shortRequestId={shortRequestId}
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
