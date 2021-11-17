import React, { ReactNode, useState } from 'react';
import { LinkButton } from '@guardian/source-react-components';
import { Routes } from '@/shared/model/Routes';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';

type ResendEmailVerificationProps = {
  email?: string;
  signInPageUrl?: string;
  successText?: string;
  recaptchaSiteKey?: string;
};

const LoggedOut = ({ signInPageUrl }: { signInPageUrl?: string }) => (
  <MainLayout pageTitle="Link Expired">
    <MainBodyText>Your email confirmation link has expired</MainBodyText>
    <MainBodyText noMargin>
      The link we sent you was valid for 30 minutes. Please sign in again and we
      will resend a verification email.
    </MainBodyText>
    <LinkButton css={buttonStyles({ halfWidth: true })} href={signInPageUrl}>
      Sign in
    </LinkButton>
  </MainLayout>
);

const LoggedIn = ({
  email,
  successText,
  recaptchaSiteKey,
}: {
  email: string;
  successText?: string;
  recaptchaSiteKey?: string;
}) => {
  const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
  const [recaptchaErrorContext, setRecaptchaErrorContext] =
    useState<ReactNode>(null);
  return (
    <MainLayout
      pageTitle="Verify Email"
      errorOverride={recaptchaErrorMessage}
      errorContext={recaptchaErrorContext}
    >
      <MainBodyText>
        You need to confirm your email address to continue securely:
      </MainBodyText>
      <MainBodyText>
        <b>{email}</b>
      </MainBodyText>
      <MainBodyText>
        We will send you a verification link to your email to ensure that it’s
        you. Please note that the link will expire in 30 minutes.
      </MainBodyText>
      <MainBodyText>
        If you don&apos;t see it in your inbox, please check your spam filter.
      </MainBodyText>
      {successText ? (
        <MainBodyText>{successText}</MainBodyText>
      ) : (
        <MainForm
          formAction={Routes.VERIFY_EMAIL}
          submitButtonText="Send verification link"
          recaptchaSiteKey={recaptchaSiteKey}
          setRecaptchaErrorMessage={setRecaptchaErrorMessage}
          setRecaptchaErrorContext={setRecaptchaErrorContext}
        >
          <EmailInput defaultValue={email} hidden hideLabel />
        </MainForm>
      )}
    </MainLayout>
  );
};

export const ResendEmailVerification = ({
  email,
  signInPageUrl,
  successText,
  recaptchaSiteKey,
}: ResendEmailVerificationProps) => {
  if (email) {
    return (
      <LoggedIn
        email={'test@email.com'}
        successText={successText}
        recaptchaSiteKey={recaptchaSiteKey}
      />
    );
  } else {
    return <LoggedOut signInPageUrl={signInPageUrl} />;
  }
};
