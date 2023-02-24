import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

interface Props {
  noAccountInfo?: boolean;
  formTrackingName?: string;
  showHelp?: boolean;
}

export const EmailSentPage = ({
  noAccountInfo,
  formTrackingName,
  showHelp,
}: Props) => {
  const clientState = useClientState();
  const {
    pageData = {},
    queryParams,
    globalMessage = {},
    recaptchaConfig,
  } = clientState;
  const { email, resendEmailAction, changeEmailPage, formError } = pageData;
  const { emailSentSuccess } = queryParams;
  const { error } = globalMessage;
  const { recaptchaSiteKey } = recaptchaConfig;

  const queryString = buildQueryParamsString(queryParams, {
    emailSentSuccess: true,
  });

  return (
    <EmailSent
      formError={formError}
      email={email}
      changeEmailPage={changeEmailPage}
      resendEmailAction={resendEmailAction}
      queryString={queryString}
      showSuccess={emailSentSuccess}
      errorMessage={error}
      noAccountInfo={noAccountInfo}
      recaptchaSiteKey={recaptchaSiteKey}
      formTrackingName={formTrackingName}
      showHelp={showHelp}
    />
  );
};
