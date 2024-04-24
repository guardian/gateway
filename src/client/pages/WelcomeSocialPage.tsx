import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { WelcomeSocial } from '@/client/pages/WelcomeSocial';
import { SocialProvider } from '@/shared/model/Social';

type WelcomeSocialPageProps = {
	socialProvider: SocialProvider;
};

export const WelcomeSocialPage = ({
	socialProvider,
}: WelcomeSocialPageProps) => {
	const clientState = useClientState();
	const { pageData = {}, queryParams } = clientState;
	const { formError } = pageData;

	return (
		<WelcomeSocial
			formError={formError}
			queryParams={queryParams}
			socialProvider={socialProvider}
			geolocation={pageData.geolocation}
			appName={pageData.appName}
		/>
	);
};
