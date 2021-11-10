import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

interface Props {
  noAccountInfoBox?: boolean;
  helpInfoBox?: boolean;
}

export const EmailSentPage = ({ noAccountInfoBox, helpInfoBox }: Props) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, queryParams, globalMessage = {} } = clientState;
  const { email, previousPage } = pageData;
  const { emailSentPage } = queryParams;
  const { error } = globalMessage;

  const queryString = addQueryParamsToPath('', queryParams, {
    emailSentPage: true,
  });

  return (
    <EmailSent
      email={email}
      previousPage={previousPage}
      resendEmailAction={previousPage}
      queryString={queryString}
      showSuccess={!!emailSentPage}
      errorMessage={error}
      noAccountInfoBox={noAccountInfoBox}
      helpInfoBox={helpInfoBox}
    />
  );
};
