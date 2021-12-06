import React, { ReactNode, useState } from 'react';
import { Routes } from '@/shared/model/Routes';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
  belowFormMarginTopSpacingStyle,
  MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { ExternalLink } from '@/client/components/ExternalLink';
import locations from '@/shared/lib/locations';

type Props = {
  email?: string;
  recaptchaSiteKey?: string;
};

export const MagicLink = ({ email, recaptchaSiteKey }: Props) => {
  const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
  const [recaptchaErrorContext, setRecaptchaErrorContext] =
    useState<ReactNode>(null);
  return (
    <MainLayout
      pageTitle="Link to sign in"
      errorOverride={recaptchaErrorMessage}
      errorContext={recaptchaErrorContext}
    >
      <MainBodyText>
        We can email you a one time link to sign into your account
      </MainBodyText>
      <MainForm
        formAction={Routes.MAGIC_LINK}
        submitButtonText="Email me a link"
        recaptchaSiteKey={recaptchaSiteKey}
        setRecaptchaErrorContext={setRecaptchaErrorContext}
        setRecaptchaErrorMessage={setRecaptchaErrorMessage}
      >
        <EmailInput defaultValue={email} />
      </MainForm>
      <MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
        If you no longer have access to this email account please{' '}
        <ExternalLink subdued href={locations.REPORT_ISSUE}>
          contact our help department
        </ExternalLink>
      </MainBodyText>
    </MainLayout>
  );
};
