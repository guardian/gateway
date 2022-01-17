import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

interface Props {
  noAccountInfo?: boolean;
  formTrackingName?: string;
}

export const EmailSentPage = ({ noAccountInfo, formTrackingName }: Props) => {
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

  const queryString = buildQueryParamsString(queryParams, {
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
      formTrackingName={formTrackingName}
    />
  );
};
