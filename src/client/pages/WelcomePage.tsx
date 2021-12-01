import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

import { Welcome } from '@/client/pages/Welcome';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

export const WelcomePage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData: { email, fieldErrors = [], tokenExpiryTimestamp } = {},
    queryParams,
  } = clientState;
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    // we only want this to run in the browser as window is not
    // defined on the server
    // and we also check that the expiry time exists so that
    // we redirect to the session expired page
    // if the token expires while the user is on the current page
    if (typeof window !== 'undefined' && tokenExpiryTimestamp) {
      setTimeout(() => {
        window.location.replace(buildUrl('/welcome/expired'));
      }, tokenExpiryTimestamp - Date.now());
    }
  }, [tokenExpiryTimestamp]);

  return (
    <Welcome
      submitUrl={buildUrlWithQueryParams(
        '/welcome/:token',
        { token },
        queryParams,
      )}
      email={email}
      fieldErrors={fieldErrors}
    />
  );
};
