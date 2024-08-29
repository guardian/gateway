import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { NotFound } from '@/client/pages/NotFound';

export const NotFoundPage = () => {
	const { shortRequestId } = useClientState();
	return <NotFound shortRequestId={shortRequestId} />;
};
