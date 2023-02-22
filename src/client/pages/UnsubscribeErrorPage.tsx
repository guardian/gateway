import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { UnsubscribeError } from '@/client/pages/UnsubscribeError';

export const UnsubscribeErrorPage = () => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { accountManagementUrl } = pageData;
  return <UnsubscribeError accountManagementUrl={accountManagementUrl} />;
};
