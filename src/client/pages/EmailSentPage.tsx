import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';

export const EmailSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { email, previousPage, subTitle } = pageData;

  return (
    <EmailSent email={email} subTitle={subTitle} previousPage={previousPage} />
  );
};
