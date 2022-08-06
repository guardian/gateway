import React, { ReactNode, useState } from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { TabType } from '@/client/components/Nav';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { SocialButtons } from '@/client/components/SocialButtons';
import { css } from '@emotion/react';
import { border, from, space } from '@guardian/source-foundations';

export type RegistrationProps = {
  email?: string;
  recaptchaSiteKey: string;
  queryParams: QueryParams;
};

const divider = css`
  /* Undoes the negative margin */
  margin-bottom: 0;
  margin-top: ${space[4]}px;
  ${from.mobileMedium} {
    margin-top: ${space[6]}px;
  }
  :before,
  :after {
    content: '';
    flex: 1 1;
    border-bottom: 1px solid ${border.secondary};
    margin: 8px;
  }
`;

export const Registration = ({
  email,
  recaptchaSiteKey,
  queryParams,
}: RegistrationProps) => {
  const formTrackingName = 'register';

  const { clientId } = queryParams;
  const isJobs = clientId === 'jobs';

  const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
  const [recaptchaErrorContext, setRecaptchaErrorContext] =
    useState<ReactNode>(null);

  const tabs: TabType[] = [
    {
      displayText: 'Sign in',
      linkTo: '/signin',
      queryParams: queryParams,
      isActive: false,
    },
    {
      displayText: 'Register',
      queryParams: queryParams,
      linkTo: '/register',
      isActive: true,
    },
  ];

  return (
    <MainLayout
      errorOverride={recaptchaErrorMessage}
      errorContext={recaptchaErrorContext}
      showErrorReportUrl={!!recaptchaErrorContext}
      tabs={tabs}
    >
      <MainForm
        formAction={buildUrlWithQueryParams('/register', {}, queryParams)}
        submitButtonText="Register"
        recaptchaSiteKey={recaptchaSiteKey}
        formTrackingName={formTrackingName}
        disableOnSubmit
        setRecaptchaErrorMessage={setRecaptchaErrorMessage}
        setRecaptchaErrorContext={setRecaptchaErrorContext}
        hasGuardianTerms={!isJobs}
        hasJobsTerms={isJobs}
      >
        <EmailInput defaultValue={email} />
      </MainForm>
      <Divider
        spaceAbove="loose"
        displayText="or continue with"
        cssOverrides={divider}
      />
      <SocialButtons queryParams={queryParams} />
    </MainLayout>
  );
};
