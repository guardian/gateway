import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { WelcomeSocial } from './WelcomeSocial';
import { SocialProvider } from '@/shared/model/Social';

type WelcomeSocialPageProps = {
	socialProvider: SocialProvider;
};

export const WelcomeSocialPage = ({
	socialProvider,
}: WelcomeSocialPageProps) => {
	const clientState = useClientState();
	const { pageData = {}, queryParams } = clientState;
	const { formError, isNativeApp } = pageData;

	return (
		<WelcomeSocial
			formError={formError}
			queryParams={queryParams}
			socialProvider={socialProvider}
			isNativeApp={isNativeApp}
			geolocation={pageData.geolocation}
		/>
	);
};
