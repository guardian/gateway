import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

import { ChangePassword } from '@/client/pages/ChangePassword';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { logger } from '@/client/lib/clientSideLogger';

export const SetPasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData: { email = '', fieldErrors = [], timeUntilTokenExpiry } = {},
    queryParams,
  } = clientState;
  const { token } = useParams();

  useEffect(() => {
    // we only want this to run in the browser as window is not
    // defined on the server
    // and we also check that the expiry time exists so that
    // we redirect to the session expired page
    // if the token expires while the user is on the current page
    if (typeof window !== 'undefined' && timeUntilTokenExpiry) {
      logger.info(`Set password page: loaded successfully`, undefined, {
        timeUntilTokenExpiry,
      });
      setTimeout(() => {
        logger.info(
          `Set password page: redirecting to token expired page`,
          undefined,
          { timeUntilTokenExpiry },
        );
        window.location.replace(buildUrl('/set-password/expired'));
      }, timeUntilTokenExpiry);
    }
  }, [timeUntilTokenExpiry]);

  return (
    <ChangePassword
      headerText="Create password"
      buttonText="Save password"
      submitUrl={buildUrlWithQueryParams(
        '/set-password/:token',
        { token },
        queryParams,
      )}
      email={email}
      fieldErrors={fieldErrors}
    />
  );
};
