import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

interface Props {
  noAccountInfo?: boolean;
  formTrackingName?: string;
}

export const EmailSentPage = ({ noAccountInfo, formTrackingName }: Props) => {
  const clientState = useClientState();
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
