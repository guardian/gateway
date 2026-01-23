import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { WelcomeSocial } from '@/client/pages/WelcomeSocial';

type WelcomeSocialPageProps = {
	isGoogleOneTap?: boolean;
};

export const WelcomeSocialPage = ({
	isGoogleOneTap,
}: WelcomeSocialPageProps) => {
	const clientState = useClientState();
	const { pageData = {}, queryParams, shortRequestId } = clientState;
	const { formError } = pageData;

	return (
		<WelcomeSocial
			formError={formError}
			queryParams={queryParams}
			geolocation={pageData.geolocation}
			appName={pageData.appName}
			shortRequestId={shortRequestId}
			isGoogleOneTap={isGoogleOneTap}
		/>
	);
};
