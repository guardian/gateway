import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ChangePassword } from '@/client/pages/ChangePassword';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { logger } from '@/client/lib/clientSideLogger';

export const ChangePasswordPage = () => {
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
			logger.info(`Change password page: loaded successfully`, undefined, {
				timeUntilTokenExpiry,
			});
			setTimeout(() => {
				// logging to debug scenarios where users are seeing an expired token page with a supposedly valid token.
				logger.info(
					`Change password page: redirecting to token expired page`,
					undefined,
					{
						timeUntilTokenExpiry,
					},
				);
				window.location.replace(buildUrl('/reset-password/expired'));
			}, timeUntilTokenExpiry);
		}
	}, [timeUntilTokenExpiry]);

	return (
		<ChangePassword
			formError={formError}
			headerText="Create new password"
			buttonText="Confirm password"
			submitUrl={buildUrlWithQueryParams(
				'/reset-password/:token',
				{ token },
				queryParams,
			)}
			email={email}
			fieldErrors={fieldErrors}
			browserName={browserName}
		/>
	);
};
