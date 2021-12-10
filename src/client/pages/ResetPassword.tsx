import React, { PropsWithChildren, ReactNode, useState } from 'react';

import { MainLayout } from '@/client/layouts/Main';
import {
  belowFormMarginTopSpacingStyle,
  MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { MainBodyText } from '@/client/components/MainBodyText';
import { InfoSummary } from '@guardian/source-react-components-development-kitchen';
import locations from '@/shared/lib/locations';
import { ExternalLink } from '@/client/components/ExternalLink';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';

interface ResetPasswordProps {
  email?: string;
  headerText: string;
  buttonText: string;
  queryString: QueryParams;
  formActionOverride?: string;
  emailInputLabel?: string;
  showNoAccessEmail?: boolean;
  showRecentEmailSummary?: boolean;
  recaptchaSiteKey?: string;
}

export const ResetPassword = ({
  email = '',
  headerText,
  buttonText,
  queryString,
  formActionOverride,
  emailInputLabel,
  showNoAccessEmail,
  showRecentEmailSummary,
  children,
  recaptchaSiteKey,
}: PropsWithChildren<ResetPasswordProps>) => {
  const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
  const [recaptchaErrorContext, setRecaptchaErrorContext] =
    useState<ReactNode>(null);

  return (
    <MainLayout
      pageHeader={headerText}
      errorContext={recaptchaErrorContext}
      errorOverride={recaptchaErrorMessage}
    >
      {children}
      <MainForm
        formAction={
          formActionOverride
            ? addQueryParamsToUntypedPath(formActionOverride, queryString)
            : buildUrlWithQueryParams('/reset', {}, queryString)
        }
        submitButtonText={buttonText}
        recaptchaSiteKey={recaptchaSiteKey}
        setRecaptchaErrorMessage={setRecaptchaErrorMessage}
        setRecaptchaErrorContext={setRecaptchaErrorContext}
      >
        <EmailInput label={emailInputLabel} defaultValue={email} />
      </MainForm>
      {showNoAccessEmail && (
        <MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
          If you no longer have access to this email account please{' '}
          <ExternalLink subdued href={locations.REPORT_ISSUE}>
            contact our help department
          </ExternalLink>
        </MainBodyText>
      )}
      {showRecentEmailSummary && (
        <InfoSummary
          cssOverrides={belowFormMarginTopSpacingStyle}
          message="Please make sure that you are opening the most recent email we sent."
          context={
            <>
              If you are having trouble, please contact our customer service
              team at{' '}
              <ExternalLink subdued href={locations.REPORT_ISSUE}>
                userhelp@guardian.com
              </ExternalLink>
            </>
          }
        />
      )}
    </MainLayout>
  );
};
