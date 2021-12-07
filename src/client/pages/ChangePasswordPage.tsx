import React, { useContext, useEffect } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { useParams } from 'react-router-dom';
import { ClientStateContext } from '@/client/components/ClientState';
import { ChangePassword } from '@/client/pages/ChangePassword';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

export const ChangePasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData: { email = '', fieldErrors = [], timeUntilTokenExpiry } = {},
    queryParams,
  } = clientState;
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    // we only want this to run in the browser as window is not
    // defined on the server
    // and we also check that the expiry time exists so that
    // we redirect to the session expired page
    // if the token expires while the user is on the current page
    if (typeof window !== 'undefined' && timeUntilTokenExpiry) {
      setTimeout(() => {
        window.location.replace(buildUrl('/reset/expired'));
      }, timeUntilTokenExpiry);
    }
  }, [timeUntilTokenExpiry]);

  return (
    <ChangePassword
      headerText="Reset password"
      buttonText="Confirm new password"
      submitUrl={buildUrlWithQueryParams(
        '/reset-password/:token',
        { token },
        queryParams,
      )}
      email={email}
      fieldErrors={fieldErrors}
    />
  );
};
