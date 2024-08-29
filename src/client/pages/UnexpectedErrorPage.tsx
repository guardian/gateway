import React from 'react';

import useClientState from '@/client/lib/hooks/useClientState';
import { UnexpectedError } from '@/client/pages/UnexpectedError';

export const UnexpectedErrorPage = () => {
	const { shortRequestId } = useClientState();
	return <UnexpectedError shortRequestId={shortRequestId} />;
};
