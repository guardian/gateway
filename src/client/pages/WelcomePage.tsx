import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';

import { Welcome } from '@/client/pages/Welcome';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { logger } from '@/client/lib/clientSideLogger';
import { useAB } from '@guardian/ab-react';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

export const WelcomePage = () => {
	const clientState = useClientState();
	const {
		pageData: {
			email,
			fieldErrors = [],
			timeUntilTokenExpiry,
			token,
			browserName,
		} = {},
		queryParams,
	} = clientState;
	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';

	const ABTestAPI = useAB();
	const isInAbSimplifyRegFlowTest = ABTestAPI.isUserInVariant(
		abSimplifyRegistrationFlowTest.id,
		abSimplifyRegistrationFlowTest.variants[0].id,
	);

	useEffect(() => {
		// we only want this to run in the browser as window is not
		// defined on the server
		// and we also check that the expiry time exists so that
		// we redirect to the session expired page
		// if the token expires while the user is on the current page
		if (typeof window !== 'undefined' && timeUntilTokenExpiry) {
			logger.info(`Welcome page: loaded successfully`, undefined, {
				timeUntilTokenExpiry,
			});
			setTimeout(() => {
				logger.info(
					`Welcome page: redirecting to token expired page`,
					undefined,
					{ timeUntilTokenExpiry },
				);
				window.location.replace(buildUrl('/welcome/expired'));
			}, timeUntilTokenExpiry);
		}
	}, [timeUntilTokenExpiry]);

	return (
		<Welcome
			submitUrl={buildUrlWithQueryParams(
				'/welcome/:token',
				{ token },
				queryParams,
			)}
			email={email}
			fieldErrors={fieldErrors}
			isJobs={isJobs}
			browserName={browserName}
			queryParams={queryParams}
			isInAbSimplifyRegFlowTest={isInAbSimplifyRegFlowTest}
		/>
	);
};
