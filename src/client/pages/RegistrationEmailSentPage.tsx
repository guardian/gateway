import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';

export const RegistrationEmailSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { email, ref: refValue, refViewId, returnUrl } = pageData;

  return (
    <EmailSent
      email={email}
      previousPage={'/signin'}
      resendEmailAction={'/register/email-sent/resend'}
      refValue={refValue}
      refViewId={refViewId}
      returnUrl={returnUrl}
    />
  );
};
