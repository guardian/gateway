import React, { useEffect } from 'react';
import { logger } from '@/client/lib/clientSideLogger';
import useClientState from '@/client/lib/hooks/useClientState';
import { ChangePassword } from '@/client/pages/ChangePassword';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

export const SetPasswordPage = () => {
	const clientState = useClientState();
	const {
		pageData: {
			email = '',
			fieldErrors = [],
			timeUntilTokenExpiry,
			formError,
			token,
			browserName,
		} = {},
		queryParams,
	} = clientState;

	useEffect(() => {
		// we only want this to run in the browser as window is not
		// defined on the server
		// and we also check that the expiry time exists so that
		// we redirect to the session expired page
		// if the token expires while the user is on the current page
		if (typeof window !== 'undefined' && timeUntilTokenExpiry) {
			logger.info(`Set password page: loaded successfully`, undefined, {
				timeUntilTokenExpiry,
			});
			setTimeout(() => {
				logger.info(
					`Set password page: redirecting to token expired page`,
					undefined,
					{ timeUntilTokenExpiry },
				);
				window.location.replace(buildUrl('/set-password/expired'));
			}, timeUntilTokenExpiry);
		}
	}, [timeUntilTokenExpiry]);

	return (
		<ChangePassword
			headerText="Create password"
			buttonText="Save password"
			submitUrl={buildUrlWithQueryParams(
				'/set-password/:token',
				{ token },
				queryParams,
			)}
			email={email}
			fieldErrors={fieldErrors}
			formError={formError}
			browserName={browserName}
		/>
	);
};
