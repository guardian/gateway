import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { Routes } from '@/shared/model/Routes';

export const RegistrationEmailSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { email, ref: refValue, refViewId, returnUrl } = pageData;

  return (
    <EmailSent
      email={email}
      subTitle={"We've sent you an email"}
      previousPage={`${Routes.SIGN_IN}`}
      resendEmailAction={`${Routes.REGISTRATION}${Routes.RESEND}`}
      refValue={refValue}
      refViewId={refViewId}
      returnUrl={returnUrl}
    />
  );
};
