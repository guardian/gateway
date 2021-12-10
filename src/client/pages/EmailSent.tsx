import React, { ReactNode, useState } from 'react';
import { Link } from '@guardian/source-react-components';
import { InfoSummary } from '@guardian/source-react-components-development-kitchen';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
  belowFormMarginTopSpacingStyle,
  MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { ExternalLink } from '@/client/components/ExternalLink';
import { css } from '@emotion/react';
import { buildUrl } from '@/shared/lib/routeUtils';

type Props = {
  email?: string;
  previousPage?: string;
  resendEmailAction?: string;
  queryString?: string;
  showSuccess?: boolean;
  errorMessage?: string;
  noAccountInfo?: boolean;
  recaptchaSiteKey?: string;
};

export const EmailSent = ({
  email,
  previousPage = '/',
  resendEmailAction,
  queryString,
  showSuccess,
  errorMessage,
  noAccountInfo,
  recaptchaSiteKey,
}: Props) => {
  const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
  const [recaptchaErrorContext, setRecaptchaErrorContext] =
    useState<ReactNode>(null);
  return (
    <MainLayout
      pageHeader="Check your email inbox"
      successOverride={showSuccess ? 'Email sent' : undefined}
      errorOverride={
        recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
      }
      errorContext={recaptchaErrorContext}
    >
      {email ? (
        <MainBodyText>
          We’ve sent an email to <b>{email}</b>.
        </MainBodyText>
      ) : (
        <MainBodyText>We’ve sent you an email.</MainBodyText>
      )}
      <MainBodyText>Please follow the instructions in this email.</MainBodyText>
      <MainBodyText>
        <b>The link is only valid for 30 minutes.</b>
      </MainBodyText>
      {previousPage && (
        <MainBodyText>
          Wrong email address?{' '}
          <Link subdued href={previousPage}>
            Change email address
          </Link>
          .
        </MainBodyText>
      )}
      {email && resendEmailAction && (
        <>
          <InfoSummary
            message="Didn’t receive an email?"
            context={
              <>
                If you can’t find the email in your inbox or spam folder, please
                click below and we will send you a new one.
                {noAccountInfo && (
                  <>
                    <br />
                    <b>
                      If you don’t receive an email within 2 minutes you may not
                      have an account.
                    </b>
                    <br />
                    Don’t have an account?{' '}
                    <Link subdued href={buildUrl('/register')}>
                      Register for free
                    </Link>
                  </>
                )}
              </>
            }
          />
          <MainForm
            formAction={`${resendEmailAction}${queryString}`}
            submitButtonText={'Resend email'}
            submitButtonPriority="tertiary"
            submitButtonHalfWidth
            recaptchaSiteKey={recaptchaSiteKey}
            setRecaptchaErrorContext={setRecaptchaErrorContext}
            setRecaptchaErrorMessage={setRecaptchaErrorMessage}
          >
            <EmailInput defaultValue={email} hidden hideLabel />
          </MainForm>
          <MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
            If you are still having trouble, contact our customer service team
            at{' '}
            <ExternalLink
              cssOverrides={css`
                font-weight: 700;
              `}
              subdued
              href="mailto:userhelp@theguardian.com"
            >
              userhelp@guardian.com
            </ExternalLink>
            .
          </MainBodyText>
        </>
      )}
    </MainLayout>
  );
};
