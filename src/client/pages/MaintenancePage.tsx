import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import useClientState from '@/client/lib/hooks/useClientState';

export const MaintenancePage = () => {
	const { shortRequestId } = useClientState();
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="We’ll be back soon"
			leadText="Sorry for the inconvenience. We are currently performing some essential maintenance. Please try again later."
		/>
	);
};
