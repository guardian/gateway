import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ChangePasswordComplete } from '@/client/pages/ChangePasswordComplete';

export const ChangePasswordCompletePage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { returnUrl } = pageData;
  return <ChangePasswordComplete returnUrl={returnUrl} />;
};
