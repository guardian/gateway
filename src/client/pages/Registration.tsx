import React from 'react';
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
import {
  GuardianTerms,
  JobsTerms,
  termsContainer,
} from '@/client/components/Terms';
import { CmpConsentedStateHiddenInput } from '@/client/components/CmpConsentStateHiddenInput';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';
import { NoFacebookSupport } from '@/client/components/NoFacebookSupport';

export type RegistrationProps = {
  email?: string;
  recaptchaSiteKey: string;
  queryParams: QueryParams;
  formError?: string;
};

const RegistrationTerms = ({ isJobs }: { isJobs: boolean }) => (
  <div css={termsContainer}>
    {!isJobs && <GuardianTerms />}
    {isJobs && <JobsTerms />}
  </div>
);

export const Registration = ({
  email,
  recaptchaSiteKey,
  queryParams,
  formError,
}: RegistrationProps) => {
  const formTrackingName = 'register';

  const { clientId } = queryParams;
  const isJobs = clientId === 'jobs';

  usePageLoadOphanInteraction(formTrackingName);
  const hasCmpConsent = useCmpConsent();

  const tabs = generateSignInRegisterTabs({
    queryParams,
    isActive: 'register',
  });

  return (
    <MainLayout tabs={tabs}>
      <RegistrationTerms isJobs={isJobs} />
      <SocialButtons queryParams={queryParams} marginTop={true} />
      <Divider
        spaceAbove="loose"
        displayText="or continue with"
        cssOverrides={socialButtonDivider}
      />
      <MainForm
        formAction={buildUrlWithQueryParams('/register', {}, queryParams)}
        submitButtonText="Register"
        recaptchaSiteKey={recaptchaSiteKey}
        formTrackingName={formTrackingName}
        disableOnSubmit
        formErrorMessageFromParent={formError}
      >
        <EmailInput defaultValue={email} autoComplete="off" />
        <CmpConsentedStateHiddenInput cmpConsentedState={hasCmpConsent} />
      </MainForm>
      <NoFacebookSupport queryParams={queryParams} />
    </MainLayout>
  );
};
