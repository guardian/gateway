import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

interface Props {
  noAccountInfo?: boolean;
}

export const EmailSentPage = ({ noAccountInfo }: Props) => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData = {},
    queryParams,
    globalMessage = {},
    recaptchaConfig,
  } = clientState;
  const { email, previousPage } = pageData;
  const { emailSentSuccess } = queryParams;
  const { error } = globalMessage;
  const { recaptchaSiteKey } = recaptchaConfig;

  const queryString = addQueryParamsToPath('', queryParams, {
    emailSentSuccess: true,
  });

  return (
    <EmailSent
      email={email}
      previousPage={previousPage}
      resendEmailAction={previousPage}
      queryString={queryString}
      showSuccess={emailSentSuccess}
      errorMessage={error}
      noAccountInfo={noAccountInfo}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
};
