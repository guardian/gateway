import React, { ReactNode, useState } from 'react';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { SocialButtons } from '@/client/components/SocialButtons';
import { socialButtonDivider } from '@/client/styles/Shared';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';

export type RegistrationProps = {
  email?: string;
  recaptchaSiteKey: string;
  queryParams: QueryParams;
};

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

  usePageLoadOphanInteraction(formTrackingName);

  const tabs = generateSignInRegisterTabs({
    queryParams,
    isActive: 'register',
  });

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
        cssOverrides={socialButtonDivider}
      />
      <SocialButtons queryParams={queryParams} />
    </MainLayout>
  );
};
