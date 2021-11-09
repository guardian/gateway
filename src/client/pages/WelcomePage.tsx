import React, { useContext, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Routes } from '@/shared/model/Routes';
import { Welcome } from '@/client/pages/Welcome';

export const WelcomePage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email, fieldErrors = [], tokenExpiryTimestamp } = {} } =
    clientState;
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    // we only want this to run in the browser as window is not
    // defined on the server
    // and we also check that the expiry time exists so that
    // we redirect to the session expired page
    // if the token expires while the user is on the current page
    if (typeof window !== 'undefined' && tokenExpiryTimestamp) {
      setTimeout(() => {
        window.location.replace(`${Routes.WELCOME}${Routes.EXPIRED}`);
      }, tokenExpiryTimestamp - Date.now());
    }
  }, []);

  return (
    <Welcome
      submitUrl={`${Routes.WELCOME}/${token}${search}`}
      email={email}
      fieldErrors={fieldErrors}
    />
  );
};
