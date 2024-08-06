import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SubscriptionError } from '@/client/pages/SubscriptionError';
import type { SubscriptionAction } from '@/shared/lib/subscriptions';

interface Props {
	action: SubscriptionAction;
}

export const SubscriptionErrorPage = ({ action }: Props) => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
	const { accountManagementUrl } = pageData;
	return (
		<SubscriptionError
			accountManagementUrl={accountManagementUrl}
			action={action}
		/>
	);
};
