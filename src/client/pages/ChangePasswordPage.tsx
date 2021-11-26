import React, { useContext, useEffect } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { useParams } from 'react-router-dom';
import { ClientStateContext } from '@/client/components/ClientState';
import { Routes } from '@/shared/model/Routes';
import { ChangePassword } from '@/client/pages/ChangePassword';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

export const ChangePasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData: { email = '', fieldErrors = [], tokenExpiryTimestamp } = {},
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
        window.location.replace(buildUrl(`${Routes.RESET}${Routes.EXPIRED}`));
      }, tokenExpiryTimestamp - Date.now());
    }
  }, [tokenExpiryTimestamp]);

  return (
    <ChangePassword
      headerText="Reset password"
      buttonText="Confirm new password"
      submitUrl={buildUrlWithQueryParams(
        `${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`,
        {
          token: token,
        },
        queryParams,
      )}
      email={email}
      fieldErrors={fieldErrors}
    />
  );
};
